import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import VideocamIcon from '@mui/icons-material/Videocam';
import ImageIcon from '@mui/icons-material/Image';
import TextFieldsIcon from '@mui/icons-material/TextFields';

const ProcessingControls = ({
  onProcessText,
  onProcessTextFile,
  onProcessImage,
  onProcessAudio,
  onProcessVideo,
  isProcessing,
  keysConfigured,
  openaiApiKey, // Receive the OpenAI key prop
}) => {
  const [inputText, setInputText] = useState('');

  const handleTextSubmit = () => {
    if (!inputText) {
      alert('Please enter text to process');
      return;
    }
    onProcessText(inputText);
  };

  const handleFileChange = (handler) => (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (handler === onProcessTextFile) {
        handler(files); // Pass FileList for text files
      } else {
        handler(files[0]); // Pass single file for others
      }
    }
     // Reset file input value to allow selecting the same file again
    event.target.value = null;
  };

  const triggerFileInput = (accept, multiple, handler) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.onchange = handleFileChange(handler);
    input.click();
  };

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardHeader
        title={<Typography variant="h5">Process Content</Typography>}
        subheader={<Typography color="text.secondary">Input text or upload files for AI processing</Typography>}
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Text Input Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Text Input
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                id="text-input"
                fullWidth
                multiline
                minRows={4}
                maxRows={12}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to process"
                variant="outlined"
                disabled={isProcessing || !keysConfigured}
                sx={{ '& .MuiOutlinedInput-root': { padding: '12px', fontFamily: 'inherit' } }}
              />
              <Button
                variant="contained"
                onClick={handleTextSubmit}
                disabled={isProcessing || !keysConfigured || !inputText.trim()}
                startIcon={<TextFieldsIcon />}
                sx={{ alignSelf: 'flex-end' }}
                title={!keysConfigured ? "API keys required" : ""}
              >
                Process Text
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* File Upload Section */}
          <Box>
             <Typography variant="subtitle2" sx={{ mb: 1 }}>
               Upload Files
             </Typography>
             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                    variant="outlined"
                    component="span" // Use span to wrap the click handler logic
                    disabled={isProcessing || !keysConfigured}
                    startIcon={<CloudUploadIcon />}
                    onClick={() => triggerFileInput('.txt,.pdf', true, onProcessTextFile)}
                    title={!keysConfigured ? "API keys required" : ""}
                >
                    Upload Text File (.txt, .pdf)
                </Button>
                <Button
                  onClick={() => triggerFileInput('image/*', false, onProcessImage)}
                  variant="outlined"
                  disabled={isProcessing || !keysConfigured}
                  startIcon={<ImageIcon />}
                  title={!keysConfigured ? "API keys required" : ""}
                >
                  Process Image
                </Button>
                <Button
                  onClick={() => triggerFileInput('audio/*', false, onProcessAudio)}
                  variant="outlined"
                  // Disable if processing, keys not configured, OR openaiApiKey is missing
                  disabled={isProcessing || !keysConfigured || !openaiApiKey}
                  startIcon={<AudiotrackIcon />}
                  title={!keysConfigured ? "API keys required" : !openaiApiKey ? "OpenAI API key required for audio processing" : ""}
                >
                  Process Audio
                </Button>
                <Button
                  onClick={() => triggerFileInput('video/*', false, onProcessVideo)}
                  variant="outlined"
                  // Disable if processing, keys not configured, OR openaiApiKey is missing
                  disabled={isProcessing || !keysConfigured || !openaiApiKey}
                  startIcon={<VideocamIcon />}
                  title={!keysConfigured ? "API keys required" : !openaiApiKey ? "OpenAI API key required for video processing" : ""}
                >
                  Process Video
                </Button>
             </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProcessingControls;
