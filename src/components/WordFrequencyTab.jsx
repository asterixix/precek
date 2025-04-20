import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid'; // Import Grid
import CircularProgress from '@mui/material/CircularProgress'; // For dynamic loading
import { TextField } from '@mui/material';

// Dynamically import ReactWordcloud
const ReactWordcloud = dynamic(() => import('react-wordcloud'), {
  ssr: false, // Ensure it only runs on the client
  loading: () => <CircularProgress size={24} />, // Show a spinner while loading
});


const WordFrequencyTab = ({ wordFrequencyData, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [wordLimit, setWordLimit] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  // Calculate max count for scaling, ensuring it's at least 1
  const maxWordCount = Math.max(...wordFrequencyData.map(d => d.count), 1);

  // Get the total number of words for limiting input
  const totalWordCount = wordFrequencyData.length;

  // Prepare data for react-wordcloud: expects { text: string, value: number }
  const wordCloudWords = wordFrequencyData.map(item => ({
    text: item.word,
    value: item.count,
  }));

  // Apply word limit if it's set and valid
  const filteredWordCloudWords = wordLimit && !isNaN(parseInt(wordLimit)) && parseInt(wordLimit) > 0
    ? wordCloudWords.slice(0, parseInt(wordLimit))
    : wordCloudWords;

  // Options for the word cloud (customize as needed)
  const wordCloudOptions = {
    rotations: 2,
    rotationAngles: [-90, 0],
    fontSizes: [12, 60], // Adjust min/max font size
    padding: 1,
    enableTooltip: true,
  };

  // Debounced update of the actual wordLimit that triggers re-renders
  useEffect(() => {
    if (inputValue === '') {
      setWordLimit(null);
      setError('');
      return;
    }

    const numVal = parseInt(inputValue);
    if (isNaN(numVal)) return;

    // Check if input is greater than 50
    if (numVal > 50) {
      setError('Value cannot be greater than 50');
      return;
    } else {
      setError('');
    }

    const timer = setTimeout(() => {
      setIsUpdating(true);

      let finalValue = numVal;
      if (numVal < 1) finalValue = 1;
      if (numVal > totalWordCount) finalValue = totalWordCount;

      setWordLimit(finalValue.toString());
      setIsUpdating(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [inputValue, totalWordCount]);

  const handleWordLimitChange = (event) => {
    const val = event.target.value;

    // Reject non-numeric input
    if (val.match(/[^0-9]/)) {
      return;
    }

    setInputValue(val);
  };

  return (
    <Card elevation={2}>
      <CardHeader
        title={<Typography variant="h6">Word Frequency Analysis</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Most common words (Top 50) and visualization</Typography>}
      />
      <CardContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography>Loading analysis...</Typography>
          </Box>
        ) : wordFrequencyData.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No word frequency data available or text is too short.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Typography>
                Enter no. of words to display on word cloud (1-50):
              </Typography>
              <TextField
                placeholder='Enter no. of words'
                inputProps={{
                  inputMode: "numeric",
                  min: 1,
                  max: 50
                }}
                value={inputValue}
                onChange={handleWordLimitChange}
                size="small"
                error={!!error}
                helperText={error}
                sx={{
                  '& .MuiInputBase-root': {
                    height: 32
                  }
                }}
              />
            </Box>
            <Grid container spacing={3}>
              {/* Word Cloud Section */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom align="center">
                  Word Cloud {wordLimit ? `(Top ${wordLimit} words)` : '(All words)'}
                </Typography>
                <Box sx={{ height: 350, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Render word cloud only on client side */}
                  {isUpdating ? (
                    <CircularProgress size={24} />
                  ) : (
                    typeof window !== 'undefined' && ReactWordcloud && (
                      <ReactWordcloud
                        words={filteredWordCloudWords}
                        options={wordCloudOptions}
                        key={`wordcloud-${wordLimit || 'all'}`} // Force re-render when limit changes
                      />
                    )
                  )}
                </Box>
              </Grid>

              {/* Word List Section */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom align="center">Frequency List</Typography>
                <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                  {wordFrequencyData.map((item, index) => (
                    <Box key={index} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">{item.word}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.count}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(item.count / maxWordCount) * 100}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WordFrequencyTab;
