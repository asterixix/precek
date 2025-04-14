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
import fs from 'fs';
import path from 'path';

// Get the raw changelog content
// This will be evaluated at build-time by Next.js
const parseChangelogMd = (content) => {
  const versions = [];
  let currentVersion = null;
  let currentType = null;
  
  // Split content by lines
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Match version lines: ## [1.2.0] - 2025-04-14
    const versionMatch = line.match(/^## \[([^\]]+)\] - (.+)$/);
    if (versionMatch) {
      if (currentVersion) {
        versions.push(currentVersion);
      }
      currentVersion = {
        version: versionMatch[1],
        date: versionMatch[2],
        changes: {}
      };
      currentType = null;
      continue;
    }
    
    // Match change types: ### Added, ### Changed, etc.
    const typeMatch = line.match(/^### (.+)$/);
    if (typeMatch && currentVersion) {
      currentType = typeMatch[1];
      currentVersion.changes[currentType] = [];
      continue;
    }
    
    // Match change items (bullet points)
    const itemMatch = line.match(/^- (.+)$/);
    if (itemMatch && currentVersion && currentType) {
      currentVersion.changes[currentType].push(itemMatch[1]);
    }
  }
  
  // Add the last version
  if (currentVersion) {
    versions.push(currentVersion);
  }
  
  return versions;
};

// Read the changelog.md file at build time
const getStaticChangelog = () => {
  try {
    // This code runs at build time, not in the browser
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const fileContent = fs.readFileSync(changelogPath, 'utf8');
    return parseChangelogMd(fileContent);
  } catch (error) {
    console.error('Error reading changelog at build time:', error);
    return [];
  }
};

// Get the parsed changelog at build time
const staticChangelog = getStaticChangelog();

const ChangelogViewer = () => {
  const [changelog, setChangelog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use the statically parsed changelog data
    try {
      setChangelog(staticChangelog);
      setLoading(false);
    } catch (err) {
      console.error('Error loading changelog:', err);
      setError('Failed to load changelog data');
      setLoading(false);
    }
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
