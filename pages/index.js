import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { processText, processImage, processAudio, processVideo } from '/src/services/multimediaProcessor';
import { getAllData, exportToCSV, clearAllData } from '/src/services/database';
import { readTextFile, readPdfFile, getApiKeys } from '/src/utils/helpers'; // Import helpers, including getApiKeys

// Import Custom Components
import ApiKeyForm from '/src/components/ApiKeyForm';
import ProcessingControls from '/src/components/ProcessingControls';
import ProcessedDataDisplay from '/src/components/ProcessedDataDisplay';

// Import Material UI components
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress'; // For loading state

function HomePage() {
  const [processedData, setProcessedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(''); // Simple status message
  const [apiKeys, setApiKeys] = useState({ openai: '', openrouter: '', googleFactCheck: '' }); // Include google key state
  const [keysConfigured, setKeysConfigured] = useState(false);
  const [showApiForm, setShowApiForm] = useState(false);

  // Load initial data and keys
  const loadInitialData = useCallback(async () => {
    try {
      const data = await getAllData();
      setProcessedData(data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load existing data');
    }

    // Use getApiKeys to load from localStorage/window consistently
    const currentKeys = getApiKeys();
    setApiKeys(currentKeys); // Update state with all keys

    // Core processing depends on OpenAI or OpenRouter
    const coreKeysConfigured = !!(currentKeys.openai || currentKeys.openrouter);
    setKeysConfigured(coreKeysConfigured);
    setShowApiForm(!coreKeysConfigured); // Show form if no core keys are found
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); // Correctly include loadInitialData in dependencies

  // Generic processing handler - Modified to accept keys
  const handleProcess = async (processor, input, inputName = 'input', currentApiKeys) => {
    setIsProcessing(true);
    setError('');
    setResult(''); // Clear previous result

    try {
      // Pass keys to the processor function
      const response = await processor(input, inputName, currentApiKeys);

      // Check for errors returned by the processor service
      if (response && response.error) {
        throw new Error(response.processingResult || 'Processing failed');
      }

      setResult(`Successfully processed: ${inputName}`);
      const updatedData = await getAllData();
      setProcessedData(updatedData || []);
    } catch (err) {
      console.error(`Error processing ${inputName}:`, err);
      // Handle specific API key errors
      if (err.message.includes('API key is invalid') || err.message.includes('unauthorized') || err.message.includes('401')) {
        setError('Authentication failed: An API key might be invalid or expired. Please check your configuration.');
        setKeysConfigured(false); // Mark as not configured
        setShowApiForm(true); // Show form to fix
      } else {
        setError(`Failed to process ${inputName}: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Specific handlers calling the generic one - Modified to pass keys
  const handleProcessText = (text) => {
    const currentKeys = getApiKeys();
    if (!currentKeys.openai && !currentKeys.openrouter) {
        setError("API keys are not configured. Please configure them first.");
        setShowApiForm(true);
        return;
    }
    handleProcess(processText, text, `"${truncateText(text, 30)}"`, currentKeys);
  };

  const handleProcessImage = (file) => {
    const currentKeys = getApiKeys();
     if (!currentKeys.openai && !currentKeys.openrouter) {
        setError("API keys are not configured. Please configure them first.");
        setShowApiForm(true);
        return;
    }
    handleProcess(processImage, file, file.name, currentKeys);
  };

  const handleProcessAudio = (file) => {
    const currentKeys = getApiKeys();
     if (!currentKeys.openai && !currentKeys.openrouter) {
        setError("API keys are not configured. Please configure them first.");
        setShowApiForm(true);
        return;
    }
    handleProcess(processAudio, file, file.name, currentKeys);
  };

  const handleProcessVideo = (file) => {
    const currentKeys = getApiKeys();
     if (!currentKeys.openai && !currentKeys.openrouter) {
        setError("API keys are not configured. Please configure them first.");
        setShowApiForm(true);
        return;
    }
    handleProcess(processVideo, file, file.name, currentKeys);
  };

  // Special handler for text files (potentially multiple) - Modified to pass keys
  const handleProcessTextFile = async (files) => {
     const currentKeys = getApiKeys(); // Get keys once
     if (!currentKeys.openai && !currentKeys.openrouter) {
        setError("API keys are not configured. Please configure them first.");
        setShowApiForm(true);
        return;
    }
    setIsProcessing(true);
    setError('');
    setResult('');

    let processedCount = 0;
    let errorCount = 0;
    const fileNames = Array.from(files).map(f => f.name).join(', ');

    try {
      for (const file of files) {
        try {
          let text = '';
          const lowerCaseName = file.name.toLowerCase();
          if (lowerCaseName.endsWith('.txt')) {
            text = await readTextFile(file);
          } else if (lowerCaseName.endsWith('.pdf')) {
            text = await readPdfFile(file);
          } else {
             console.warn(`Skipping unsupported file type: ${file.name}`);
             continue; // Skip unsupported files silently in UI for now
          }

          if (!text || text.trim().length === 0) {
             console.warn(`Skipping empty or unreadable file: ${file.name}`);
             errorCount++; // Count as error if text extraction failed or was empty
             continue;
          }

          // Process the extracted text, passing keys
          // *** Error Note: The 'TypeError: (0 , l.addData) is not a function' likely originates ***
          // *** from within this 'processText' function or the database functions it calls. ***
          // *** Check the implementation in '/src/services/multimediaProcessor.js' and '/src/services/database.js'. ***
          const response = await processText(text, file.name, currentKeys); // Pass keys here
          if (response && response.error) {
              throw new Error(response.processingResult || `Processing failed for ${file.name}`);
          }
          processedCount++;
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          // *** Error Note: The error caught here might be the 'addData is not a function' error ***
          // *** propagated from the 'processText' call above. ***
          errorCount++;
           // Propagate API key errors immediately
          if (fileError.message.includes('API key is invalid') || fileError.message.includes('unauthorized') || fileError.message.includes('401')) {
              throw fileError; // Re-throw to be caught by outer catch
          }
        }
      }

      // Update UI based on results
      if (processedCount > 0 && errorCount === 0) {
        setResult(`Successfully processed ${processedCount} file(s): ${truncateText(fileNames, 50)}`);
      } else if (processedCount > 0 && errorCount > 0) {
        setResult(`Processed ${processedCount} file(s) with ${errorCount} error(s).`);
        setError(`Failed to process ${errorCount} file(s). Check console for details.`); // Provide some error feedback
      } else if (errorCount > 0) {
        throw new Error(`Failed to process ${errorCount} file(s).`);
      } else {
         setResult("No supported files found or processed."); // Handle case where no .txt/.pdf files were selected
      }

      const updatedData = await getAllData();
      setProcessedData(updatedData || []);

    } catch (err) {
       console.error('Error processing text files:', err);
       // Handle specific API key errors from the loop
       if (err.message.includes('API key is invalid') || err.message.includes('unauthorized') || err.message.includes('401')) {
         setError('Authentication failed: An API key might be invalid or expired. Please check your configuration.');
         setKeysConfigured(false);
         setShowApiForm(true);
       } else {
          // *** Error Note: This catch block might handle the 'addData is not a function' error ***
          // *** if it was re-thrown from the inner catch block. ***
          setError(`Failed to process files: ${err.message || 'Unknown error'}`);
       }
    } finally {
      setIsProcessing(false);
    }
  };


  // Export data to CSV
  const handleExportToCSV = async () => {
    try {
      const csvContent = await exportToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); // Ensure UTF-8
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'precek_data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Clean up
      setResult('Data exported to CSV successfully');
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      setError('Failed to export data to CSV');
    }
  };

  // Clear all data
  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear ALL processed data? This cannot be undone.')) {
      try {
        await clearAllData();
        setProcessedData([]);
        setResult('All data has been cleared');
        setError('');
      } catch (err) {
        console.error('Error clearing data:', err);
        setError('Failed to clear data');
      }
    }
  };

  // Handle saving keys from the form
  const handleKeysSaved = () => {
    // ApiKeyForm already saved to localStorage and updated window object.
    // We just need to re-check the configuration status based on core keys.
    const currentKeys = getApiKeys(); // Re-read keys
    setApiKeys(currentKeys); // Update local state
    setKeysConfigured(!!(currentKeys.openai || currentKeys.openrouter));
    setShowApiForm(false);
    setError(''); // Clear any previous errors like "keys not configured"
    setResult('API keys saved successfully!'); // Provide user feedback
  };

  // Handle changing API keys
  const handleChangeApiKeys = () => {
    setShowApiForm(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1, sm: 2 } }}> {/* Responsive padding */}
      <Box component="header" sx={{ mb: 4, textAlign: 'center' }}> {/* Center header */}
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>Precek</Typography>
        <Typography variant="body1" color="text.secondary">AI-Powered Multimedia Analysis</Typography>
      </Box>

      {/* Top Controls: View Visualizations & Change API Keys */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Link href="/visualization" passHref style={{ textDecoration: 'none' }}>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            disabled={processedData.length === 0} // Disable if no data
            sx={{ borderRadius: 2, boxShadow: 1 }}
          >
            View Data Visualizations
          </Button>
        </Link>

        {keysConfigured && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleChangeApiKeys}
          >
            Change API Keys
          </Button>
        )}
      </Box>

      {/* API Key Form (Conditional) */}
      {showApiForm && (
        <ApiKeyForm
          onKeysSaved={handleKeysSaved}
          // No need to pass initial keys, ApiKeyForm reads them itself via useEffect
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
      />

      {/* Status Messages */}
      {isProcessing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2, gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">Processing...</Typography>
          </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {result && !isProcessing && ( // Show result only when not processing
        <Alert severity="success" sx={{ mb: 3 }}>
            {result}
        </Alert>
      )}

      {/* Processed Data Display */}
      <ProcessedDataDisplay
        processedData={processedData}
        onExportToCSV={handleExportToCSV}
        onClearData={handleClearData}
        isProcessing={isProcessing}
      />

    </Container>
  );
}

// Helper function (if not already present or imported)
function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}


export default HomePage;
