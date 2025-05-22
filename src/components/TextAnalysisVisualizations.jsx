import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Material UI components
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

// Import the hook
import useTextAnalysis from '../hooks/useTextAnalysis';

// Import Tab Panel Components
import OverviewSummaryTab from './OverviewSummaryTab'; // Import new component
import WordFrequencyTab from './WordFrequencyTab';
import SentimentAnalysisTab from './SentimentAnalysisTab';
import TextRelationshipsTab from './TextRelationshipsTab';
import TtrAnalysisTab from './TtrAnalysisTab';
import ConcordanceTab from './ConcordanceTab';
import TopicModelingTab from './TopicModelingTab';
import PhrasesLinkTab from './PhrasesLinkTab'; // Import new component
import WordByWordTab from './WordByWordTab'; // Import the new component

// Reusable TabPanel component
function TabPanel(props) {
  // ... existing TabPanel code ...
  const { children, value, index, ...other } = props;
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const TextAnalysisVisualizations = ({ data, selectedTextId }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Destructure the new data from the hook
  const {
    overviewData, // Should now be populated by the hook
    wordFrequencyData,
    sentimentData,
    relationshipData,
    ttrData,
    concordanceData,
    topicModelData,
    phraseLinkData, // Should now be populated by the hook
    wordByWordData,
    isLoading,
    searchConcordance,
  } = useTextAnalysis(data);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Memoize the handler passed to ConcordanceTab
  const handleConcordanceSearch = useCallback(
    (term) => {
      if (searchConcordance) {
        searchConcordance(term);
      }
    },
    [searchConcordance]
  );

  // Adjust loading condition to check for overviewData
  if (isLoading && !overviewData) {
    // Check if overviewData is loaded
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Analyzing data...</Typography>
      </Box>
    );
  }

  // Show message if no data is provided
  if (!data || data.length === 0) {
    // ... existing no data message ...
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color='text.secondary'>
          No data available for analysis. Process some content first.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant='scrollable'
          scrollButtons='auto'
          aria-label='Text analysis tabs'
        >
          {/* Tabs including Overview and Phrase Links */}
          <Tab label='Overview' id='tab-0' aria-controls='tabpanel-0' />
          <Tab label='Word Frequency' id='tab-1' aria-controls='tabpanel-1' />
          <Tab label='Sentiment' id='tab-2' aria-controls='tabpanel-2' />
          <Tab label='Relationships' id='tab-3' aria-controls='tabpanel-3' />
          <Tab label='TTR' id='tab-4' aria-controls='tabpanel-4' />
          <Tab label='Concordance' id='tab-5' aria-controls='tabpanel-5' />
          <Tab label='Topics' id='tab-6' aria-controls='tabpanel-6' />
          <Tab label='Phrase Links' id='tab-7' aria-controls='tabpanel-7' />
          <Tab label='Word by Word Analysis' id='tab-8' aria-controls='tabpanel-8' />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {/* Pass overviewData */}
        <OverviewSummaryTab overviewData={overviewData} isLoading={isLoading} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <WordFrequencyTab
          wordFrequencyData={wordFrequencyData}
          isLoading={isLoading}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <SentimentAnalysisTab
          sentimentData={sentimentData}
          isLoading={isLoading}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <TextRelationshipsTab
          relationshipData={relationshipData}
          isLoading={isLoading}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <TtrAnalysisTab ttrData={ttrData} isLoading={isLoading} />
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
        <ConcordanceTab
          concordanceData={concordanceData}
          onSearch={handleConcordanceSearch}
          isLoading={isLoading}
          textId={selectedTextId} // Pass the ID of the first text item
        />
      </TabPanel>

      <TabPanel value={activeTab} index={6}>
        <TopicModelingTab
          topicModelData={topicModelData}
          isLoading={isLoading}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={7}>
        {/* Pass phraseLinkData */}
        <PhrasesLinkTab phraseLinkData={phraseLinkData} isLoading={isLoading} />
      </TabPanel>

      <TabPanel value={activeTab} index={8}>
        <WordByWordTab wordByWordData={wordByWordData} isLoading={isLoading} />
      </TabPanel>
    </Box>
  );
};

export default TextAnalysisVisualizations;
