import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress'; // Use LinearProgress for bar

const WordFrequencyTab = ({ wordFrequencyData, isLoading }) => {
  // Calculate max count for scaling, ensuring it's at least 1
  const maxWordCount = Math.max(...wordFrequencyData.map(d => d.count), 1);

  return (
    <Card elevation={2}>
      <CardHeader
        title={<Typography variant="h6">Word Frequency Analysis</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Most common words (Top 50)</Typography>}
      />
      <CardContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
             <Typography>Loading analysis...</Typography>
          </Box>
        ) : wordFrequencyData.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No word frequency data available or text is too short.</Typography>
        ) : (
          <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}> {/* Use maxHeight */}
            {wordFrequencyData.map((item, index) => (
              <Box key={index} sx={{ mb: 1.5 }}> {/* Reduced margin */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight="medium">{item.word}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.count}</Typography> {/* Use caption */}
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={(item.count / maxWordCount) * 100}
                    sx={{ height: 6, borderRadius: 1 }} // Slightly thinner bar
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WordFrequencyTab;
