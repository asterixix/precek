import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const TopicModelingTab = ({ topicModelData, isLoading }) => {

  // Helper to scale font size based on strength (example)
  const getFontSize = (strength) => {
    // Simple scaling - adjust as needed
    const baseSize = 1; // rem
    const scaleFactor = 0.5;
    return `${baseSize + strength * scaleFactor}rem`;
  };

  return (
    <Card elevation={2}>
      <CardHeader
        title={<Typography variant="h6">Topic Modeling (Simplified)</Typography>}
        subheader={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Identified potential topics based on word co-occurrence</Typography>
                <Tooltip title="This is a basic topic modeling approach. More advanced techniques (like LDA) usually require server-side processing.">
                    <InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary' }} />
                </Tooltip>
            </Box>
        }
      />
      <CardContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading topics...</Typography>
          </Box>
        ) : !topicModelData || topicModelData.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No topics could be identified from the text data.</Typography>
        ) : (
          <Grid container spacing={2}>
            {topicModelData.map((topic, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                        fontSize: getFontSize(topic.normalizedStrength), // Dynamic font size
                        fontWeight: 'bold',
                        color: 'primary.main',
                        mb: 1
                    }}
                  >
                    {topic.mainWord}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" mb={1}>
                    Strength: {topic.strength} (Normalized: {topic.normalizedStrength.toFixed(2)})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {topic.relatedWords.map((word, idx) => (
                      <Chip key={idx} label={word} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default TopicModelingTab;
