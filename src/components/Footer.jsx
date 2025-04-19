import React, { useState, useEffect } from 'react';
import { Box, Typography, Link, Container, Tooltip, Divider, Chip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GitHubIcon from '@mui/icons-material/GitHub';
import { getLatestCommit } from '../services/githubApi';
import ThemeToggleButton from './ThemeToggleButton'; // Import the new component

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
        // Use theme's paper background color for consistency
        backgroundColor: (theme) => theme.palette.background.paper,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`, // Add subtle top border
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', // Adjust alignment
            alignItems: 'center',
            gap: { xs: 1.5, sm: 1 }, // Adjust gap
            flexWrap: 'wrap', // Allow wrapping on small screens
          }}
        >
          {/* Left side content */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
            <Typography variant="body2" color="text.secondary" align="center">
              © {currentYear} Precek
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ display: 'flex', alignItems: 'center' }}>
              Built with <FavoriteIcon sx={{ color: 'error.main', mx: 0.5, fontSize: '1rem' }} /> by{' '}
              <Link
                href="https://github.com/asterixix/precek"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit" // Inherit color for better theme adaptation
                sx={{ ml: 0.5, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Github Community
              </Link>
            </Typography>
          </Box>

          {/* Right side content */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {commitInfo && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GitHubIcon fontSize="small" color="action" />
                  <Tooltip title={`${commitInfo.message} (${commitInfo.date} by ${commitInfo.author})`}>
                    <Link
                      href={commitInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="inherit" // Inherit color
                      sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      <Chip
                        label={`${commitInfo.sha}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.7rem',
                          height: '20px',
                          '& .MuiChip-label': { px: 1 },
                          cursor: 'pointer', // Indicate link
                        }}
                      />
                    </Link>
                  </Tooltip>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: 'center' }} />
              </>
            )}
            {/* Add the Theme Toggle Button */}
            <ThemeToggleButton />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
