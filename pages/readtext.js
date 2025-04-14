import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getDataById } from '/src/services/database';

// Material UI components
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Divider from '@mui/material/Divider';

export default function ReadTextPage() {
  const router = useRouter();
  const { id } = router.query;
  const [textData, setTextData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load data when component mounts and ID is available
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return; // Wait until ID is available from query params

      try {
        setLoading(true);
        const data = await getDataById(id);
        
        if (!data) {
          throw new Error('Text item not found');
        }

        setTextData(data);
      } catch (err) {
        console.error('Error loading text data:', err);
        setError(`Failed to load text data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // Re-run effect when ID changes

  // Display loading state while waiting for data
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 3 }}>
          <CircularProgress />
          <Typography>Loading text content...</Typography>
        </Box>
      </Container>
    );
  }

  // Display error if there's an issue
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/')}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  // If no data is found even after loading
  if (!textData) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          Text data not found. The item may have been deleted.
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/')}
        >
          Return to Home
        </Button>
      </Container>
    );
  }
  
  const title = textData.filename || 'Processed Text';
  const content = textData.type === 'text' ? 
    textData.content : 
    textData.processingResult || 'No processed text available';

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link href="/" passHref style={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Processed: {new Date(textData.timestamp).toLocaleString()}
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              {textData.type === 'text' ? 'Text Content' : 'AI Processing Results'}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ 
            whiteSpace: 'pre-wrap', 
            fontFamily: 'inherit',
            wordBreak: 'break-word'
          }}>
            <Typography variant="body1" component="div" sx={{ lineHeight: 1.8 }}>
              {content}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Additional processing results may be shown here if available */}
      {textData.type !== 'text' && textData.content && (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Original Content
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
              <Typography variant="body1" component="div" sx={{ lineHeight: 1.8 }}>
                {textData.content}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.back()}
        >
          Go Back
        </Button>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <Button 
            variant="contained"
            startIcon={<HomeIcon />}
          >
            Home Page
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
