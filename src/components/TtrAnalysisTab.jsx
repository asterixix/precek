import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

const TtrAnalysisTab = ({ ttrData, isLoading }) => {
  const { ttr = 0, uniqueWords = 0, totalWords = 0 } = ttrData || {};

  // Format TTR to a reasonable number of decimal places
  const formattedTTR = ttr.toFixed(3);

  return (
    <Card elevation={2}>
      <CardHeader
        title={<Typography variant="h6">Type-Token Ratio (TTR)</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Measure of lexical diversity</Typography>}
      />
      <CardContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
             <CircularProgress />
             <Typography sx={{ ml: 2 }}>Loading TTR data...</Typography>
          </Box>
        ) : totalWords === 0 ? (
           <Typography variant="body2" color="text.secondary">Not enough text data to calculate TTR.</Typography>
        ) : (
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>Total Words</Typography>
                <Typography variant="h5">{totalWords}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>Unique Words</Typography>
                <Typography variant="h5">{uniqueWords}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="subtitle1" gutterBottom>TTR</Typography>
                <Typography variant="h5">{formattedTTR}</Typography>
                 <Typography variant="caption">(Unique / Total)</Typography>
              </Paper>
            </Grid>
             <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{mt: 2, textAlign: 'center'}}>
                    TTR measures the variety of vocabulary used. A higher TTR indicates greater lexical diversity. Values typically range from 0 to 1.
                </Typography>
             </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default TtrAnalysisTab;
