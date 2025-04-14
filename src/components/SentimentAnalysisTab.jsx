import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import SentimentChart from './SentimentChart'; // Import the extracted chart

const SentimentAnalysisTab = ({ sentimentData, isLoading }) => {
  const { items = [], overall = {} } = sentimentData || {};
  const {
    average = 0,
    topPositive = [],
    topNegative = [],
    positiveCount = 0,
    negativeCount = 0
  } = overall;

  const totalSentiments = positiveCount + negativeCount || 1; // Avoid division by zero

  const getSentimentLabel = (avg) => {
    if (avg > 5) return 'Very Positive';
    if (avg > 0) return 'Positive';
    if (avg === 0) return 'Neutral';
    if (avg > -5) return 'Negative';
    return 'Very Negative';
  };

  const getSentimentColor = (value) => {
     if (value > 0) return 'success.main';
     if (value < 0) return 'error.main';
     return 'text.secondary';
  };


  return (
    <Card elevation={2}>
      <CardHeader
        title={<Typography variant="h6">Sentiment Analysis</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Analysis using NLP techniques</Typography>}
      />
      <CardContent>
        {isLoading ? (
           <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
             <Typography>Loading analysis...</Typography>
           </Box>
        ) : !items || items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No sentiment data available.</Typography>
        ) : (
          <Box>
            {/* Summary Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Overall Sentiment Score */}
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>Overall Sentiment</Typography>
                  <Typography variant="h4" color={getSentimentColor(average)}> {/* Smaller variant */}
                    {average.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getSentimentLabel(average)}
                  </Typography>
                </Paper>
              </Grid>

              {/* Positive vs Negative Bar */}
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>Positive vs. Negative Words</Typography>
                  <Box sx={{ width: '100%', mt: 1 }}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                       <Typography variant="caption">Negative ({negativeCount})</Typography>
                       <Typography variant="caption">Positive ({positiveCount})</Typography>
                     </Box>
                     <Box sx={{ display: 'flex', height: 12, borderRadius: 1, overflow: 'hidden', bgcolor: 'action.hover' }}> {/* Bar container */}
                       <Box sx={{ bgcolor: 'error.main', width: `${(negativeCount / totalSentiments) * 100}%` }} />
                       <Box sx={{ bgcolor: 'success.main', width: `${(positiveCount / totalSentiments) * 100}%` }} />
                     </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Sentiment Over Time Chart */}
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>Sentiment Over Time</Typography>
                  <Box sx={{ height: 80 }}> {/* Container for the chart */}
                    <SentimentChart data={items} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Detailed Analysis: Top Words & Breakdown */}
            <Grid container spacing={2}>
              {/* Top Positive Words */}
              <Grid item xs={12} md={6}>
                <Card elevation={1} sx={{ height: '100%' }}>
                  <CardHeader title={<Typography variant="subtitle1">Top Positive Words</Typography>} sx={{ pb: 0 }} />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}> {/* Reduced gap */}
                      {topPositive.length > 0 ? topPositive.map(([word, count], idx) => (
                        <Chip key={idx} label={`${word} (${count})`} color="success" variant="outlined" size="small" />
                      )) : <Typography variant="caption">None</Typography>}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Negative Words */}
              <Grid item xs={12} md={6}>
                <Card elevation={1} sx={{ height: '100%' }}>
                  <CardHeader title={<Typography variant="subtitle1">Top Negative Words</Typography>} sx={{ pb: 0 }} />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}> {/* Reduced gap */}
                       {topNegative.length > 0 ? topNegative.map(([word, count], idx) => (
                        <Chip key={idx} label={`${word} (${count})`} color="error" variant="outlined" size="small" />
                      )) : <Typography variant="caption">None</Typography>}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sentiment Breakdown Table */}
              <Grid item xs={12}>
                <Card elevation={1}>
                  <CardHeader title={<Typography variant="subtitle1">Sentiment by Text</Typography>} sx={{ pb: 0 }} />
                  <CardContent>
                    <TableContainer component={Paper} sx={{ maxHeight: 250 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Text</TableCell>
                            <TableCell align="center">Score</TableCell>
                            <TableCell align="center">Normalized</TableCell>
                            <TableCell>Keywords</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {items.map((item) => ( // Use item.id if available and unique
                            <TableRow key={item.id || item.title} hover>
                              <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</TableCell>
                              <TableCell align="center" sx={{ color: getSentimentColor(item.sentiment), fontWeight: 'medium' }}>
                                {item.sentiment}
                              </TableCell>
                              <TableCell align="center" sx={{ color: getSentimentColor(item.comparative) }}>
                                {item.comparative.toFixed(2)}
                              </TableCell>
                              <TableCell sx={{ maxWidth: 150 }}>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {/* Show top 1-2 positive/negative words */}
                                  {item.positiveWords.slice(0, 1).map((word, i) => (
                                    <Chip key={`p-${i}`} label={word} size="small" color="success" variant="outlined" sx={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}/>
                                  ))}
                                  {item.negativeWords.slice(0, 1).map((word, i) => (
                                    <Chip key={`n-${i}`} label={word} size="small" color="error" variant="outlined" sx={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}/>
                                  ))}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysisTab;
