import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AFrameComponentWrapper from './AFrameComponentWrapper';

// Material UI components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';

// Create a component that only loads on client-side
const ForceGraph3D = dynamic(
  () => import('react-force-graph').then((mod) => mod.ForceGraph3D),
  { ssr: false }
);

const DataVisualization = ({ data, aframeLoaded }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [forceGraphReady, setForceGraphReady] = useState(false);
  
  useEffect(() => {
    // Process data into a format suitable for force-directed graph visualization
    if (!data || data.length === 0) return;
    
    const nodes = data.map((item, index) => ({
      id: index.toString(),
      name: item.originalName || `Item ${index}`,
      val: 1 + (item.processingResult ? item.processingResult.length / 500 : 1),
      color: getNodeColorByType(item.type),
      type: item.type || 'unknown',
    }));
    
    // Create connections between items with similar types or timestamps
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].type === nodes[j].type) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            color: getNodeColorByType(nodes[i].type, 0.3)
          });
        }
      }
    }
    
    setGraphData({ nodes, links });
    
    // Mark as ready when data is processed
    if (aframeLoaded) {
      setForceGraphReady(true);
    }
  }, [data, aframeLoaded]);

  // Set force graph as ready when A-Frame is available
  useEffect(() => {
    if (aframeLoaded) {
      setForceGraphReady(true);
    }
  }, [aframeLoaded]);

  // Don't try to render if A-Frame hasn't loaded yet
  if (!aframeLoaded || !forceGraphReady) {
    return (
      <Paper 
        elevation={1} 
        sx={{ 
          height: 400, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          borderRadius: 2
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Loading 3D visualization engine...
          </Typography>
          <CircularProgress size={32} />
        </Box>
      </Paper>
    );
  }

  return (
    <AFrameComponentWrapper>
      <Paper 
        elevation={1} 
        sx={{ 
          height: 400, 
          position: 'relative', 
          bgcolor: 'rgba(0, 0, 0, 0.04)', 
          borderRadius: 2,
          overflow: 'hidden' 
        }}
      >
        {graphData.nodes.length > 0 ? (
          <Fade in={true} timeout={800}>
            <Box sx={{ height: '100%' }}>
              <ForceGraph3D 
                graphData={graphData}
                nodeLabel="name"
                nodeColor="color"
                nodeVal="val"
                linkColor="color"
                backgroundColor="#111"
                width={typeof window !== 'undefined' ? window.innerWidth * 0.8 : 800}
                height={typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400}
              />
            </Box>
          </Fade>
        ) : (
          <Box 
            sx={{ 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No data available for visualization
            </Typography>
          </Box>
        )}
      </Paper>
    </AFrameComponentWrapper>
  );
};

// Helper function to get color based on content type
function getNodeColorByType(type, opacity = 1) {
  switch (type) {
    case 'text':
      return `rgba(59, 130, 246, ${opacity})`;
    case 'image':
      return `rgba(34, 197, 94, ${opacity})`;
    case 'audio':
      return `rgba(234, 179, 8, ${opacity})`;
    case 'video':
      return `rgba(168, 85, 247, ${opacity})`;
    default:
      return `rgba(107, 114, 128, ${opacity})`;
  }
}

export default DataVisualization;
