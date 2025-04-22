import React, { useState, useEffect } from 'react';
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Link from 'next/link';
import { marked } from 'marked';
import { Container, Typography, Box, Paper, Button, Breadcrumbs, Avatar, Grid, Tooltip, Chip, CircularProgress } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import GitHubIcon from '@mui/icons-material/GitHub';

// Utility function to convert markdown to HTML
function markdownToHtml(markdown) {
  marked.setOptions({
    breaks: true,
    headerIds: true,
    gfm: true
  });
  
  return marked.parse(markdown);
}

export default function ContributingPage({ content }) {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch contributors data on the client side
  useEffect(() => {
    const fetchContributors = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.github.com/repos/asterixix/precek/contributors');
        if (response.ok) {
          const data = await response.json();
          setContributors(data);
        } else {
          setError('Failed to load contributors data');
        }
      } catch (err) {
        setError('Error fetching contributors data');
        console.error('Error fetching contributors:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContributors();
  }, []);

  // Render Contributors Section with loading state
  const renderContributorsSection = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2 }}>Loading contributors...</Typography>
        </Box>
      );
    }
    
    if (error) {
      return (
        <Typography variant="body2" color="error" align="center">
          {error}
        </Typography>
      );
    }
    
    if (!contributors || contributors.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" align="center">
          No contributors data available.
        </Typography>
      );
    }
    
    return (
      <Grid container spacing={2}>
        {contributors.map((contributor) => (
          <Grid item key={contributor.id} xs={6} sm={4} md={3} lg={2}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                p: 1,
                '&:hover': { 
                  backgroundColor: 'background.paper',
                  borderRadius: 1
                }
              }}
            >
              <Tooltip title={`${contributor.login} - ${contributor.contributions} contributions`}>
                <Link 
                  href={contributor.html_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Avatar 
                    src={contributor.avatar_url} 
                    alt={contributor.login}
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      mb: 1,
                      border: 1,
                      borderColor: 'divider'
                    }} 
                  />
                </Link>
              </Tooltip>
              
              <Typography variant="body2" align="center">
                {contributor.login}
              </Typography>
              
              <Chip 
                label={`${contributor.contributions} commits`}
                size="small"
                variant="outlined"
                sx={{ mt: 0.5, fontSize: '0.7rem' }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Head>
        <title>Contributing - Precek</title>
        <meta name="description" content="How to contribute to the Precek project" />
      </Head>
      
      {/* Breadcrumbs navigation */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link href="/" passHref style={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Typography color="text.primary">Contributing</Typography>
        </Breadcrumbs>
      </Box>
      
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Contributing to Precek
        </Typography>
      </Box>
      
      {/* Content */}
      <Paper elevation={1} sx={{ p: 4, mb: 4 }}>
        <Box 
          sx={{ 
            '& a': { 
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            },
            '& img': { maxWidth: '100%' },
            '& h1': { mt: 4, mb: 2 },
            '& h2': { mt: 3, mb: 2 },
            '& h3': { mt: 2, mb: 1 },
            '& code': {
              backgroundColor: 'background.paper',
              padding: '2px 4px',
              borderRadius: '3px',
              fontFamily: 'monospace'
            },
            '& pre': {
              backgroundColor: 'background.paper',
              padding: 2,
              borderRadius: '4px',
              overflow: 'auto',
              '& code': {
                background: 'none',
                padding: 0
              }
            }
          }}
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </Paper>
      
      {/* Contributors Section */}
      <Paper elevation={1} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <GitHubIcon sx={{ mr: 1 }} /> Project Contributors
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          These amazing people have contributed to the Precek project on GitHub.
        </Typography>
        
        {renderContributorsSection()}
      </Paper>
      
      {/* Navigation buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <Button variant="outlined" startIcon={<HomeIcon />}>
            Return to Home
          </Button>
        </Link>
        <Link href="/about" passHref style={{ textDecoration: 'none' }}>
          <Button variant="outlined">
            About Precek
          </Button>
        </Link>
      </Box>
    </Container>
  );
}

export async function getStaticProps() {
  // Only read CONTRIBUTING.md at build time
  const filePath = path.join(process.cwd(), 'CONTRIBUTING.md');
  let content = '';
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    content = markdownToHtml(fileContent);
  } catch (error) {
    console.error('Error reading CONTRIBUTING.md:', error);
    content = markdownToHtml('# Error\nUnable to load content. Please check that CONTRIBUTING.md exists.');
  }
  
  return {
    props: {
      content
    }
  };
}
