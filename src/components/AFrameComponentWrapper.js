import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

// This component ensures A-Frame components are only rendered
// after the A-Frame library has been loaded and is ready
const AFrameComponentWrapper = ({ children, fallback }) => {
  const [isAFrameReady, setIsAFrameReady] = useState(false);
  
  useEffect(() => {
    // Check if we're in browser context
    if (typeof window === 'undefined') return;
    
    // If AFRAME is already defined, we're good to go
    if (window.AFRAME) {
      setIsAFrameReady(true);
      return;
    }
    
    // Otherwise, set up an observer to check when it's ready
    const checkAFrameInterval = setInterval(() => {
      if (window.AFRAME) {
        setIsAFrameReady(true);
        clearInterval(checkAFrameInterval);
      }
    }, 100);
    
    // Clean up interval on unmount
    return () => clearInterval(checkAFrameInterval);
  }, []);
  
  // Only render children if A-Frame is ready
  return isAFrameReady ? children : (fallback || (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
      <CircularProgress size={32} />
      <Typography variant="body1" sx={{ ml: 2 }}>Loading A-Frame components...</Typography>
    </Box>
  ));
};

export default AFrameComponentWrapper;
