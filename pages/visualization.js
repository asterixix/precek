import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getAllData } from '/src/services/database';
import { checkExistenceOnWikipedia } from '/src/services/mediawiki'; // Import the new service
import { searchFactChecks } from '/src/services/googleFactCheck'; // Import the fact check service
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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip from '@mui/material/Tooltip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TextField from '@mui/material/TextField'; // Import TextField

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
  const [isCheckingWikipedia, setIsCheckingWikipedia] = useState(false); // Loading state for Wikipedia checks
  const [wikipediaResults, setWikipediaResults] = useState({}); // Store results { filename: boolean }
  const [wikipediaError, setWikipediaError] = useState(''); // Error state for Wikipedia checks

  // State for Google Fact Check
  const [factCheckQuery, setFactCheckQuery] = useState(''); // Input field state
  const [isCheckingFacts, setIsCheckingFacts] = useState(false);
  const [factCheckResults, setFactCheckResults] = useState(null);
  const [factCheckError, setFactCheckError] = useState('');


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

  // Function to run Wikipedia checks
  const runWikipediaChecks = async () => {
    if (!data || data.length === 0) {
      setWikipediaError('No data available to check.');
      return;
    }

    setIsCheckingWikipedia(true);
    setWikipediaError('');
    setWikipediaResults({}); // Reset previous results

    const results = {};
    // Filter for items that might have relevant names (e.g., images, documents)
    // Adjust the filter based on your data structure and needs
    const itemsToCheck = data.filter(item => item.originalName && (item.type === 'image' || item.type === 'text')); // Example filter

    if (itemsToCheck.length === 0) {
        setWikipediaError('No suitable items found to check on Wikipedia (e.g., images or text files with names).');
        setIsCheckingWikipedia(false);
        return;
    }

    try {
      for (const item of itemsToCheck) {
        // Use originalName or another relevant field as the search term
        const searchTerm = item.originalName;
        if (searchTerm) {
          results[searchTerm] = await checkExistenceOnWikipedia(searchTerm);
        }
      }
      setWikipediaResults(results);
    } catch (err) {
      console.error('Error during Wikipedia checks:', err);
      setWikipediaError('An error occurred while checking Wikipedia.');
    } finally {
      setIsCheckingWikipedia(false);
    }
  };

  // Function to run Google Fact Checks
  const runFactCheck = async () => {
    if (!factCheckQuery.trim()) {
      setFactCheckError('Please enter a search query.');
      return;
    }

    setIsCheckingFacts(true);
    setFactCheckError('');
    setFactCheckResults(null);

    try {
      // The service now directly calls Google and handles the key check
      const results = await searchFactChecks(factCheckQuery);
      setFactCheckResults(results);
    } catch (err) {
      console.error('Error during fact check:', err);
      // Display the error message from the service (e.g., missing key or API error)
      setFactCheckError(err.message || 'An error occurred while performing the fact check.');
    } finally {
      setIsCheckingFacts(false);
    }
  };


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
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>            <Tabs 
              value={activeTab === 'overview' ? 0 : 1}
              onChange={(e, newValue) => {
                setActiveTab(newValue === 0 ? 'overview' : 'textAnalysis');
              }}
            >
              <Tab label="Overview" />
              <Tab label="Text Analysis" />
            </Tabs>
          </Box>
          
          <TabPanel value={activeTab === 'overview' ? 0 : -1} index={0}>
            <Grid container spacing={3}>
              {/* Placeholder for other overview content */}
              <Grid item xs={12} md={6}> {/* Adjusted grid size */}
                <Card>
                  <CardHeader title="Wikipedia File Check" />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Check if filenames (for images/text files) exist as articles or pages on English Wikipedia. This is a basic search check.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={runWikipediaChecks}
                      disabled={isCheckingWikipedia || isLoading}
                      sx={{ mb: 2 }}
                    >
                      {isCheckingWikipedia ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                      Check Filenames on Wikipedia
                    </Button>
                    {isCheckingWikipedia && <Typography variant="body2">Checking...</Typography>}
                    {wikipediaError && <Alert severity="error" sx={{ mt: 2 }}>{wikipediaError}</Alert>}
                    {!isCheckingWikipedia && Object.keys(wikipediaResults).length > 0 && (
                      <Box sx={{ maxHeight: 300, overflow: 'auto', mt: 2 }}>
                        <List dense>
                          {Object.entries(wikipediaResults).map(([filename, found]) => (
                            <ListItem key={filename}>
                              <Tooltip title={found ? "Found on Wikipedia" : "Not found on Wikipedia"} placement="left">
                                {found ? <CheckCircleIcon color="success" sx={{ mr: 1 }} /> : <CancelIcon color="error" sx={{ mr: 1 }} />}
                              </Tooltip>
                              <ListItemText primary={filename} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                     {!isCheckingWikipedia && !wikipediaError && Object.keys(wikipediaResults).length === 0 && !isCheckingWikipedia && (
                       <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>Click the button above to check filenames on Wikipedia.</Typography>
                     )}
                  </CardContent>
                </Card>
              </Grid>
              {/* Google Fact Check Card */}
              <Grid item xs={12} md={6}> {/* Adjusted grid size */}
                <Card>
                  <CardHeader title="Google Fact Check" />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Enter a topic or claim to search for fact checks using the Google Fact Check API. Requires API key configuration via the Home page.
                    </Typography>
                    <TextField
                      fullWidth
                      label="Enter search query"
                      variant="outlined"
                      value={factCheckQuery}
                      onChange={(e) => setFactCheckQuery(e.target.value)}
                      disabled={isCheckingFacts}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      onClick={runFactCheck}
                      disabled={isCheckingFacts || !factCheckQuery.trim()}
                      sx={{ mb: 2 }}
                    >
                      {isCheckingFacts ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                      Search Fact Checks
                    </Button>
                    {isCheckingFacts && <Typography variant="body2">Searching...</Typography>}
                    {factCheckError && <Alert severity="error" sx={{ mt: 2 }}>{factCheckError}</Alert>}
                    {!isCheckingFacts && factCheckResults && (
                      <Box sx={{ maxHeight: 400, overflow: 'auto', mt: 2 }}>
                        {factCheckResults.claims && factCheckResults.claims.length > 0 ? (
                          factCheckResults.claims.map((claim, index) => (
                            <Accordion key={index}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="body2">{claim.text || 'Claim'} - ({claim.claimReview.length} review(s))</Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography variant="subtitle2" gutterBottom>Claimant: {claim.claimant || 'N/A'}</Typography>
                                <Typography variant="subtitle2" gutterBottom>Date: {claim.claimDate ? new Date(claim.claimDate).toLocaleDateString() : 'N/A'}</Typography>
                                <List dense>
                                  {claim.claimReview.map((review, rIndex) => (
                                    <ListItem key={rIndex} component="a" href={review.url} target="_blank" rel="noopener noreferrer" button>
                                      <ListItemText
                                        primary={review.title || 'Review'}
                                        secondary={`${review.publisher.name} - Rating: ${review.textualRating}`}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </AccordionDetails>
                            </Accordion>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">No fact checks found for this query.</Typography>
                        )}
                      </Box>
                    )}
                    {!isCheckingFacts && !factCheckError && !factCheckResults && (
                       <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>Enter a query and click the button to search.</Typography>
                     )}
                  </CardContent>
                </Card>
              </Grid>
              {/* Other overview cards would go here */}
              <Grid item xs={12}>
                 <Typography variant="body1" color="text.secondary">
                    Other overview visualization content will appear here.
                 </Typography>
              </Grid>
            </Grid>
          </TabPanel>
            <TabPanel value={activeTab === 'textAnalysis' ? 1 : -1} index={1}>
            <TextAnalysisVisualizations data={data} />
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
