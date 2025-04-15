import React from 'react';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton'; // Import IconButton
import DeleteIcon from '@mui/icons-material/Delete'; // Import DeleteIcon
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip
import { truncateText, getTypeColorMui } from '/src/utils/helpers'; // Import helpers

const ProcessedDataDisplay = ({
  processedData,
  onExportToCSV,
  onClearData,
  onDeleteItem, // Add new prop
  isProcessing,
}) => {
  if (!processedData || processedData.length === 0) {
    return null; // Don't render anything if there's no data
  }

  return (
    <Card>
      <CardHeader
        title={<Typography variant="h6">Processed Data</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">
          Recent results ({processedData.length} total items)
        </Typography>}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: { xs: 1, sm: 0 } }}>
            <Button
              onClick={onExportToCSV}
              variant="contained"
              color="secondary"
              size="small"
              disabled={isProcessing || processedData.length === 0}
            >
              Export All to CSV
            </Button>
            <Button
              onClick={onClearData}
              variant="contained"
              color="error"
              size="small"
              disabled={isProcessing || processedData.length === 0}
            >
              Clear All Data
            </Button>
          </Box>
        }
        sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' } }}
      />
      <CardContent>
        <Grid container spacing={2}>
          {/* Display only the first few items (e.g., 6) */}
          {processedData.slice(0, 6).map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}> {/* Use item.id as key */}
              <Card sx={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}> {/* Add position relative */}
                 {/* Delete Button */}
                 {onDeleteItem && ( // Only show if handler is provided
                    <Tooltip title="Delete this item">
                      <IconButton
                        aria-label="delete item"
                        onClick={() => onDeleteItem(item.id)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1, // Ensure it's above other content
                          backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          },
                        }}
                        disabled={isProcessing} // Disable while processing
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                 {/* Media Preview */}
                 {item.type === 'image' && item.data && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100, overflow: 'hidden', mb: 1, border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                      {/* WCAG 1.1.1: Improved alt text. Consider making this dynamic based on image content or filename if possible. */}
                      <Box component="img" src={item.data} alt={`Processed image: ${item.name || 'unnamed'}`} sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </Box>
                  )}
                  {item.type === 'audio' && item.data && (
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '10rem' }}>
                      <Box component="audio" controls src={item.data} sx={{ width: '100%' }} />
                    </Box>
                  )}
                  {item.type === 'video' && item.data && (
                    <Box sx={{ height: '10rem', bgcolor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <Box component="video" controls src={item.data} sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </Box>
                  )}
                  {/* Fallback for text or items without visual data */}
                  {!(item.type === 'image' || item.type === 'audio' || item.type === 'video') && (
                     <Box sx={{ height: '10rem', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                        <Typography variant="caption" color="text.secondary">No preview available</Typography>
                     </Box>
                  )}

                {/* Content Details */}
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', bgcolor: getTypeColorMui(item.type) }} />
                      <Typography variant="body2" fontWeight="medium">
                        {item.originalName ? truncateText(item.originalName, 25) : item.type.toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
                        {new Date(item.timestamp).toLocaleDateString()} {/* Show only date for brevity */}
                      </Typography>
                    </Box>
                    {(item.type === 'text' || item.processingResult) && (
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          mb: 2, // Add margin bottom
                        }}
                      >
                        {item.type === 'text'
                          ? truncateText(item.content || '', 100) // Shorter truncate
                          : truncateText(item.processingResult || '', 100) // Shorter truncate
                        }
                      </Typography>
                    )}
                  </Box>
                   {/* Action Button */}
                   {(item.type === 'text' || item.processingResult) && (
                     <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                       <Link href={`/readtext?id=${item.id}`} passHref style={{ textDecoration: 'none' }}>
                         <Button size="small" variant="text">
                           View Details
                         </Button>
                       </Link>
                     </Box>
                   )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Link to Visualization Page */}
        {processedData.length > 6 && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link href="/visualization" style={{ textDecoration: 'none' }}>
              <Typography color="primary" sx={{ '&:hover': { textDecoration: 'underline' }, cursor: 'pointer' }}>
                View all {processedData.length} items in visualizations →
              </Typography>
            </Link>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessedDataDisplay;
