import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const ChangelogViewer = () => {
  const [changelog, setChangelog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the changelog file
    fetch('/api/changelog')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch changelog');
        }
        return response.json();
      })
      .then(data => {
        setChangelog(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading changelog:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Function to determine icon based on change type
  const getChangeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'added':
        return <AddCircleIcon color="success" />;
      case 'changed':
        return <ChangeCircleIcon color="primary" />;
      case 'removed':
        return <RemoveCircleIcon color="error" />;
      default:
        return <ChangeCircleIcon color="action" />;
    }
  };

  // Function to determine color based on change type
  const getChipColor = (type) => {
    switch (type.toLowerCase()) {
      case 'added':
        return 'success';
      case 'changed':
        return 'primary';
      case 'removed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Box sx={{ textAlign: 'center', py: 3 }}>
      <Typography variant="body1">Loading changelog...</Typography>
    </Box>;
  }

  if (error) {
    return <Box sx={{ textAlign: 'center', py: 3 }}>
      <Typography variant="body1" color="error">Error: {error}</Typography>
    </Box>;
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Changelog
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Track all updates and improvements to our application
      </Typography>

      {changelog.length === 0 ? (
        <Typography variant="body1">No changelog entries available</Typography>
      ) : (
        changelog.map((version, index) => (
          <Accordion key={index} defaultExpanded={index === 0}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`version-${version.version}-content`}
              id={`version-${version.version}-header`}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Version {version.version}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={version.date} 
                    size="small" 
                    variant="outlined" 
                    sx={{ mx: 1 }} 
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Divider sx={{ mb: 2 }} />
              {Object.entries(version.changes).map(([type, items], typeIndex) => (
                <Box key={typeIndex} sx={{ mb: 2 }}>
                  <Chip 
                    label={type} 
                    color={getChipColor(type)} 
                    size="small" 
                    sx={{ mb: 1 }} 
                  />
                  <List dense disablePadding>
                    {items.map((item, itemIndex) => (
                      <ListItem key={itemIndex} disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {getChangeIcon(type)}
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Paper>
  );
};

export default ChangelogViewer;
