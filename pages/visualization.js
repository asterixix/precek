import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getAllData } from '/src/services/database';
import { useTheme } from '@mui/material/styles';

// Material UI components
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import HomeIcon from '@mui/icons-material/Home';
import Fade from '@mui/material/Fade';
import TextAnalysisVisualizations from '/src/components/TextAnalysisVisualizations';
import dynamic from 'next/dynamic';

// Import DataVisualization dynamically to avoid SSR issues with A-Frame dependencies
const DataVisualization = dynamic(
  () => import('/src/components/DataVisualization'),
  { 
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <CircularProgress size={32} />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading 3D visualization...</Typography>
      </Box>
    )
  }
);

// Define a fallback spinner component using Material UI
const FallbackSpinner = () => (
  <CircularProgress size={48} />
);

// Use our fallback spinner directly since the import is problematic
const DynamicSpinner = FallbackSpinner;

// Dynamically import A-Frame to avoid server-side rendering issues
export default function VisualizationPage() {
  const [aframeLoaded, setAframeLoaded] = useState(false);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if A-Frame is already loaded
    if (window.AFRAME) {
      setAframeLoaded(true);
      return;
    }

    // Load A-Frame script dynamically when component mounts (client-side only)
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.async = true;
    
    // Set the state when the script is loaded
    script.onload = () => {
      console.log('A-Frame script loaded successfully');
      // Increase timeout to ensure AFRAME global is fully initialized
      setTimeout(() => {
        setAframeLoaded(true);
      }, 300);
    };
    
    script.onerror = (error) => {
      console.error('Error loading A-Frame script:', error);
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
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Load data from IndexedDB on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const processedData = await getAllData();
        setData(processedData || []);
      } catch (err) {
        console.error('Error loading data for visualization:', err);
        setError('Failed to load data for visualization');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  // Render appropriate content based on loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <DynamicSpinner />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading visualization data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Link href="/" passHref>
          <Button variant="contained" startIcon={<HomeIcon />} sx={{ mt: 2 }}>
            Return to Home
          </Button>
        </Link>
      </Box>
    );
  }
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
        {value === index && (
          <Box sx={{ pt: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }
  
  // Only render A-Frame related components when aframeLoaded is true
  return (
    <>
      <Head>
        <title>Data Visualization - Precek</title>
      </Head>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Data Visualization
        </Typography>
        
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab === 'overview' ? 0 : activeTab === 'textAnalysis' ? 1 : 2}
              onChange={(e, newValue) => {
                setActiveTab(newValue === 0 ? 'overview' : newValue === 1 ? 'textAnalysis' : '3dVisualization');
              }}
            >
              <Tab label="Overview" />
              <Tab label="Text Analysis" />
              <Tab label="3D Visualization" />
            </Tabs>
          </Box>
          
          <TabPanel value={activeTab === 'overview' ? 0 : -1} index={0}>
            <Grid container spacing={3}>
              {/* Stats cards would go here */}
              <Typography variant="body1" color="text.secondary">
                Overview visualization content will appear here.
              </Typography>
            </Grid>
          </TabPanel>
          
          <TabPanel value={activeTab === 'textAnalysis' ? 1 : -1} index={1}>
            <TextAnalysisVisualizations data={data} />
          </TabPanel>
          
          <TabPanel value={activeTab === '3dVisualization' ? 2 : -1} index={2}>
            {aframeLoaded ? (
              <Fade in={true} timeout={800}>
                <div>
                  <DataVisualization data={data} aframeLoaded={aframeLoaded} />
                </div>
              </Fade>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
                <CircularProgress size={32} />
                <Typography variant="body1" sx={{ ml: 2 }}>Loading 3D environment...</Typography>
              </Box>
            )}
          </TabPanel>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Link href="/" passHref>
            <Button variant="outlined" startIcon={<HomeIcon />}>
              Back to Home
            </Button>
          </Link>
        </Box>
      </Container>
    </>
  );
}
