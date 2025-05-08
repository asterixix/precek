import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
// Import readTextFile and readPdfFile along with getApiKeys
import { getApiKeys, readTextFile, readPdfFile } from "/src/utils/helpers";
// Import deleteData along with other database functions
import {
  getAllData,
  addData,
  clearAllData,
  exportToCSV,
  deleteData,
} from "/src/services/database";
import {
  processText,
  processImage,
  processAudio,
  processVideo,
} from "/src/services/multimediaProcessor";

// Material UI Components
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip"; // Import Tooltip

// Custom Components
import ApiKeyForm from "/src/components/ApiKeyForm";
import ProcessingControls from "/src/components/ProcessingControls";
import ProcessedDataDisplay from "/src/components/ProcessedDataDisplay";

function HomePage() {
  const [processedData, setProcessedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [showApiForm, setShowApiForm] = useState(false);
  // Remove googleFactCheck from initial state
  const [apiKeys, setApiKeys] = useState({ openai: "", openrouter: "" });
  const [keysConfigured, setKeysConfigured] = useState(false);

  // Check for API keys on mount
  useEffect(() => {
    const keys = getApiKeys();
    // Update check to only consider openai and openrouter
    const configured = !!(keys.openai || keys.openrouter);
    setApiKeys(keys);
    setKeysConfigured(configured);
    // Show form initially if keys are not configured
    setShowApiForm(!configured);
  }, []);

  // Fetch data from IndexedDB on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllData();
        setProcessedData(data || []);
      } catch (err) {
        console.error("Error fetching data from IndexedDB:", err);
        setError("Failed to load existing data.");
      }
    };
    fetchData();
  }, []);

  // Debounce result/error clearing
  useEffect(() => {
    if (result || error) {
      const timer = setTimeout(() => {
        setResult("");
        setError("");
      }, 5000); // Clear after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [result, error]);

  // Generic processing function
  const handleProcess = async (processor, input, type, originalName = null) => {
    setIsProcessing(true);
    setError("");
    setResult("");

    try {
      const currentApiKeys = getApiKeys(); // Get fresh API keys before processing
      setApiKeys(currentApiKeys); // Update state if necessary, though processor uses passed keys

      const response = await processor(input, type, currentApiKeys); // Pass fresh keys

      if (response && !response.success) {
        // Use the detailed message from the processor for throwing an error
        // The errorDetails might contain more technical info, message is more user-friendly
        setError(
          response.message ||
            response.errorDetails ||
            `Processing ${type} failed`
        );
      }

      // Use the success message from the processor if available
      setResult(
        response.message || `Successfully processed: ${originalName || input}`
      );

      // Fetch updated data *after* success message
      const updatedData = await getAllData();
      setProcessedData(updatedData || []);
    } catch (err) {
      console.error(`Error processing ${originalName || type || input}:`, err);
      // Check for specific error messages related to API keys
      if (
        err.message.includes("API key") &&
        (err.message.includes("invalid") ||
          err.message.includes("unauthorized") ||
          err.message.includes("401") ||
          err.message.includes("required"))
      ) {
        setError(
          `Authentication/Configuration Error: ${err.message}. Please check your API keys.`
        );
        setKeysConfigured(false);
        // Show form to update keys
        setShowApiForm(true);
      } else {
        setError(
          `Failed to process ${originalName || type || input}: ${
            err.message || "Unknown error"
          }`
        );
      }
    } finally {
      setIsProcessing(false); // Finish processing state update here
    }
  };

  // Specific handlers using the generic function
  const handleProcessText = (text) =>
    handleProcess(processText, text, "text input");
  const handleProcessImage = (file) =>
    handleProcess(processImage, file, "image", file.name);
  const handleProcessAudio = (file) =>
    handleProcess(processAudio, file, "audio", file.name);
  const handleProcessVideo = (file) =>
    handleProcess(processVideo, file, "video", file.name);

  // Handle processing text from a file
  const handleProcessTextFile = async (files) => {
    setIsProcessing(true);
    setError("");
    setResult("");

    let processedCount = 0;
    let errorCount = 0;
    const fileNames = Array.from(files)
      .map((f) => f.name)
      .join(", ");
    let firstErrorMessage = null; // Store the first critical error
    let processedSuccessfullyAtLeastOne = false;

    // Helper function to truncate text
    const truncateText = (text, maxLength) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    };

    const currentApiKeys = getApiKeys(); // Get fresh API keys once before the loop
    setApiKeys(currentApiKeys);

    for (const file of files) {
      try {
        let text = "";
        const lowerCaseName = file.name.toLowerCase();
        if (lowerCaseName.endsWith(".txt")) {
          // Now readTextFile is defined
          text = await readTextFile(file);
        } else if (lowerCaseName.endsWith(".pdf")) {
          // Now readPdfFile is defined
          text = await readPdfFile(file);
        } else {
          console.warn(`Skipping unsupported file type: ${file.name}`);
          continue;
        }

        if (!text || text.trim().length === 0) {
          console.warn(`Skipping empty or unreadable file: ${file.name}`);
          continue;
        }

        // Process the extracted text
        const response = await processText(text, file.name, currentApiKeys); // Pass fresh keys
        if (response && !response.success) {
          // Throw an error with the message from the processor
          throw new Error(
            response.message ||
              response.errorDetails ||
              `Processing failed for ${file.name}`
          );
        }
        processedCount++;
        processedSuccessfullyAtLeastOne = true;
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        errorCount++;
        if (!firstErrorMessage) firstErrorMessage = fileError.message; // Store the actual error message

        // Check for critical auth errors to stop processing further files
        if (
          fileError.message.includes("API key") &&
          (fileError.message.includes("invalid") ||
            fileError.message.includes("unauthorized") ||
            fileError.message.includes("401") ||
            fileError.message.includes("required"))
        ) {
          setError(
            `Authentication/Configuration Error: ${fileError.message}. Please check your API keys. Processing stopped.`
          );
          setKeysConfigured(false);
          setShowApiForm(true);
          break; // Stop processing on critical auth errors
        }
      }
    }

    // Update UI status messages *before* potentially fetching data
    if (processedCount > 0 && errorCount === 0) {
      // Use truncateText helper
      setResult(
        `Successfully processed ${processedCount} file(s): ${truncateText(
          fileNames,
          50
        )}`
      );
    } else if (processedCount > 0 && errorCount > 0) {
      setResult(
        `Partially completed: Processed ${processedCount} file(s) successfully.`
      );
      setError(
        `Encountered ${errorCount} error(s). First error: ${
          firstErrorMessage || "Unknown error"
        }`
      );
    } else if (errorCount > 0) {
      setError(
        `Failed to process any files. Encountered ${errorCount} error(s). First error: ${
          firstErrorMessage || "Unknown error"
        }`
      );
    } else if (processedCount === 0 && errorCount === 0 && files.length > 0) {
      setResult("No supported files found or all files were empty/unreadable.");
    } else if (files.length === 0) {
      setResult("No files selected.");
    }

    // Fetch updated data list *only if* at least one file was processed successfully
    // or if you always want to refresh regardless of errors (depends on desired behavior)
    if (processedSuccessfullyAtLeastOne || errorCount > 0) {
      try {
        const updatedData = await getAllData();
        setProcessedData(updatedData || []);
      } catch (fetchErr) {
        console.error(
          "Error fetching updated data after processing files:",
          fetchErr
        );
        setError((prev) =>
          prev
            ? `${prev} | Failed to refresh data list.`
            : "Failed to refresh data list."
        );
      }
    }

    setIsProcessing(false); // End processing state
  };

  // Export data
  const handleExportToCSV = async () => {
    try {
      const csvContent = await exportToCSV();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" }); // Ensure UTF-8
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "precek_data.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Clean up
      setResult("Data exported to CSV successfully");
    } catch (err) {
      console.error("Error exporting to CSV:", err);
      setError("Failed to export data to CSV");
    }
  };

  // Clear all data
  const handleClearData = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear ALL processed data? This cannot be undone."
      )
    ) {
      try {
        await clearAllData();
        setProcessedData([]);
        setResult("All data has been cleared");
        setError("");
      } catch (err) {
        console.error("Error clearing data:", err);
        setError("Failed to clear data");
      }
    }
  };

  // Handle deleting a single item
  const handleDeleteItem = async (id) => {
    // Optional: Add a confirmation dialog
    if (window.confirm(`Are you sure you want to delete item ID: ${id}?`)) {
      setIsProcessing(true); // Indicate activity
      setError("");
      setResult("");
      try {
        await deleteData(id);
        // Refresh the data list
        const updatedData = await getAllData();
        setProcessedData(updatedData || []);
        setResult(`Item ID: ${id} deleted successfully.`);
      } catch (err) {
        console.error(`Error deleting item ID: ${id}`, err);
        setError(`Failed to delete item ID: ${id}. ${err.message || ""}`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Callback when keys are saved in the form
  const handleKeysSaved = () => {
    const keys = getApiKeys(); // Re-fetch keys
    setApiKeys(keys);
    // Update check
    const configured = !!(keys.openai || keys.openrouter);
    setKeysConfigured(configured);
    setShowApiForm(false); // Hide form after saving
    setResult("API keys saved successfully!"); // Provide user feedback
  };

  // Handle changing API keys - Toggle the form visibility
  const handleChangeApiKeys = () => {
    setShowApiForm(prev => !prev); // Toggle the state
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1, sm: 2 } }}> {/* Responsive padding */}
      <Box component="header" sx={{ mb: 4, textAlign: 'center' }}> {/* Center header */}
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>Precek</Typography>
        <Typography variant="body1" color="text.secondary">Your text, image, audio and video as Data</Typography>
      </Box>
      {/* API Key Form Toggle/Display */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {/* Conditionally render Link or just the Button */}
        {processedData.length > 0 ? (
          <Link
            href="/visualization"
            passHref
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="contained"
              color="primary"
              size="medium"
              sx={{ borderRadius: 2, boxShadow: 1 }}
            >
              View Data Visualizations
            </Button>
          </Link>
        ) : (
          <Tooltip title="Process some data first to enable visualizations">
            {/* Span needed for Tooltip when button is disabled */}
            <span>
              <Button
                variant="contained"
                color="primary"
                size="medium"
                disabled // Disable the button
                sx={{ borderRadius: 2, boxShadow: 1 }}
              >
                View Data Visualizations
              </Button>
            </span>
          </Tooltip>
        )}

        {/* Button to change/hide keys - only show if keys are already configured */}
        {keysConfigured && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleChangeApiKeys} // This now correctly toggles
            sx={{ borderRadius: 2 }}
          >
            {showApiForm ? "Hide API Key Form" : "Change API Keys"}
          </Button>
        )}
      </Box>
      {/* Conditionally render API Key Form */}
      {showApiForm && (
        <ApiKeyForm
          onKeysSaved={handleKeysSaved}
          // Pass current keys if needed for initial values, ensure only relevant keys are passed
          initialKeys={{
            openai: apiKeys.openai,
            openrouter: apiKeys.openrouter,
          }}
        />
      )}
      {/* Processing Controls */}
      <ProcessingControls
        onProcessText={handleProcessText}
        onProcessTextFile={handleProcessTextFile}
        onProcessImage={handleProcessImage}
        onProcessAudio={handleProcessAudio}
        onProcessVideo={handleProcessVideo}
        isProcessing={isProcessing}
        keysConfigured={keysConfigured}
        openaiApiKey={apiKeys.openai} // Pass the OpenAI key
      />
      {/* Status Indicators */}
      {isProcessing && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            my: 2,
            gap: 1,
          }}
        >
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Processing...
          </Typography>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, whiteSpace: "pre-wrap" }}>
          {error}
        </Alert>
      )}
      {result && !error && !isProcessing && (
        <Alert severity="success" sx={{ mb: 3, whiteSpace: "pre-wrap" }}>
          {result}
        </Alert>
      )}
      <ProcessedDataDisplay
        processedData={processedData}
        onExportToCSV={handleExportToCSV}
        onClearData={handleClearData}
        onDeleteItem={handleDeleteItem}
        isProcessing={isProcessing}
      />
      <Box
        component="footer"
        sx={{
          mt: 6,
          pt: 3,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <Link href="/about" passHref style={{ textDecoration: "none" }}>
          <Button variant="text" color="primary">
            About
          </Button>
        </Link>
        <Link href="/contributing" passHref style={{ textDecoration: "none" }}>
          <Button variant="text" color="primary">
            Contributing
          </Button>
        </Link>
      </Box>
    </Container>
  );
}

export default HomePage;
