import React from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';

// Dynamically import ForceGraph2D
const ForceGraph2D = dynamic(
  () => import('react-force-graph').then((mod) => mod.ForceGraph2D),
  { ssr: false, loading: () => <CircularProgress /> }
);

const PhrasesLinkTab = ({ phraseLinkData, isLoading }) => {
  // Assuming phraseLinkData has { nodes: [{ id: 'phrase', name: 'phrase', val: count }], links: [{ source: 'phrase1', target: 'phrase2', value: strength }] }
  const { nodes = [], links = [] } = phraseLinkData || {};

  return (
    <Card elevation={2}>
      <CardHeader
        title={<Typography variant="h6">Phrase Connections</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Visualizing phrases that frequently appear close to each other in the text. Node size indicates phrase frequency.</Typography>}
      />
      <CardContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading phrase links...</Typography>
          </Box>
        ) : nodes.length < 2 ? (
          <Typography variant="body2" color="text.secondary">Not enough common phrases (at least 2) found or linked to visualize connections.</Typography>
        ) : (
          <Box sx={{ height: 450, border: '1px solid', borderColor: 'divider', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {typeof window !== 'undefined' && ForceGraph2D && (
              <ForceGraph2D
                graphData={{ nodes, links }}
                nodeLabel="name" // Display phrase on hover
                nodeVal="val" // Size nodes by frequency/importance
                nodeAutoColorBy="name" // Color nodes based on phrase
                linkDirectionalParticles={1} // Show direction/connection
                linkDirectionalParticleWidth={2}
                linkLabel={link => `${link.source.name} - ${link.target.name}`} // Optional: Show link info on hover
                height={448}
                // Consider making width responsive if needed
                width={typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 800) : 600} // Responsive width example
                // Optional: Add force engine configurations if needed
                // dagMode="td" // Example: Top-down hierarchy if applicable
                // dagLevelDistance={50}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PhrasesLinkTab;
