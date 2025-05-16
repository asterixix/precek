import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
// Use relative path for database service
import { getAllData } from "../src/services/database";
import { useTheme } from "@mui/material/styles";

// Material UI components
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import HomeIcon from "@mui/icons-material/Home";
import Fade from "@mui/material/Fade";
// Use relative paths for components
import TextAnalysisVisualizations from "../src/components/TextAnalysisVisualizations";
import dynamic from "next/dynamic";

// Define a fallback spinner component using Material UI
const FallbackSpinner = () => <CircularProgress size={48} />;

// Use our fallback spinner directly since the import is problematic
const DynamicSpinner = FallbackSpinner;

// Dynamically import A-Frame to avoid server-side rendering issues
export default function VisualizationPage() {
  const [aframeLoaded, setAframeLoaded] = useState(false);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return;

    // Check if A-Frame is already loaded
    if (window.AFRAME) {
      setAframeLoaded(true);
      return;
    }

    // Load A-Frame script dynamically when component mounts (client-side only)
    const script = document.createElement("script");
    script.src = "https://aframe.io/releases/1.4.0/aframe.min.js";
    script.async = true;

    // Set the state when the script is loaded
    script.onload = () => {
      console.log("A-Frame script loaded successfully");
      // Increase timeout to ensure AFRAME global is fully initialized
      setTimeout(() => {
        setAframeLoaded(true);
      }, 300);
    };

    script.onerror = (error) => {
      console.error("Error loading A-Frame script:", error);
    };

    document.body.appendChild(script);

    // Clean up script when component unmounts
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // Default to first tab (Text Analysis)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load data from IndexedDB on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const processedData = await getAllData();
        setData(processedData || []);
      } catch (err) {
        console.error("Error loading data for visualization:", err);
        setError("Failed to load data for visualization");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Render appropriate content based on loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <DynamicSpinner />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading visualization data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Link href="/" passHref>
          <Button variant="contained" startIcon={<HomeIcon />} sx={{ mt: 2 }}>
            Return to Home
          </Button>
        </Link>
      </Box>
    );
  }

  // Handle tab changes
  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Custom TabPanel component for Material UI
  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
      </div>
    );
  }

  // Only render A-Frame related components when aframeLoaded is true
  const AFrameScene = dynamic(
    () => import("../src/components/AFrameComponentWrapper"), // Updated import path
    {
      ssr: false, // Ensure it's not rendered on the server
      loading: () => <DynamicSpinner />, // Show spinner while loading
    }
  );

  const selectedTextId = data && data.length > 0 ? data[0].id : undefined;

  return (
    <>
      <Head>
        <title>Data Visualization - Precek</title>
        <meta
          name="description"
          content="Visualize processed data including text analysis and VR representations."
        />
      </Head>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Data Visualization
            </Typography>
          </Grid>
          <Grid item>
            <Link href="/" passHref>
              <Button variant="outlined" startIcon={<HomeIcon />}>
                Return to Home
              </Button>
            </Link>
          </Grid>
        </Grid>

        {/* Tabs for different visualization types */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            aria-label="visualization tabs"
          >
            <Tab label="Text Analysis" id="tab-0" aria-controls="tabpanel-0" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Fade in={activeTab === 0} timeout={500} unmountOnExit>
          <div>
            {" "}
            {/* Wrap TabPanel content in a div for Fade transition */}
            <TabPanel value={activeTab} index={0}>
              <TextAnalysisVisualizations
                data={data}
                selectedTextId={selectedTextId}
              />
            </TabPanel>
          </div>
        </Fade>
      </Container>
    </>
  );
}
