import React, { useState, useEffect } from 'react';
import { Box, Typography, Link, Container, Tooltip, Divider, Chip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GitHubIcon from '@mui/icons-material/GitHub';
import { getLatestCommit } from '../services/githubApi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [commitInfo, setCommitInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the latest commit information
  useEffect(() => {
    async function fetchCommitInfo() {
      try {
        const commit = await getLatestCommit();
        setCommitInfo(commit);
      } catch (error) {
        console.error('Failed to fetch commit info:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCommitInfo();
  }, []);
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} Precek
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ display: 'flex', alignItems: 'center' }}>
            Built with <FavoriteIcon sx={{ color: 'error.main', mx: 0.5, fontSize: '1rem' }} /> by{' '}
            <Link
              href="https://sendyka.dev"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ ml: 0.5, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Artur Sendyka
            </Link>
          </Typography>
          
          {commitInfo && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 1, display: { xs: 'none', sm: 'block' } }} />
              <Divider sx={{ width: '50%', my: 1, display: { xs: 'block', sm: 'none' } }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GitHubIcon fontSize="small" color="action" />
                <Tooltip title={`${commitInfo.message} (${commitInfo.date} by ${commitInfo.author})`}>
                  <Link
                    href={commitInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    <Chip 
                      label={`${commitInfo.sha}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.7rem',
                        height: '20px',
                        '& .MuiChip-label': { px: 1 } 
                      }}
                    />
                  </Link>
                </Tooltip>
              </Box>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
