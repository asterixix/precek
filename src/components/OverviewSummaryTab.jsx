import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';

const MetricItem = ({ title, value, tooltip }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 0, mr: 0.5 }}>
          {title}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} placement="top">
            <InfoOutlinedIcon fontSize="small" color="action" />
          </Tooltip>
        )}
      </Box>
      <Typography variant="h5" component="div">
        {/* Ensure value is not null/undefined before rendering */}
        {value !== null && value !== undefined ? value : '-'}
      </Typography>
    </Paper>
  </Grid>
);

const OverviewSummaryTab = ({ overviewData, isLoading }) => {
  // Handle loading state first
  if (isLoading) {
    return (
      <Card elevation={2}>
        <CardHeader
          title={<Typography variant="h6">Text Overview Summary</Typography>}
        />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading summary...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Handle missing data or no texts processed state
  if (!overviewData || overviewData.totalTexts === 0) {
    return (
      <Card elevation={2}>
        <CardHeader
          title={<Typography variant="h6">Text Overview Summary</Typography>}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
            No summary data available. Process some text content first to see the overview metrics.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Destructure only if data is available
  const {
    totalWords = 0,
    totalPhrases = 0,
    totalTexts = 0,
    vocabularyDensity = 0,
    readabilityIndex = null,
    avgWordsPerSentence = 0,
  } = overviewData;

  // Format values
  const formattedTTR = vocabularyDensity.toFixed(3);
  const formattedAvgWords = avgWordsPerSentence.toFixed(1);
  const formattedReadability = readabilityIndex !== null ? readabilityIndex.toFixed(1) : 'N/A';

  return (
    <Card elevation={2}>
      <CardHeader
        title={<Typography variant="h6">Text Overview Summary</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Key metrics calculated across all processed texts</Typography>}
      />
      <CardContent>
        {/* Grid container remains the same */}
        <Grid container spacing={2} justifyContent="center">
            <MetricItem title="Total Texts" value={totalTexts} tooltip="Number of individual text documents processed." />
            <MetricItem title="Total Words" value={totalWords} tooltip="Total number of words across all texts." />
            <MetricItem title="Total Phrases" value={totalPhrases} tooltip="Total number of significant phrases identified (e.g., common bigrams/trigrams)." />
            <MetricItem title="Vocabulary Density (TTR)" value={formattedTTR} tooltip="Type-Token Ratio (Unique Words / Total Words). Higher indicates more diverse vocabulary." />
            <MetricItem title="Avg. Words/Sentence" value={formattedAvgWords} tooltip="Average number of words per sentence." />
            <MetricItem title="Readability Score" value={formattedReadability} tooltip="Estimated readability score (e.g., Flesch Reading Ease). Higher scores indicate easier readability. Varies by index used." />
        </Grid>
      </CardContent>
    </Card>
  );
};

export default OverviewSummaryTab;
