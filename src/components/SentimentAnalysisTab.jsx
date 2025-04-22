import React, { useState, useMemo } from 'react';
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import SentimentChart from './SentimentChart';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Helper functions for sentiment display
const getSentimentColor = (score) => {
  if (score > 5) return 'success.main';
  if (score > 0) return 'success.light';
  if (score < -5) return 'error.main';
  if (score < 0) return 'error.light';
  return 'text.primary';
};

const getSentimentLabel = (score) => {
  if (score > 5) return 'Very Positive';
  if (score > 2) return 'Positive';
  if (score > 0) return 'Slightly Positive';
  if (score < -5) return 'Very Negative';
  if (score < -2) return 'Negative';
  if (score < 0) return 'Slightly Negative';
  return 'Neutral';
};

const SentimentAnalysisTab = ({ sentimentData, isLoading }) => {
  const [lexiconTab, setLexiconTab] = useState('standard');
  const [chartMode, setChartMode] = useState('time'); // Add missing state
  
  const { items = [], overall = {} } = sentimentData || {};
  const {
    topPositive = [],
    topNegative = [],
    positiveCount = 0,
    negativeCount = 0,
  } = overall;

  // Calculate derived values
  const totalSentiments = positiveCount + negativeCount || 1; // Avoid division by zero
  const uniqueEmotionWords = useMemo(() => {
    const uniqueWords = new Set([
      ...topPositive.map(([word]) => word),
      ...topNegative.map(([word]) => word)
    ]);
    return uniqueWords.size;
  }, [topPositive, topNegative]);

  const sentimentVariance = useMemo(() => {
    if (!items || items.length <= 1) return 0;
    const scores = items.map(item => item.sentiment);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const squaredDifferences = scores.map(score => Math.pow(score - mean, 2));
    return Math.sqrt(squaredDifferences.reduce((sum, sqDiff) => sum + sqDiff, 0) / scores.length);
  }, [items]);

  // Generate peak sentiment data
  const sentimentPeaks = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    // Sort by absolute sentiment value to find emotional peaks
    return [...items]
      .sort((a, b) => Math.abs(b.sentiment) - Math.abs(a.sentiment))
      .slice(0, 3) // Take top 3 peaks
      .map(item => ({
        sentiment: item.sentiment,
        text: item.title
      }));
  }, [items]);

  const handleLexiconTabChange = (event, newValue) => {
    if (newValue !== null) {
      setLexiconTab(newValue);
    }
  };

  const handleChartModeChange = (event, newMode) => {
    if (newMode !== null) {
      setChartMode(newMode);
    }
  };

  const getCurrentLexiconData = () => {
    if (!sentimentData?.items) return [];
    return sentimentData.items.map(item => ({
      ...item,
      sentiment: item.lexicons?.[lexiconTab]?.score || 0,
      comparative: item.lexicons?.[lexiconTab]?.comparative || 0
    }));
  };

  const getCurrentLexiconAverage = () => {
    return sentimentData?.overall?.lexiconAverages?.[lexiconTab] || 0;
  };

  const getChartDataForLexicon = () => {
    // Return the items with the correct lexicon data for charting
    return getCurrentLexiconData();
  };

  return (
    <Card elevation={2}>
      <CardHeader
        title={<Typography variant="h6">Sentiment Analysis</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Analysis using multiple lexicons</Typography>}
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
            {/* Lexicon Selection Tabs */}
            <Tabs 
              value={lexiconTab} 
              onChange={handleLexiconTabChange}
              variant="standard"
            >
              <Tab value="standard" label="Default" />
              <Tab value="afinn" label="AFINN" />
              <Tab value="nlpjs" label="NLP.js" />
            </Tabs>

            {/* Summary Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Overall Sentiment Score */}
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>Overall Sentiment</Typography>
                  <Typography variant="h4" color={getSentimentColor(getCurrentLexiconAverage())}>
                    {getCurrentLexiconAverage().toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getSentimentLabel(getCurrentLexiconAverage())}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Stability: {sentimentVariance.toFixed(2)}
                    </Typography>
                    <Tooltip title="Lower values indicate more consistent sentiment across texts">
                      <InfoIcon fontSize="small" sx={{ ml: 0.5, fontSize: 16, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
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
                     <Box sx={{ display: 'flex', height: 12, borderRadius: 1, overflow: 'hidden', bgcolor: 'action.hover' }}>
                       <Box sx={{ bgcolor: 'error.main', width: `${(negativeCount / totalSentiments) * 100}%` }} />
                       <Box sx={{ bgcolor: 'success.main', width: `${(positiveCount / totalSentiments) * 100}%` }} />
                     </Box>
                     <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Emotional Vocabulary: {uniqueEmotionWords} unique terms
                        </Typography>
                     </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Sentiment Charts with Toggle */}
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1">Sentiment Pattern</Typography>
                    <ToggleButtonGroup
                      size="small"
                      value={chartMode}
                      exclusive
                      onChange={handleChartModeChange}
                    >
                      <ToggleButton value="time" aria-label="time-based">Time</ToggleButton>
                      <ToggleButton value="narrative" aria-label="narrative-based">Arc</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <Box sx={{ height: 80 }}>
                    <SentimentChart 
                      data={getChartDataForLexicon()} 
                      mode={chartMode} 
                      syuzhetData={getChartDataForLexicon()}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'center' }}>
                    {chartMode === 'time' ? 'Sentiment over time' : 'Emotional arc of the narrative'}
                    {lexiconTab !== 'combined' && ` (${lexiconTab} lexicon)`}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Peaks and Words Analysis */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Top Positive Words */}
              <Grid item xs={12} md={4}>
                <Card elevation={1} sx={{ height: '100%' }}>
                  <CardHeader title={<Typography variant="subtitle1">Top Positive Words</Typography>} sx={{ pb: 0 }} />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {topPositive.length > 0 ? topPositive.map(([word, count], idx) => (
                        <Chip key={idx} label={`${word} (${count})`} color="success" variant="outlined" size="small" />
                      )) : <Typography variant="caption">None</Typography>}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Negative Words */}
              <Grid item xs={12} md={4}>
                <Card elevation={1} sx={{ height: '100%' }}>
                  <CardHeader title={<Typography variant="subtitle1">Top Negative Words</Typography>} sx={{ pb: 0 }} />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                       {topNegative.length > 0 ? topNegative.map(([word, count], idx) => (
                        <Chip key={idx} label={`${word} (${count})`} color="error" variant="outlined" size="small" />
                      )) : <Typography variant="caption">None</Typography>}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Emotional Peaks */}
              <Grid item xs={12} md={4}>
                <Card elevation={1} sx={{ height: '100%' }}>
                  <CardHeader title={<Typography variant="subtitle1">Emotional Peaks</Typography>} sx={{ pb: 0 }} />
                  <CardContent>
                    {sentimentPeaks.length > 0 ? (
                      <Box>
                        {sentimentPeaks.map((peak, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Chip 
                              label={peak.sentiment.toFixed(1)} 
                              size="small" 
                              color={peak.sentiment > 0 ? "success" : "error"} 
                              sx={{ mr: 1, minWidth: 42 }}
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                flex: 1, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap' 
                              }}
                            >
                              {peak.text}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="caption">No significant peaks found</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Sentiment Breakdown Table */}
            <Grid container>
              <Grid item xs={12}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Text</TableCell>
                        <TableCell align="center">Score ({lexiconTab})</TableCell>
                        <TableCell align="center">Normalized</TableCell>
                        <TableCell>Keywords</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getCurrentLexiconData().map((item) => (
                        <TableRow key={item.id || item.title} hover>
                          <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</TableCell>
                          <TableCell align="center" sx={{ color: getSentimentColor(item.sentiment), fontWeight: 'medium' }}>
                            {typeof item.sentiment === 'number' ? item.sentiment.toFixed(1) : 'N/A'}
                          </TableCell>
                          <TableCell align="center" sx={{ color: getSentimentColor(item.comparative) }}>
                            {typeof item.comparative === 'number' ? item.comparative.toFixed(2) : 'N/A'}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 150 }}>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {/* Display lexicon-specific scores with safety checks */}
                              {item.lexicons && typeof item.lexicons === 'object' && Object.entries(item.lexicons)
                                .filter(([name, data]) => name !== 'combined' && data && typeof data === 'object')
                                .map(([name, data]) => {
                                  // Safely access score with fallback
                                  const score = typeof data.score === 'number' ? data.score : 0;
                                  return (
                                    <Tooltip key={name} title={`${name} lexicon: ${score.toFixed(1)}`}>
                                      <Chip 
                                        label={`${name.substring(0,1).toUpperCase()}: ${score.toFixed(1)}`} 
                                        size="small" 
                                        color={score > 0 ? "success" : score < 0 ? "error" : "default"} 
                                        variant="outlined"
                                        sx={{ height: '20px', fontSize: '0.625rem' }}
                                      />
                                    </Tooltip>
                                  );
                                })}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysisTab;
