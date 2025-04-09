import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

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
  
  // Process text data when component mounts or data changes
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Process word frequency
    processWordFrequency(data);
    
    // Process sentiment analysis
    processSentimentAnalysis(data);
    
    // Process relationships
    processRelationships(data);
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
  
  // Process sentiment analysis data
  const processSentimentAnalysis = (data) => {
    // For demonstration purposes, generate mock sentiment data
    // In a real app, this would use NLP libraries or APIs
    const sentiments = data.map(item => {
      const text = item.processingResult || item.content || '';
      const date = new Date(item.timestamp);
      
      // Simple mock sentiment analysis - count positive/negative words
      const positiveWords = ['good', 'great', 'excellent', 'best', 'happy', 'positive'];
      const negativeWords = ['bad', 'terrible', 'worst', 'sad', 'negative'];
      
      const lowercaseText = text.toLowerCase();
      let sentiment = 0;
      
      positiveWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowercaseText.match(regex);
        if (matches) sentiment += matches.length;
      });
      
      negativeWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowercaseText.match(regex);
        if (matches) sentiment -= matches.length;
      });
      
      return {
        date: date.toISOString().split('T')[0],
        sentiment,
        title: text.substring(0, 30) + '...',
      };
    });
    
    setSentimentData(sentiments);
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
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          centered
        >
          <Tab label="Word Frequency" />
          <Tab label="Sentiment Analysis" />
          <Tab label="Text Relationships" />
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
            subheader={<Typography variant="body2" color="text.secondary">Sentiment trends across text content</Typography>}
          />
          <CardContent>
            {sentimentData.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No sentiment data available</Typography>
            ) : (
              <Box sx={{ height: 400 }}>
                <SentimentChart data={sentimentData} />
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
