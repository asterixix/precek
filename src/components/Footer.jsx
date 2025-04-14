import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
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
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
