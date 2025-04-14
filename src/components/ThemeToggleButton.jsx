import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon icon for dark
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun icon for light
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'; // System icon

const ThemeToggleButton = () => {
  // ... existing state and useEffect ...
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  // useEffect only runs on the client, so we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);


  if (!mounted) {
    // Render a placeholder respecting minimum size
    return <IconButton size="small" disabled sx={{ width: 34, height: 34, minWidth: 24, minHeight: 24 }} />;
  }

  // ... existing handleThemeChange, getTooltipTitle, renderIcon ...
  const handleThemeChange = () => {
    // Cycle through themes: system -> light -> dark -> system
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const getTooltipTitle = () => {
    if (theme === 'system') return `Switch to Light Theme (Current: System/${resolvedTheme})`;
    if (theme === 'light') return 'Switch to Dark Theme';
    return 'Switch to System Theme';
  };

  const renderIcon = () => {
    // Show icon based on the *resolved* theme (what's actually displayed)
    switch (resolvedTheme) {
      case 'dark':
        return <Brightness4Icon fontSize="small" />;
      case 'light':
        return <Brightness7Icon fontSize="small" />;
      default: // Should not happen if mounted, but fallback
        return <SettingsBrightnessIcon fontSize="small" />;
    }
  };


  return (
    <Tooltip title={getTooltipTitle()}>
      <IconButton
        onClick={handleThemeChange}
        color="inherit"
        size="small"
        aria-label="toggle theme"
        sx={{
          // Ensure minimum target size for WCAG 2.5.8
          minWidth: '24px',
          minHeight: '24px',
          // Maintain visual size if desired (adjust if needed)
          width: 34,
          height: 34,
        }}
      >
        {renderIcon()}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggleButton;
