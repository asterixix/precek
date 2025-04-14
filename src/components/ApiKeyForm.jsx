import React, { useState, useEffect } from 'react';
import { getApiKeys } from '/src/utils/helpers';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link'; // Import Link for external URLs

// Accept initialKeys prop - simplified
const ApiKeyForm = ({ onKeysSaved, initialKeys = { openai: '' } }) => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasDefaultOpenRouterKey, setHasDefaultOpenRouterKey] = useState(false);

  // Load existing OpenAI key and check if default OpenRouter key exists
  useEffect(() => {
    // Check if a build-time default key exists
    const buildTimeOpenRouterKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
    setHasDefaultOpenRouterKey(!!buildTimeOpenRouterKey);

    // Use initialKeys prop for OpenAI if provided, otherwise fetch from helpers
    const keys = initialKeys.openai ? initialKeys : getApiKeys(); // Only need OpenAI from initialKeys now
    setOpenaiKey(keys.openai || '');

  }, [initialKeys]); // Depend on initialKeys

  const handleSave = () => {
    setError('');
    setSuccess('');

    // Basic validation: Check if OpenAI key is provided (if no default OpenRouter key exists)
    // Or allow saving even if empty, letting the backend handle it? Let's require OpenAI if no default OR key.
    if (!openaiKey && !hasDefaultOpenRouterKey) {
      setError('Please provide an OpenAI API key. A default OpenRouter key is not available in this build.');
      return;
    }
    // If a default OR key exists, saving an empty OpenAI key is acceptable.
    // If only OpenAI key is provided, that's also fine.

    try {
      // Save/Remove only OpenAI key to localStorage
      if (openaiKey) localStorage.setItem('openai_api_key', openaiKey);
      else localStorage.removeItem('openai_api_key');

      // Update only OpenAI key on the window object
      window.__PRECEK_API_KEYS = window.__PRECEK_API_KEYS || {};
      window.__PRECEK_API_KEYS.openai = openaiKey || '';

      // REMOVE Deprecated direct window properties
      // window.NEXT_PUBLIC_OPENAI_API_KEY = openaiKey || '';
      // window.OPENROUTER_API_KEY = '';

      setSuccess('OpenAI API key saved successfully!');
      if (onKeysSaved) {
        onKeysSaved(); // Notify parent component
      }

      // Clear success message after a delay
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('Error saving API keys:', err);
      setError('Failed to save API keys. Check browser permissions for localStorage.');
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" sx={{ mt: 1, mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>Configure API Keys</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Enter your OpenAI API key below. Keys are stored locally in your browser&apos;s localStorage and only sent to OpenAI.
        {hasDefaultOpenRouterKey ?
          " A default OpenRouter API key is configured in this build and will be used for accessing various other models." :
          " An OpenRouter key is not configured in this build, so only OpenAI models will be available."}
        <br /><br />
        <strong>How to get an OpenAI API Key:</strong>
        <ul>
          <li>
            Visit{' '}
            <Link href="https://platform.openai.com/settings/organization/api-keys" target="_blank" rel="noopener noreferrer">
              platform.openai.com/settings/organization/api-keys
            </Link>
            , sign in, and create a new secret key.
          </li>
        </ul>
         <br />
         <strong>Security Reminder:</strong> Your OpenAI key is stored in your browser's local storage. {hasDefaultOpenRouterKey && "The default OpenRouter key is embedded in the application code."}
      </Alert>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TextField
        label="OpenAI API Key"
        variant="outlined"
        fullWidth
        margin="normal"
        type="password"
        value={openaiKey}
        onChange={(e) => setOpenaiKey(e.target.value)}
        helperText={hasDefaultOpenRouterKey ? "Optional. If provided, allows access to OpenAI models." : "Required for processing."}
      />
      <Button
        variant="contained"
        onClick={handleSave}
        sx={{ mt: 2 }}
        disabled={!openaiKey && !hasDefaultOpenRouterKey}
      >
        Save Key {/* Changed button text */}
      </Button>
    </Box>
  );
};

export default ApiKeyForm;
