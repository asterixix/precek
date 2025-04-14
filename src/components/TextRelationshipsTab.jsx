import React from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(
  () => import('react-force-graph').then((mod) => mod.ForceGraph2D),
  { ssr: false, loading: () => <CircularProgress /> }
);

const TextRelationshipsTab = ({ relationshipData, isLoading }) => {
  const { nodes = [], links = [] } = relationshipData || {};

  return (
    <Card elevation={2}>
      <CardHeader
        title={<Typography variant="h6">Text Relationships</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Visualizing connections between texts (basic similarity)</Typography>}
      />
      <CardContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading relationships...</Typography>
          </Box>
        ) : nodes.length < 2 ? (
          <Typography variant="body2" color="text.secondary">Not enough data points (at least 2) to visualize relationships.</Typography>
        ) : (
          <Box sx={{ height: 400, border: '1px solid', borderColor: 'divider', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Ensure ForceGraph2D is loaded only on client-side */}
            {typeof window !== 'undefined' && ForceGraph2D && (
              <ForceGraph2D
                graphData={{ nodes, links }}
                nodeLabel="name"
                nodeVal="val" // Use 'val' for node size if calculated in hook
                nodeAutoColorBy="name"
                linkDirectionalParticles={links.length > 0 ? 1 : 0} // Show particles only if links exist
                linkDirectionalParticleWidth={2}
                height={398} // Fit within box
                // Adjust width dynamically based on container or use a fixed value
                // Using 100% width relative to the container might be better
                // width={typeof window !== 'undefined' ? window.innerWidth * 0.7 : 600} // Example dynamic width
                // Let's try making it responsive to the container
                // The graph component might need a specific width prop, let's keep it simple for now
                 width={600} // Default width, adjust as needed
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TextRelationshipsTab;
