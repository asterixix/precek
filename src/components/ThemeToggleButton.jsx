import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon icon for dark
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun icon for light
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'; // System icon

const ThemeToggleButton = () => {
  // ... existing state and useEffect ...
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);


  if (!mounted) {
    // Render a placeholder respecting minimum size
    return <IconButton size="small" disabled sx={{ width: 34, height: 34, minWidth: 24, minHeight: 24 }} />;
  }

  const handleToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return (
    <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} theme`}>
      <IconButton
        onClick={handleToggle}
        size="small"
        aria-label="toggle theme"
        sx={{
          width: 40,
          height: 40,
          color: 'inherit',
        }}
      >
        {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggleButton;
