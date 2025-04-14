import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Custom Hook for analysis logic
import useTextAnalysis from '/src/hooks/useTextAnalysis';

// Material UI components
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress'; // For loading state

// Import Tab Panel Components (Add others as they are created)
import WordFrequencyTab from './WordFrequencyTab';
import SentimentAnalysisTab from './SentimentAnalysisTab';
// import TextRelationshipsTab from './TextRelationshipsTab'; // Example placeholder
// import TtrAnalysisTab from './TtrAnalysisTab'; // Example placeholder
// import ConcordanceTab from './ConcordanceTab'; // Example placeholder
// import TopicModelingTab from './TopicModelingTab'; // Example placeholder

// Dynamically import components that might have issues with SSR or large size
const ForceGraph2D = dynamic(
  () => import('react-force-graph').then((mod) => mod.ForceGraph2D),
  { ssr: false, loading: () => <p>Loading graph...</p> } // Add loading state for dynamic import
);

// Reusable TabPanel component (can be moved to utils)
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const TextAnalysisVisualizations = ({ data }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Use the custom hook to get analysis data and loading state
  const {
    wordFrequencyData,
    sentimentData,
    relationshipData,
    concordanceData,
    ttrData,
    topicModelData,
    isLoading, // Get loading state from hook
    searchConcordance, // Get search function
  } = useTextAnalysis(data);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle concordance search input change
  const handleConcordanceSearch = (term) => {
      searchConcordance(term); // Call the function from the hook
  };


  // Show loading indicator centrally if analyses are running
  if (isLoading) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Analyzing data...</Typography>
          </Box>
      );
  }

  // Show message if no data is provided
  if (!data || data.length === 0) {
      return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No data available for analysis. Process some content first.</Typography>
          </Box>
      );
  }


  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Text analysis tabs"
        >
          <Tab label="Word Frequency" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Sentiment" id="tab-1" aria-controls="tabpanel-1" />
          <Tab label="Relationships" id="tab-2" aria-controls="tabpanel-2" />
          <Tab label="TTR" id="tab-3" aria-controls="tabpanel-3" />
          <Tab label="Concordance" id="tab-4" aria-controls="tabpanel-4" />
          <Tab label="Topics" id="tab-5" aria-controls="tabpanel-5" />
        </Tabs>
      </Box>

      {/* Render Tab Panels with extracted components */}
      <TabPanel value={activeTab} index={0}>
        <WordFrequencyTab wordFrequencyData={wordFrequencyData} isLoading={isLoading} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <SentimentAnalysisTab sentimentData={sentimentData} isLoading={isLoading} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Placeholder for TextRelationshipsTab */}
        {/* <TextRelationshipsTab relationshipData={relationshipData} isLoading={isLoading} /> */}
         <Typography>Text Relationships Tab Content (Refactor Pending)</Typography>
         {/* Example: Keep original logic here until refactored */}
         {relationshipData.nodes.length < 2 ? (
             <Typography variant="body2" color="text.secondary">Not enough data for relationships.</Typography>
         ) : (
             <Box sx={{ height: 400, border: '1px dashed grey', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {/* Ensure ForceGraph2D is loaded */}
                 {typeof window !== 'undefined' && ForceGraph2D && (
                     <ForceGraph2D
                         graphData={relationshipData}
                         nodeLabel="name"
                         nodeAutoColorBy="name"
                         linkDirectionalParticles={1}
                         linkDirectionalParticleWidth={2}
                         height={398} // Fit within box
                         width={typeof window !== 'undefined' ? window.innerWidth * 0.8 : 600} // Adjust width dynamically or set fixed
                     />
                 )}
             </Box>
         )}
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* Placeholder for TtrAnalysisTab */}
        {/* <TtrAnalysisTab ttrData={ttrData} isLoading={isLoading} /> */}
         <Typography>TTR Analysis Tab Content (Refactor Pending)</Typography>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
         {/* Placeholder for ConcordanceTab */}
         {/* <ConcordanceTab concordanceData={concordanceData} onSearch={handleConcordanceSearch} isLoading={isLoading} /> */}
         <Typography>Concordance Tab Content (Refactor Pending)</Typography>
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
         {/* Placeholder for TopicModelingTab */}
         {/* <TopicModelingTab topicModelData={topicModelData} isLoading={isLoading} /> */}
         <Typography>Topic Modeling Tab Content (Refactor Pending)</Typography>
      </TabPanel>

    </Box>
  );
};

export default TextAnalysisVisualizations;
