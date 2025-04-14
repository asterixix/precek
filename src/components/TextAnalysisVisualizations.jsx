import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
// Import NLP libraries
import Sentiment from 'sentiment';

// Material UI components
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';

// Import ForceGraph components dynamically to avoid SSR issues
const ForceGraph2D = dynamic(
  () => import('react-force-graph').then((mod) => mod.ForceGraph2D),
  { ssr: false }
);

const TextAnalysisVisualizations = ({ data }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [wordFrequencyData, setWordFrequencyData] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [relationshipData, setRelationshipData] = useState({ nodes: [], links: [] });
  const [concordanceData, setConcordanceData] = useState([]);
  const [ttrData, setTtrData] = useState({ ttr: 0, uniqueWords: 0, totalWords: 0 });
  const [topicModelData, setTopicModelData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Process text data when component mounts or data changes
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Process all text analysis data
    const allText = data
      .map(item => item.processingResult || item.content || '')
      .join(' ');
    
    // Process word frequency
    processWordFrequency(data);
    
    // Process sentiment analysis
    processSentimentAnalysis(data);
    
    // Process relationships
    processRelationships(data);
    
    // Process concordance (initially empty until search)
    processConcordance(allText, '');
    
    // Process Type-Token Ratio
    processTTR(allText);
    
    // Process topic modeling
    processTopicModeling(allText);
  }, [data]);
  
  // Process word frequency data
  const processWordFrequency = (data) => {
    // Extract all text content
    const allText = data
      .map(item => item.processingResult || item.content || '')
      .join(' ')
      .toLowerCase();
    
    // Split into words, filter stop words and short words
    const stopWords = ['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are'];
    const words = allText
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter out short words
      .filter(word => !stopWords.includes(word)) // Filter out stop words
      .filter(word => /^[a-z]+$/i.test(word)); // Only keep words with letters
    
    // Count frequency
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    // Convert to array and sort by frequency
    const sortedWords = Object.entries(frequency)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50); // Take top 50 words
    
    setWordFrequencyData(sortedWords);
  };
    // Process sentiment analysis data using NLP library
  const processSentimentAnalysis = (data) => {
    // Initialize sentiment analyzer from the NLP library
    const sentiment = new Sentiment();
    
    // Process each text item with the sentiment analyzer
    const sentiments = data.map(item => {
      const text = item.processingResult || item.content || '';
      const date = new Date(item.timestamp);
      
      // Use NLP library for sentiment analysis
      const result = sentiment.analyze(text);
      
      // Extract detailed sentiment data
      const { score, comparative, words, positive, negative } = result;
      
      return {
        date: date.toISOString().split('T')[0],
        sentiment: score,
        comparative: comparative, // Normalized score based on text length
        positiveWords: positive,
        negativeWords: negative,
        title: text.substring(0, 30) + '...',
        emotionWords: words,
        textLength: text.length,
      };
    });
    
    // Calculate additional sentiment metrics for the entire dataset
    const totalSentiment = sentiments.reduce((acc, item) => acc + item.sentiment, 0);
    const avgSentiment = totalSentiment / sentiments.length || 0;
    
    // Get most common positive and negative words
    const allPositiveWords = sentiments.flatMap(item => item.positiveWords);
    const allNegativeWords = sentiments.flatMap(item => item.negativeWords);
    
    const positiveCounts = allPositiveWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    
    const negativeCounts = allNegativeWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    
    const topPositive = Object.entries(positiveCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
      
    const topNegative = Object.entries(negativeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    // Set the enriched sentiment data with additional metrics
    setSentimentData({
      items: sentiments,
      overall: {
        average: avgSentiment,
        total: totalSentiment,
        topPositive,
        topNegative,
        positiveCount: allPositiveWords.length,
        negativeCount: allNegativeWords.length
      }
    });
  };
  
  // Process relationships between texts
  const processRelationships = (data) => {
    const nodes = data.map((item, index) => ({
      id: index.toString(),
      name: item.originalName || `Text ${index + 1}`,
      val: 1 + (item.processingResult ? item.processingResult.length / 1000 : 1),
    }));
    
    // Create links based on content similarity (simplified)
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // Simple random relationship for demonstration
        // In a real app, this would be based on text similarity
        if (Math.random() > 0.7) {
          links.push({
            source: i.toString(),
            target: j.toString(),
            value: Math.random() * 2
          });
        }
      }
    };
      setRelationshipData({ nodes, links });
  };
  
  // Process concordance - find word occurrences with context
  const processConcordance = (text, term) => {
    if (!term || term.trim() === '') {
      setConcordanceData([]);
      return;
    }
    
    const searchTerm = term.toLowerCase();
    const words = text.split(/\s+/);
    const contextWindow = 5; // Words before and after the match
    const results = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase().replace(/[.,;:!?()[\]{}'"]/g, '');
      
      if (word === searchTerm) {
        // Get context before and after the word
        const startIdx = Math.max(0, i - contextWindow);
        const endIdx = Math.min(words.length - 1, i + contextWindow);
        
        // Create a context string
        const context = words.slice(startIdx, endIdx + 1).join(' ');
        const position = i; // Position in text
        
        results.push({
          position,
          context,
          // Highlight the matched word in context
          highlightedContext: words.slice(startIdx, endIdx + 1)
            .map((w, idx) => {
              // If this is the match word, add highlighting
              if (startIdx + idx === i) return `<mark>${w}</mark>`;
              return w;
            })
            .join(' ')
        });
      }
    }
    
    setConcordanceData(results);
  };
  
  // Process Type-Token Ratio (TTR) analysis
  const processTTR = (text) => {
    if (!text || text.trim() === '') {
      setTtrData({ ttr: 0, uniqueWords: 0, totalWords: 0 });
      return;
    }
    
    // Split text into words and clean up
    const words = text.toLowerCase()
                      .split(/\s+/)
                      .filter(word => word.length > 0)
                      .map(word => word.replace(/[.,;:!?()[\]{}'"]/g, ''));
    
    // Count total words (tokens)
    const totalWords = words.length;
    
    // Count unique words (types)
    const uniqueWords = new Set(words).size;
    
    // Calculate TTR (type-token ratio)
    const ttr = totalWords > 0 ? uniqueWords / totalWords : 0;
    
    setTtrData({
      ttr: ttr,
      uniqueWords: uniqueWords,
      totalWords: totalWords
    });
  };
  
  // Process topic modeling - identify words that frequently appear together
  const processTopicModeling = (text) => {
    // This is a simplified version of topic modeling
    // In a real implementation, consider using libraries like LDA or NMF algorithms
    
    // Get sentences from the text
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    // Find word co-occurrences within sentences
    const cooccurrences = {};
    const stopWords = new Set(['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', 'be', 'this', 'that', 'with', 'from', 'by', 'was', 'were', 'has', 'have', 'had']);
    
    sentences.forEach(sentence => {
      // Get cleaned words from the sentence
      const words = sentence.toLowerCase()
                           .split(/\s+/)
                           .filter(word => word.length > 2)
                           .filter(word => !stopWords.has(word))
                           .map(word => word.replace(/[.,;:!?()[\]{}'"]/g, ''));
      
      // Record co-occurrences within the same sentence
      for (let i = 0; i < words.length; i++) {
        const word1 = words[i];
        
        // Skip processing if it's a stop word or too short
        if (!word1 || word1.length <= 2 || stopWords.has(word1)) continue;
        
        if (!cooccurrences[word1]) {
          cooccurrences[word1] = {};
        }
        
        // Check co-occurrence with other words in the same sentence
        for (let j = i + 1; j < words.length; j++) {
          const word2 = words[j];
          
          // Skip if it's a stop word or too short
          if (!word2 || word2.length <= 2 || stopWords.has(word2)) continue;
          
          // Increment co-occurrence count
          cooccurrences[word1][word2] = (cooccurrences[word1][word2] || 0) + 1;
          
          // Also record the reverse relationship for undirected co-occurrence
          if (!cooccurrences[word2]) {
            cooccurrences[word2] = {};
          }
          cooccurrences[word2][word1] = (cooccurrences[word2][word1] || 0) + 1;
        }
      }
    });
    
    // Extract topics based on co-occurrences
    const topics = [];
    const processedWords = new Set();
    
    // Get words sorted by frequency
    const wordFrequency = {};
    Object.keys(cooccurrences).forEach(word => {
      let totalCooccurrences = 0;
      Object.values(cooccurrences[word]).forEach(count => {
        totalCooccurrences += count;
      });
      wordFrequency[word] = totalCooccurrences;
    });
    
    // Sort words by frequency
    const sortedWords = Object.keys(wordFrequency)
                              .sort((a, b) => wordFrequency[b] - wordFrequency[a]);
    
    // Create topics from most frequent words and their co-occurrences
    for (const word of sortedWords) {
      if (processedWords.has(word)) continue;
      
      // Sort co-occurrences for this word
      const relatedWords = Object.keys(cooccurrences[word])
                                .sort((a, b) => cooccurrences[word][b] - cooccurrences[word][a])
                                .slice(0, 5); // Take top 5 related words
      
      if (relatedWords.length > 0) {
        topics.push({
          mainWord: word,
          relatedWords,
          strength: wordFrequency[word]
        });
        
        // Mark words as processed
        processedWords.add(word);
        relatedWords.forEach(relatedWord => processedWords.add(relatedWord));
      }
      
      // Limit to 10 main topics
      if (topics.length >= 10) break;
    }
    
    setTopicModelData(topics);
  };
  
  // Calculate max word count for proper scaling
  const maxWordCount = Math.max(...wordFrequencyData.map(d => d.count), 1);
  
  // Custom TabPanel component for Material UI tabs
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
        {value === index && (
          <Box sx={{ pt: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Word Frequency" />
          <Tab label="Sentiment Analysis" />
          <Tab label="Text Relationships" />
          <Tab label="TTR Analysis" />
          <Tab label="Concordance" />
          <Tab label="Topic Modeling" />
        </Tabs>
      </Box>
      
      <TabPanel value={activeTab} index={0}>
        <Card elevation={2}>
          <CardHeader 
            title={<Typography variant="h6">Word Frequency Analysis</Typography>}
            subheader={<Typography variant="body2" color="text.secondary">Most common words across all analyzed text</Typography>}
          />
          <CardContent>
            {wordFrequencyData.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No word frequency data available</Typography>
            ) : (
              <Box sx={{ height: 400, overflowY: 'auto', pr: 1 }}>
                {wordFrequencyData.slice(0, 30).map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium">{item.word}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.count}</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 8, bgcolor: 'action.hover', borderRadius: 1, overflow: 'hidden' }}>
                      <Box 
                        sx={{ 
                          height: '100%', 
                          bgcolor: 'primary.main',
                          width: `${(item.count / maxWordCount) * 100}%` 
                        }} 
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>
        <TabPanel value={activeTab} index={1}>
        <Card elevation={2}>
          <CardHeader 
            title={<Typography variant="h6">Sentiment Analysis</Typography>}
            subheader={<Typography variant="body2" color="text.secondary">Sentiment analysis using NLP techniques</Typography>}
          />
          <CardContent>
            {!sentimentData || !sentimentData.items || sentimentData.items.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No sentiment data available</Typography>
            ) : (
              <Box>
                {/* Summary stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom>Overall Sentiment</Typography>
                      <Typography 
                        variant="h3" 
                        color={sentimentData.overall.average > 0 ? 'success.main' : 
                                sentimentData.overall.average < 0 ? 'error.main' : 'text.secondary'}
                      >
                        {sentimentData.overall.average.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sentimentData.overall.average > 5 ? 'Very Positive' :
                         sentimentData.overall.average > 0 ? 'Positive' :
                         sentimentData.overall.average === 0 ? 'Neutral' :
                         sentimentData.overall.average > -5 ? 'Negative' : 'Very Negative'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom>Positive vs. Negative</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Negative</Typography>
                            <Typography variant="caption">Positive</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', height: 20, borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ 
                              bgcolor: 'error.main', 
                              width: `${(sentimentData.overall.negativeCount / (sentimentData.overall.positiveCount + sentimentData.overall.negativeCount || 1)) * 100}%` 
                            }} />
                            <Box sx={{ 
                              bgcolor: 'success.main', 
                              width: `${(sentimentData.overall.positiveCount / (sentimentData.overall.positiveCount + sentimentData.overall.negativeCount || 1)) * 100}%` 
                            }} />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption">{sentimentData.overall.negativeCount}</Typography>
                            <Typography variant="caption">{sentimentData.overall.positiveCount}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom>Sentiment Over Time</Typography>
                      <Box sx={{ height: 80 }}>
                        <SentimentChart data={sentimentData.items} />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Detailed analysis */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card elevation={1}>
                      <CardHeader 
                        title={<Typography variant="subtitle1">Top Positive Words</Typography>} 
                        sx={{ pb: 0 }} 
                      />
                      <CardContent>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {sentimentData.overall.topPositive.map(([word, count], idx) => (
                            <Chip
                              key={idx}
                              label={`${word} (${count})`}
                              color="success"
                              variant={idx < 3 ? "filled" : "outlined"}
                              size="small"
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card elevation={1}>
                      <CardHeader 
                        title={<Typography variant="subtitle1">Top Negative Words</Typography>} 
                        sx={{ pb: 0 }} 
                      />
                      <CardContent>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {sentimentData.overall.topNegative.map(([word, count], idx) => (
                            <Chip
                              key={idx}
                              label={`${word} (${count})`}
                              color="error"
                              variant={idx < 3 ? "filled" : "outlined"}
                              size="small"
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card elevation={1}>
                      <CardHeader 
                        title={<Typography variant="subtitle1">Sentiment Breakdown by Text</Typography>}
                        sx={{ pb: 0 }}
                      />
                      <CardContent>
                        <TableContainer component={Paper} sx={{ maxHeight: 250 }}>
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>Text</TableCell>
                                <TableCell align="center">Score</TableCell>
                                <TableCell align="center">Normalized</TableCell>
                                <TableCell>Emotion Words</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sentimentData.items.map((item, idx) => (
                                <TableRow key={idx} hover>
                                  <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</TableCell>
                                  <TableCell 
                                    align="center"
                                    sx={{ 
                                      color: item.sentiment > 0 ? 'success.main' : 
                                             item.sentiment < 0 ? 'error.main' : 'text.secondary' 
                                    }}
                                  >
                                    {item.sentiment}
                                  </TableCell>
                                  <TableCell 
                                    align="center"
                                    sx={{ 
                                      color: item.comparative > 0 ? 'success.main' : 
                                             item.comparative < 0 ? 'error.main' : 'text.secondary' 
                                    }}
                                  >
                                    {item.comparative.toFixed(3)}
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                      {item.positiveWords.slice(0, 2).map((word, i) => (
                                        <Chip key={i} label={word} size="small" color="success" variant="outlined" />
                                      ))}
                                      {item.negativeWords.slice(0, 2).map((word, i) => (
                                        <Chip key={i} label={word} size="small" color="error" variant="outlined" />
                                      ))}
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
        <Card elevation={2}>
          <CardHeader 
            title={<Typography variant="h6">Text Relationships</Typography>}
            subheader={<Typography variant="body2" color="text.secondary">Visualize connections between text content</Typography>}
          />
          <CardContent>
            {relationshipData.nodes.length < 2 ? (
              <Typography variant="body2" color="text.secondary">Not enough text data to visualize relationships</Typography>
            ) : (
              <Box sx={{ height: 400 }}>
                <ForceGraph2D
                  graphData={relationshipData}
                  nodeLabel="name"
                  nodeAutoColorBy="name"
                  linkDirectionalParticles={1}
                  linkDirectionalParticleWidth={2}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={activeTab} index={3}>
        <Card elevation={2}>
          <CardHeader 
            title={<Typography variant="h6">Type-Token Ratio (TTR) Analysis</Typography>}
            subheader={<Typography variant="body2" color="text.secondary">Measures vocabulary diversity in the analyzed text</Typography>}
          />
          <CardContent>
            {ttrData.totalWords === 0 ? (
              <Typography variant="body2" color="text.secondary">No TTR data available</Typography>
            ) : (
              <Box>
                {/* TTR Summary */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom>TTR Score</Typography>
                      <Typography variant="h3" color="primary.main">
                        {ttrData.ttr.toFixed(3)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ttrData.ttr > 0.7 ? 'High lexical diversity' :
                         ttrData.ttr > 0.5 ? 'Average lexical diversity' : 'Low lexical diversity'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom>Unique Words</Typography>
                      <Typography variant="h3" color="info.main">
                        {ttrData.uniqueWords.toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom>Total Words</Typography>
                      <Typography variant="h3" color="text.secondary">
                        {ttrData.totalWords.toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                {/* TTR Visualization */}
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>TTR Visualization</Typography>
                  <Box sx={{ position: 'relative', height: 80, width: '100%' }}>
                    <Box sx={{ 
                      position: 'absolute', 
                      left: 0, 
                      bottom: 0, 
                      width: '100%', 
                      height: 20, 
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        width: `${ttrData.ttr * 100}%`, 
                        height: '100%', 
                        bgcolor: 'primary.main',
                        transition: 'width 1s ease-in-out'
                      }} />
                    </Box>
                    <Box sx={{ 
                      position: 'absolute',
                      width: '100%',
                      bottom: 30,
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <Typography variant="caption">0.0</Typography>
                      <Typography variant="caption">0.5</Typography>
                      <Typography variant="caption">1.0</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Type-Token Ratio (TTR) is the ratio of unique words to total words in a text. 
                      A higher ratio indicates greater lexical diversity. TTR approaches 1.0 when every word is used only once, 
                      and approaches 0.0 when many words are repeatedly used.
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={activeTab} index={4}>
        <Card elevation={2}>
          <CardHeader 
            title={<Typography variant="h6">Concordance Analysis</Typography>}
            subheader={<Typography variant="body2" color="text.secondary">Find words in their context throughout the text</Typography>}
          />
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <TextField 
                label="Search for word"
                fullWidth
                variant="outlined"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  const allText = data
                    .map(item => item.processingResult || item.content || '')
                    .join(' ');
                  processConcordance(allText, e.target.value);
                }}
                placeholder="Type a word to see its occurrences in context"
                helperText="Enter a word to find all occurrences in the text with surrounding context"
              />
            </Box>
            
            {concordanceData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {searchTerm ? 'No matches found. Try another word.' : 'Enter a word above to begin searching.'}
                </Typography>
              </Box>
            ) : (
              <Paper elevation={1}>
                <Typography variant="subtitle1" sx={{ p: 2 }}>
                  {concordanceData.length} occurrence{concordanceData.length !== 1 ? 's' : ''} of "{searchTerm}"
                </Typography>
                <TableContainer sx={{ maxHeight: 350 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell width="10%">Position</TableCell>
                        <TableCell>Context</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {concordanceData.map((item, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>{item.position}</TableCell>
                          <TableCell>
                            <div dangerouslySetInnerHTML={{ __html: item.highlightedContext }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={activeTab} index={5}>
        <Card elevation={2}>
          <CardHeader 
            title={<Typography variant="h6">Topic Modeling</Typography>}
            subheader={<Typography variant="body2" color="text.secondary">Identify main topics and related words in the text</Typography>}
          />
          <CardContent>
            {topicModelData.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No topic modeling data available</Typography>
            ) : (
              <Grid container spacing={2}>
                {topicModelData.map((topic, idx) => (
                  <Grid item xs={12} md={6} lg={4} key={idx}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        bgcolor: `rgba(25, 118, 210, ${0.1 + (0.4 * (1 - idx/topicModelData.length))})`
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Topic {idx + 1}: {topic.mainWord}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {topic.relatedWords.map((word, i) => (
                          <Chip 
                            key={i} 
                            label={word} 
                            size="small" 
                            variant={i < 2 ? "filled" : "outlined"}
                            sx={{ bgcolor: i < 2 ? 'primary.main' : 'transparent' }}
                          />
                        ))}
                      </Box>
                      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">Topic strength:</Typography>
                        <Box sx={{ flexGrow: 1, height: 4, borderRadius: 1, bgcolor: 'background.paper' }}>
                          <Box sx={{ 
                            height: '100%', 
                            borderRadius: 1,
                            width: `${(topic.strength / topicModelData[0].strength) * 100}%`,
                            bgcolor: 'primary.main'
                          }} />
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

const SentimentChart = ({ data }) => {
  // Calculate chart dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Find min and max values
  const sentiments = data.map(d => d.sentiment);
  const maxSentiment = Math.max(...sentiments, 1);
  const minSentiment = Math.min(...sentiments, -1);
  const absMax = Math.max(Math.abs(minSentiment), Math.abs(maxSentiment));
  
  // Group data by date
  const dataByDate = data.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});
  
  // Calculate average sentiment by date
  const averageSentiment = Object.entries(dataByDate).map(([date, items]) => {
    const sum = items.reduce((acc, item) => acc + item.sentiment, 0);
    return {
      date,
      sentiment: sum / items.length
    };
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // No data case
  if (averageSentiment.length === 0) {
    return <Typography variant="body2" color="text.secondary">No sentiment data available</Typography>;
  }
  
  // Calculate scales
  const dates = averageSentiment.map(d => new Date(d.date));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  // If only one data point, add a day before and after
  if (dates.length === 1) {
    minDate.setDate(minDate.getDate() - 1);
    maxDate.setDate(maxDate.getDate() + 1);
  }
  
  // Generate points for the line
  const points = averageSentiment.map((d, i) => {
    const x = padding.left + (chartWidth * (new Date(d.date) - minDate) / (maxDate - minDate));
    const y = padding.top + chartHeight / 2 - (chartHeight / 2 * d.sentiment / absMax);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* Center line (neutral sentiment) */}
      <line 
        x1={padding.left} 
        y1={padding.top + chartHeight / 2} 
        x2={width - padding.right} 
        y2={padding.top + chartHeight / 2} 
        stroke="rgba(0,0,0,0.2)" 
        strokeOpacity="0.2" 
      />
      
      {/* X axis */}
      <line 
        x1={padding.left} 
        y1={height - padding.bottom} 
        x2={width - padding.right} 
        y2={height - padding.bottom} 
        stroke="rgba(0,0,0,0.2)" 
        strokeOpacity="0.2" 
      />
      
      {/* Y axis */}
      <line 
        x1={padding.left} 
        y1={padding.top} 
        x2={padding.left} 
        y2={height - padding.bottom} 
        stroke="rgba(0,0,0,0.2)" 
        strokeOpacity="0.2" 
      />
      
      {/* Date labels */}
      {averageSentiment.map((d, i) => {
        // Only show some labels to avoid overcrowding
        if (averageSentiment.length > 7 && i % Math.ceil(averageSentiment.length / 7) !== 0 && i !== averageSentiment.length - 1) {
          return null;
        }
        
        const x = padding.left + (chartWidth * (new Date(d.date) - minDate) / (maxDate - minDate));
        return (
          <text 
            key={i} 
            x={x} 
            y={height - padding.bottom + 15} 
            textAnchor="middle" 
            fontSize="10" 
            fill="rgba(0,0,0,0.7)" 
          >
            {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
        );
      })}
      
      {/* Sentiment labels */}
      {[-absMax, 0, absMax].map((sentiment, i) => {
        const y = padding.top + chartHeight / 2 - (chartHeight / 2 * sentiment / absMax);
        return (
          <text 
            key={i} 
            x={padding.left - 5} 
            y={y + 3} 
            textAnchor="end" 
            fontSize="10" 
            fill="rgba(0,0,0,0.7)" 
          >
            {sentiment.toFixed(1)}
          </text>
        );
      })}
      
      {/* Chart title */}
      <text 
        x={padding.left} 
        y={padding.top - 5} 
        fontSize="12" 
        fontWeight="bold" 
        fill="rgba(0,0,0,0.87)" 
      >
        Sentiment Over Time
      </text>
      
      {/* Fill areas */}
      <path 
        d={`M ${padding.left} ${padding.top + chartHeight / 2} ${points} L ${width - padding.right} ${padding.top + chartHeight / 2}`}
        fill="rgba(25, 118, 210, 0.1)" 
      />
      
      {/* Line chart */}
      <polyline 
        points={points} 
        fill="none" 
        stroke="#1976d2" 
        strokeWidth="2" 
      />
      
      {/* Data points */}
      {averageSentiment.map((d, i) => {
        const x = padding.left + (chartWidth * (new Date(d.date) - minDate) / (maxDate - minDate));
        const y = padding.top + chartHeight / 2 - (chartHeight / 2 * d.sentiment / absMax);
        return (
          <circle 
            key={i} 
            cx={x} 
            cy={y} 
            r="4" 
            fill="#1976d2" 
          />
        );
      })}
    </svg>
  );
};

export default TextAnalysisVisualizations;
