import React from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid'; // Import Grid
import CircularProgress from '@mui/material/CircularProgress'; // For dynamic loading

// Dynamically import ReactWordcloud
const ReactWordcloud = dynamic(() => import('react-wordcloud'), {
  ssr: false, // Ensure it only runs on the client
  loading: () => <CircularProgress size={24} />, // Show a spinner while loading
});


const WordFrequencyTab = ({ wordFrequencyData, isLoading }) => {
  // Calculate max count for scaling, ensuring it's at least 1
  const maxWordCount = Math.max(...wordFrequencyData.map(d => d.count), 1);

  // Prepare data for react-wordcloud: expects { text: string, value: number }
  const wordCloudWords = wordFrequencyData.map(item => ({
    text: item.word,
    value: item.count,
  }));

  // Options for the word cloud (customize as needed)
  const wordCloudOptions = {
    rotations: 2,
    rotationAngles: [-90, 0],
    fontSizes: [12, 60], // Adjust min/max font size
    padding: 1,
    enableTooltip: true,
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
          <Grid container spacing={3}>
            {/* Word Cloud Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom align="center">Word Cloud</Typography>
              <Box sx={{ height: 350, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Render word cloud only on client side */}
                {typeof window !== 'undefined' && ReactWordcloud && (
                  <ReactWordcloud words={wordCloudWords} options={wordCloudOptions} />
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
        )}
      </CardContent>
    </Card>
  );
};

export default WordFrequencyTab;
