import React from 'react';
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Link from 'next/link';
import { marked } from 'marked'; // You'll need to install this: npm install marked
import { Container, Typography, Box, Paper, Button, Breadcrumbs } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Utility function to convert markdown to HTML
function markdownToHtml(markdown) {
  // Set options for marked
  marked.setOptions({
    breaks: true, // Convert line breaks to <br>
    headerIds: true, // Generate IDs for headings
    gfm: true // GitHub Flavored Markdown
  });
  
  return marked.parse(markdown);
}

export default function AboutPage({ content }) {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Head>
        <title>About - Precek</title>
        <meta name="description" content="About Precek - Text, Image, Audio, and Video Processing Application" />
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
          <Typography color="text.primary">About</Typography>
        </Breadcrumbs>
      </Box>
      
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          About Precek
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
      
      {/* Navigation buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <Button variant="outlined" startIcon={<HomeIcon />}>
            Return to Home
          </Button>
        </Link>
      </Box>
    </Container>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'README.md');
  let content = '';
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    content = markdownToHtml(fileContent);
  } catch (error) {
    console.error('Error reading README.md:', error);
    content = markdownToHtml('# Error\nUnable to load content. Please check that README.md exists.');
  }
  
  return {
    props: {
      content
    }
  };
}
