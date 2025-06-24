import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Import Icon

const TtrAnalysisTab = ({ ttrData, isLoading }) => {
  const theme = useTheme(); // Get theme object
  const { ttr = 0, uniqueWords = 0, totalWords = 0 } = ttrData || {};

  // Format TTR
  const formattedTTR = ttr.toFixed(3);

  // Define styles for Paper components
  const paperStyle = {
    p: 2.5, // Increased padding
    textAlign: 'center',
    height: '100%', // Ensure papers have same height
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    border: `1px solid ${theme.palette.divider}`, // Subtle border
    borderRadius: theme.shape.borderRadius, // Use theme border radius
  };

  // Theme-aware background color for non-primary cards
  const cardBackgroundColor = theme.palette.mode === 'dark' 
    ? theme.palette.grey[100] // Dark mode: use a lighter shade
    : theme.palette.grey[100]; // Light mode: use original

  return (
    <Card elevation={2}>
      <CardHeader
        title={<Typography variant="h6">Type-Token Ratio (TTR) Analysis</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Measure of lexical diversity in the text</Typography>}
      />
      <CardContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
             <CircularProgress />
             <Typography sx={{ ml: 2 }}>Loading TTR data...</Typography>
          </Box>
        ) : totalWords === 0 ? (
           <Typography variant="body2" color="text.secondary">Not enough text data (minimum words required) to calculate TTR.</Typography>
        ) : (
          <Box>
            <Grid container spacing={3} justifyContent="center" alignItems="stretch"> {/* Use alignItems stretch */}
              <Grid item xs={12} sm={4}>
                <Paper elevation={0} sx={{ ...paperStyle, backgroundColor: cardBackgroundColor }}>
                  <Typography variant="overline" color="text.secondary" gutterBottom>Total Words</Typography>
                  <Typography variant="h4" component="div">{totalWords}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper elevation={0} sx={{ ...paperStyle, backgroundColor: cardBackgroundColor }}>
                  <Typography variant="overline" color="text.secondary" gutterBottom>Unique Words</Typography>
                  <Typography variant="h4" component="div">{uniqueWords}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                {/* Emphasize TTR */}
                <Paper elevation={1} sx={{ ...paperStyle, backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
                   <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                     <Typography variant="overline" gutterBottom sx={{ mb: 0, mr: 0.5 }}>
                       TTR Score
                     </Typography>
                     <Tooltip title="Type-Token Ratio (Unique Words / Total Words). Higher values (closer to 1) indicate greater lexical diversity." placement="top">
                       <InfoOutlinedIcon fontSize="small" sx={{ color: theme.palette.primary.contrastText }} />
                     </Tooltip>
                   </Box>
                  <Typography variant="h4" component="div">{formattedTTR}</Typography>
                  <Typography variant="caption">(Unique / Total)</Typography>
                </Paper>
              </Grid>
            </Grid>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
                TTR measures the variety of vocabulary used. A higher TTR indicates greater lexical diversity. Values typically range from 0 to 1, though the meaningful range depends heavily on text length.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TtrAnalysisTab;
