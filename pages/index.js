import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { processText, processImage, processAudio, processVideo } from '/src/services/multimediaProcessor';
import { getAllData, exportToCSV, clearAllData } from '/src/services/database';

// Import Material UI components
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import VideocamIcon from '@mui/icons-material/Videocam';
import ImageIcon from '@mui/icons-material/Image';
import TextFieldsIcon from '@mui/icons-material/TextFields';

// Import PDF.js for PDF processing - client-side only
let pdfjs = null;
if (typeof window !== 'undefined') {
  pdfjs = require('pdfjs-dist');
  // Set the worker source to a CDN URL that matches our version
  if (pdfjs) {
    // Use a public CDN that's reliable
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
}

function HomePage() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [processedData, setProcessedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [keysConfigured, setKeysConfigured] = useState(false);
  const [showApiForm, setShowApiForm] = useState(false);

  // Load data and API keys from storage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAllData();
        setProcessedData(data || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load existing data');
      }
    };

    // Load API keys from localStorage if available
    const savedOpenAIKey = localStorage.getItem('openai_api_key');
    const savedOpenRouterKey = localStorage.getItem('openrouter_api_key');
    
    if (savedOpenAIKey || savedOpenRouterKey) {
      setOpenAIKey(savedOpenAIKey || '');
      setOpenRouterKey(savedOpenRouterKey || '');
      setKeysConfigured(true);
    } else {
      setShowApiForm(true); // Show API form if no keys are found
    }

    loadData();
  }, []);

  // This useEffect can be removed since we're already setting up the worker
  // at initialization time above
  useEffect(() => {
    // PDF.js worker src is already set in the initialization above
  }, []);

  // Process text using AI
  const handleProcessText = async () => {
    if (!inputText) {
      alert('Please enter text to process');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Process text using AI
      const result = await processText(inputText);
      
      // Check if there was an error
      if (result.error) {
        throw new Error(result.processingResult);
      }
      
      // Update the UI with processed data
      setResult(`Successfully processed text: "${inputText.substring(0, 30)}${inputText.length > 30 ? '...' : ''}"`);
      
      // Update the list of processed items
      const updatedData = await getAllData();
      setProcessedData(updatedData || []);
    } catch (err) {
      console.error('Error processing text:', err);
      
      // Check for authentication errors
      if (err.message.includes('API key is invalid') || 
          err.message.includes('unauthorized') || 
          err.message.includes('401')) {
        setError('Authentication failed: Your API key appears to be invalid or expired. Please check your API keys in the configuration.');
        
        // Show the API form to let the user fix their keys
        setShowApiForm(true);
        setKeysConfigured(false);
      } else {
        setError(`Failed to process text: ${err.message || 'Unknown error'}`);
      }
      
      setResult('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process text file (.txt, .pdf, .epub)
  const handleProcessTextFile = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setIsProcessing(true);
    setError('');
    
    try {
      let processedCount = 0;
      let errorCount = 0;
      
      // Process each file sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          let text = '';          if (file.name.toLowerCase().endsWith('.txt')) {
            // Handle plain text files
            text = await readTextFile(file);
          } else if (file.name.toLowerCase().endswith('.pdf')) {
            // Handle PDF files
            if (!pdfjs) {
              throw new Error('PDF processing is only available in browser environment');
            }
            text = await readPdfFile(file);
          } else {
            continue; // Skip unsupported files
          }
          
          if (!text || text.trim().length === 0) {
            errorCount++;
            continue;
          }
          
          // Process the extracted text with AI
          await processText(text, file.name);
          processedCount++;
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          errorCount++;
        }
      }

      // Update the UI based on results
      if (processedCount > 0 && errorCount === 0) {
        setResult(`Successfully processed ${processedCount} file${processedCount !== 1 ? 's' : ''}`);
      } else if (processedCount > 0 && errorCount > 0) {
        setResult(`Successfully processed ${processedCount} file${processedCount !== 1 ? 's' : ''} with ${errorCount} error${errorCount !== 1 ? 's' : ''}`);
      } else if (errorCount > 0) {
        throw new Error(`Failed to process ${errorCount} file${errorCount !== 1 ? 's' : ''}`);
      }
      
      // Update the list of processed items
      const updatedData = await getAllData();
      setProcessedData(updatedData || []);
    } catch (err) {
      console.error('Error processing text files:', err);
      setError(`Failed to process text files: ${err.message || 'Unknown error'}`);
      setResult('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Read text from a .txt file
  const readTextFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Error reading text file'));
      reader.readAsText(file);
    });
  };
  // Read text from a PDF file
  const readPdfFile = async (file) => {
    if (!pdfjs) {
      throw new Error('PDF processing is only available in browser environment');
    }
    
    try {
      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Ensure the worker URL is set correctly
      // Use the same unpkg CDN URL as defined at initialization
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      
      // Load PDF document
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map(item => item.str);
        const pageText = textItems.join(' ');
        fullText += pageText + '\n\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('Error reading PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  // Process audio using AI
  const handleProcessAudio = async () => {
    setIsProcessing(true);
    setError('');
    
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // Process audio using AI
          await processAudio(file);
          
          setResult(`Successfully processed audio: ${file.name}`);
          
          // Update the list of processed items
          const updatedData = await getAllData();
          setProcessedData(updatedData || []);
        } catch (err) {
          console.error('Error processing audio:', err);
          setError(`Failed to process audio: ${err.message || 'Unknown error'}`);
          setResult('');
        } finally {
          setIsProcessing(false);
        }
      } else {
        setIsProcessing(false);
      }
    };
    
    input.click();
  };
  // Process video using AI
  const handleProcessVideo = async () => {
    setIsProcessing(true);
    setError('');
    
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // Process video using AI
          await processVideo(file);
          
          setResult(`Successfully processed video: ${file.name}`);
          
          // Update the list of processed items
          const updatedData = await getAllData();
          setProcessedData(updatedData || []);
        } catch (err) {
          console.error('Error processing video:', err);
          setError(`Failed to process video: ${err.message || 'Unknown error'}`);
          setResult('');
        } finally {
          setIsProcessing(false);
        }
      } else {
        setIsProcessing(false);
      }
    };
    
    input.click();
  };
  
  // Process image using AI
  const handleProcessImage = async () => {
    setIsProcessing(true);
    setError('');
    
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // Process image using AI
          const result = await processImage(file);
          
          // Check if there was an error
          if (result.error) {
            throw new Error(result.processingResult);
          }
          
          setResult(`Successfully processed image: ${file.name}`);
          
          // Update the list of processed items
          const updatedData = await getAllData();
          setProcessedData(updatedData || []);
        } catch (err) {
          console.error('Error processing image:', err);
          
          // Check for authentication errors
          if (err.message.includes('API key is invalid') || 
              err.message.includes('unauthorized') || 
              err.message.includes('401')) {
            setError('Authentication failed: Your API key appears to be invalid or expired. Please check your API keys in the configuration.');
            
            // Show the API form to let the user fix their keys
            setShowApiForm(true);
            setKeysConfigured(false);
          } else {
            setError(`Failed to process image: ${err.message || 'Unknown error'}`);
          }
          
          setResult('');
        } finally {
          setIsProcessing(false);
        }
      } else {
        setIsProcessing(false);
      }
    };
    
    input.click();
  };

  // Export data to CSV
  const handleExportToCSV = async () => {
    try {
      // Get CSV data from database service
      const csvContent = await exportToCSV();
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'precek_data.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setResult('Data exported to CSV successfully');
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      setError('Failed to export data to CSV');
    }
  };

  // Clear all data
  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all processed data? This action cannot be undone.')) {
      try {
        await clearAllData();
        setProcessedData([]);
        setResult('All data has been cleared');
      } catch (err) {
        console.error('Error clearing data:', err);
        setError('Failed to clear data');
      }
    }
  };  // Save API keys to localStorage and update environment variables
  const handleSaveApiKeys = () => {
    // Validate keys
    if ((!openAIKey && !openRouterKey) || (openAIKey && !openAIKey.startsWith('sk-')) || (openRouterKey && !openRouterKey.startsWith('sk-or-'))) {
      setError('Please enter valid API keys. OpenAI keys start with "sk-" and OpenRouter keys start with "sk-or-"');
      return;
    }
    
    // Save to localStorage for future sessions
    if (openAIKey) localStorage.setItem('openai_api_key', openAIKey);
    if (openRouterKey) localStorage.setItem('openrouter_api_key', openRouterKey);

    // Set global variables that will be accessed by the multimedia processor
    if (typeof window !== 'undefined') {
      window.NEXT_PUBLIC_OPENAI_API_KEY = openAIKey || '';
      window.OPENROUTER_API_KEY = openRouterKey || '';
      
      // Also explicitly set these as window properties for consistent access
      window.__PRECEK_API_KEYS = {
        openai: openAIKey || '',
        openrouter: openRouterKey || '',
      };
    }

    setKeysConfigured(true);
    setShowApiForm(false);
    setError('');
    setResult('API keys configured successfully!');
  };

  // Handle changing API keys
  const handleChangeApiKeys = () => {
    setShowApiForm(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: 2 }}>
      <Box component="header" sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>Precek</Typography>
        <Typography variant="body1" color="text.secondary">Text, Image, Audio, and Video Processing with AI</Typography>
      </Box>
      
      {/* API Keys Configuration Form */}
      {showApiForm && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardHeader 
            title={<Typography variant="h5">API Configuration</Typography>}
            subheader={<Typography color="text.secondary">Enter your API keys to use this application</Typography>}
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography>
                To use Precek, you need to provide at least one of the following API keys:
              </Typography>
              
              <TextField
                label="OpenAI API Key"
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                fullWidth
                placeholder="sk-..."
                helperText="Get your API key from https://platform.openai.com/account/api-keys"
                type="password"
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>OR</Typography>
              
              <TextField
                label="OpenRouter API Key"
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                fullWidth
                placeholder="sk-or-..."
                helperText="Get your API key from https://openrouter.ai/keys"
                type="password"
              />
              
              <Button 
                variant="contained" 
                onClick={handleSaveApiKeys}
                sx={{ mt: 1 }}
              >
                Save API Keys
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/visualization" passHref style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              endIcon={<Box component="span" sx={{ fontSize: '1.2rem', ml: 0.5 }}>→</Box>}
              sx={{ 
                borderRadius: 2,
                boxShadow: 2,
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              View Data Visualizations
            </Button>
          </Link>
          
          {keysConfigured && (
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleChangeApiKeys} 
              sx={{ ml: 2 }}
            >
              Change API Keys
            </Button>
          )}
        </Box><Card variant="outlined" sx={{ mb: 3 }}>
          <CardHeader 
            title={<Typography variant="h5">Process Content</Typography>}
            subheader={<Typography color="text.secondary">Use AI models to process text, images, audio, and video</Typography>}
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Text Input
                </Typography>                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    id="text-input"
                    fullWidth
                    multiline
                    minRows={4}
                    maxRows={12}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to process"
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        padding: '12px',
                        fontFamily: 'inherit'
                      }
                    }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleProcessText} 
                    disabled={isProcessing}
                    startIcon={<TextFieldsIcon />}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    Process Text
                  </Button>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Or Upload Text Files
                </Typography>                  <Button
                    variant="outlined"
                    component="span"
                    disabled={isProcessing}
                    startIcon={<CloudUploadIcon />}                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.txt,.pdf';
                      input.multiple = true;
                      input.onchange = handleProcessTextFile;
                      input.click();
                    }}
                  >
                    Upload Text File (.txt, .pdf)
                  </Button>
              </Box>              <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>                <Button 
                  onClick={handleProcessImage} 
                  variant="outlined" 
                  disabled={isProcessing || !keysConfigured}
                  startIcon={<ImageIcon />}
                  sx={{ mr: 1, mb: 1 }}
                  title={!keysConfigured ? "API key required for image processing" : ""}
                >
                  Process Image
                </Button>
                <Button 
                  onClick={handleProcessAudio} 
                  variant="outlined" 
                  disabled={isProcessing || !keysConfigured}
                  startIcon={<AudiotrackIcon />}
                  sx={{ mr: 1, mb: 1 }}
                  title={!keysConfigured ? "API key required for audio processing" : ""}
                >
                  Process Audio
                </Button>
                <Button 
                  onClick={handleProcessVideo} 
                  variant="outlined" 
                  disabled={isProcessing || !keysConfigured}
                  startIcon={<VideocamIcon />}
                  sx={{ mr: 1, mb: 1 }}
                  title={!keysConfigured ? "API key required for video processing" : ""}
                >
                  Process Video
                </Button>
                <Button 
                  onClick={handleExportToCSV} 
                  variant="contained"
                  color="secondary" 
                  disabled={isProcessing || processedData.length === 0}
                  sx={{ mr: 1, mb: 1 }}
                >
                  Export to CSV
                </Button>                <Button 
                  onClick={handleClearData} 
                  variant="contained"
                  color="error" 
                  disabled={isProcessing || processedData.length === 0}
                  sx={{ mb: 1 }}
                >
                  Clear Data
                </Button>
              </Box>
            </Box>
          </CardContent>        </Card>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ pt: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Processing Result:</Typography>
              <Typography variant="body1">{result}</Typography>
              {isProcessing && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Processing...</Typography>}
            </CardContent>
          </Card>
        )}        {processedData.length > 0 && (
          <Card>
            <CardHeader 
              title={<Typography variant="h6">Processed Data</Typography>}
              subheader={<Typography variant="body2" color="text.secondary">
                Results from AI processing ({processedData.length} items)
              </Typography>}
            />            <CardContent>
              <Grid container spacing={2}>
                {processedData.slice(0, 10).map((item, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card sx={{ overflow: 'hidden' }}>
                      <CardContent sx={{ p: 0 }}>
                      {item.type === 'image' && item.data && (
                        <Box sx={{ 
                          height: '10rem', 
                          bgcolor: 'action.hover',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Box 
                            component="img" 
                            src={item.data} 
                            alt="Processed" 
                            sx={{ maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </Box>
                      )}
                      {item.type === 'audio' && item.data && (
                        <Box sx={{ p: 2 }}>
                          <Box 
                            component="audio" 
                            controls
                            src={item.data} 
                            sx={{ width: '100%' }}
                          />
                        </Box>
                      )}
                      {item.type === 'video' && item.data && (
                        <Box sx={{ p: 2 }}>
                          <Box 
                            component="video" 
                            controls
                            src={item.data} 
                            sx={{ width: '100%', height: '10rem', objectFit: 'contain' }}
                          />
                        </Box>
                      )}
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          mb: 1 
                        }}>
                          <Box sx={{ 
                            width: '0.75rem', 
                            height: '0.75rem', 
                            borderRadius: '50%', 
                            bgcolor: getTypeColorMui(item.type)
                          }} />
                          <Typography variant="body2" fontWeight="medium">
                            {item.type.toUpperCase()}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ ml: 'auto' }}
                          >
                            {new Date(item.timestamp).toLocaleString()}
                          </Typography>
                        </Box>                        {(item.type === 'text' || item.processingResult) && (
                          <>
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {item.type === 'text' 
                                ? truncateText(item.content || '', 150) 
                                : truncateText(item.processingResult || '', 150)
                              }
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                              <Link href={`/readtext?id=${item.id}`} passHref style={{ textDecoration: 'none' }}>
                                <Button size="small" variant="outlined">
                                  View Full Text
                                </Button>
                              </Link>
                            </Box>
                          </>
                        )}
                      </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
                {processedData.length > 10 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Link href="/visualization" style={{ textDecoration: 'none' }}>
                    <Typography color="primary" sx={{ 
                      '&:hover': { textDecoration: 'underline' },
                      cursor: 'pointer'
                    }}>
                      View all {processedData.length} items in visualizations →
                    </Typography>
                  </Link>
                </Box>
              )}
            </CardContent>
          </Card>
        )}      </Box>
    </Container>
  );
}

// Helper functions
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function getTypeColor(type) {
  switch (type) {
    case 'text':
      return 'bg-blue-500';
    case 'image':
      return 'bg-green-500';
    case 'audio':
      return 'bg-yellow-500';
    case 'video':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
}

function getTypeColorMui(type) {
  switch (type) {
    case 'text':
      return 'primary.main';
    case 'image':
      return 'success.main';
    case 'audio':
      return 'warning.main';
    case 'video':
      return 'secondary.main';
    default:
      return 'grey.500';
  }
}

export default HomePage;
