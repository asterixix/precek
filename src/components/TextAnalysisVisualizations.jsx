import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import dynamic from 'next/dynamic';

// Material UI components
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress'; // For loading state

// Import the hook
import useTextAnalysis from '../hooks/useTextAnalysis'; // Add this line

// Import Tab Panel Components (Add others as they are created)
import WordFrequencyTab from './WordFrequencyTab';
import SentimentAnalysisTab from './SentimentAnalysisTab';
import TextRelationshipsTab from './TextRelationshipsTab'; // Import new component
import TtrAnalysisTab from './TtrAnalysisTab'; // Import new component
import ConcordanceTab from './ConcordanceTab'; // Import new component
import TopicModelingTab from './TopicModelingTab'; // Import new component

// Dynamically import components that might have issues with SSR or large size
// ForceGraph is now inside TextRelationshipsTab, so dynamic import here might not be needed unless other large components are added.
// const ForceGraph2D = dynamic(
//   () => import('react-force-graph').then((mod) => mod.ForceGraph2D),
//   { ssr: false, loading: () => <p>Loading graph...</p> } // Add loading state for dynamic import
// );

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

  // Use the text analysis hook
  // IMPORTANT: Ensure the 'data' prop passed to this component has a stable reference.
  // If 'data' is recreated on every render in the parent, it will cause this hook
  // and its effects to run repeatedly, leading to the 'Maximum update depth exceeded' error.
  const {
    wordFrequencyData,
    sentimentData,
    relationshipData,
    ttrData,
    concordanceData,
    topicModelData,
    isLoading,
    searchConcordance // Function from the hook
  } = useTextAnalysis(data);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Memoize the handler passed to ConcordanceTab.
  // This depends on searchConcordance from the hook, which should be stable due to useCallback within the hook.
  const handleConcordanceSearch = useCallback((term) => {
      if (searchConcordance) { // Check if the function exists before calling
          searchConcordance(term);
      }
  }, [searchConcordance]); // Dependency is the memoized function from the hook


  // Show loading indicator centrally if analyses are running
  if (isLoading && !concordanceData) { // Adjust loading condition if needed
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
        {/* Use the new TextRelationshipsTab component */}
        <TextRelationshipsTab relationshipData={relationshipData} isLoading={isLoading} />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* Use the new TtrAnalysisTab component */}
        <TtrAnalysisTab ttrData={ttrData} isLoading={isLoading} />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
         {/* Pass the memoized handleConcordanceSearch */}
         <ConcordanceTab
            concordanceData={concordanceData}
            onSearch={handleConcordanceSearch} // Pass the memoized handler
            isLoading={isLoading}
         />
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
         {/* Use the new TopicModelingTab component */}
         <TopicModelingTab topicModelData={topicModelData} isLoading={isLoading} />
      </TabPanel>

    </Box>
  );
};

export default TextAnalysisVisualizations;
