import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Alert, Link } from '@mui/material';
import { getApiKeys } from '/src/utils/helpers'; // Import helper

const ApiKeyForm = ({ onKeysSaved }) => {
  const [openAIKey, setOpenAIKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [googleFactCheckKey, setGoogleFactCheckKey] = useState(''); // Add state for Google key
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load existing keys from helper (which checks localStorage and window)
    const keys = getApiKeys();
    setOpenAIKey(keys.openai || '');
    setOpenRouterKey(keys.openrouter || '');
    setGoogleFactCheckKey(keys.googleFactCheck || ''); // Load Google key
  }, []);

  const handleSave = () => {
    setError('');
    setMessage('');

    try {
      // Basic validation (optional, can be enhanced)
      // No specific validation needed for saving, but maybe for format later

      // Save to localStorage
      if (openAIKey) localStorage.setItem('openai_api_key', openAIKey);
      else localStorage.removeItem('openai_api_key'); // Clear if empty

      if (openRouterKey) localStorage.setItem('openrouter_api_key', openRouterKey);
      else localStorage.removeItem('openrouter_api_key'); // Clear if empty

      if (googleFactCheckKey) localStorage.setItem('google_fact_check_api_key', googleFactCheckKey); // Save Google key
      else localStorage.removeItem('google_fact_check_api_key'); // Clear if empty

      // Update global window object (for immediate use without reload if needed)
      // Ensure __PRECEK_API_KEYS exists or initialize it
      window.__PRECEK_API_KEYS = window.__PRECEK_API_KEYS || {};
      window.__PRECEK_API_KEYS.openai = openAIKey || '';
      window.__PRECEK_API_KEYS.openrouter = openRouterKey || '';
      window.__PRECEK_API_KEYS.googleFactCheck = googleFactCheckKey || ''; // Update window object

      // Also update the individual window properties if multimediaProcessor relies on them directly
      window.NEXT_PUBLIC_OPENAI_API_KEY = openAIKey || '';
      window.OPENROUTER_API_KEY = openRouterKey || '';
      window.GOOGLE_FACT_CHECK_API_KEY = googleFactCheckKey || ''; // Update window object

      setMessage('API Keys saved successfully!');
      if (onKeysSaved) {
        onKeysSaved(); // Notify parent component if needed
      }
    } catch (e) {
      console.error("Error saving API keys:", e);
      setError('Failed to save API keys. Check browser permissions for localStorage.');
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
      <Typography variant="h6" gutterBottom>
        Configure API Keys (Optional)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Provide your API keys to enable AI features and fact-checking. Keys are stored locally in your browser. If deploying, configure server-side environment variables for production use (especially for Google Fact Check). See{' '}
        <Link href="https://developers.google.com/fact-check/tools/api/guides/auth" target="_blank" rel="noopener">
          Google Fact Check API Key guide
        </Link>.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <TextField
        margin="normal"
        fullWidth
        id="openai-key"
        label="OpenAI API Key"
        name="openai-key"
        type="password"
        value={openAIKey}
        onChange={(e) => setOpenAIKey(e.target.value)}
        helperText="Optional. Used for features like text analysis."
      />
      <TextField
        margin="normal"
        fullWidth
        id="openrouter-key"
        label="OpenRouter API Key"
        name="openrouter-key"
        type="password"
        value={openRouterKey}
        onChange={(e) => setOpenRouterKey(e.target.value)}
        helperText="Optional. Alternative AI provider."
      />
      <TextField
        margin="normal"
        fullWidth
        id="google-fact-check-key"
        label="Google Fact Check API Key"
        name="google-fact-check-key"
        type="password"
        value={googleFactCheckKey}
        onChange={(e) => setGoogleFactCheckKey(e.target.value)}
        helperText="Optional. Enables the Fact Check feature in Visualization."
      />
      <Button
        type="button" // Prevent default form submission
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        onClick={handleSave}
      >
        Save API Keys
      </Button>
    </Box>
  );
};

export default ApiKeyForm;
