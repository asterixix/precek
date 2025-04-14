import React from 'react';
import Typography from '@mui/material/Typography';

const SentimentChart = ({ data }) => {
  // Calculate chart dimensions
  const width = 300; // Smaller default width for embedding
  const height = 80; // Keep height as requested
  const padding = { top: 10, right: 10, bottom: 20, left: 30 }; // Adjusted padding
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Group data by date and calculate average sentiment
  const dataByDate = (data || []).reduce((acc, item) => {
    const date = item.date || new Date().toISOString().split('T')[0]; // Fallback date
    if (!acc[date]) acc[date] = [];
    acc[date].push(item.sentiment);
    return acc;
  }, {});

  const averageSentiment = Object.entries(dataByDate).map(([date, sentiments]) => ({
    date,
    sentiment: sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  // No data case
  if (averageSentiment.length === 0) {
    return <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>No data</Typography>;
  }

  // Find min/max for scaling
  const sentiments = averageSentiment.map(d => d.sentiment);
  const maxS = Math.max(...sentiments, 0); // Ensure range includes 0
  const minS = Math.min(...sentiments, 0); // Ensure range includes 0
  // Use symmetric range around 0 if both positive and negative values exist, otherwise scale from 0
  const absMax = Math.max(Math.abs(minS), Math.abs(maxS));
  const yDomainMax = absMax === 0 ? 1 : absMax; // Avoid division by zero, default to 1 if all are 0
  const yDomainMin = -yDomainMax;


  // Calculate scales
  const dates = averageSentiment.map(d => new Date(d.date));
  let minDate = new Date(Math.min(...dates));
  let maxDate = new Date(Math.max(...dates));

  // Add padding if only one date point
  if (dates.length === 1) {
    minDate = new Date(minDate.setDate(minDate.getDate() - 1));
    maxDate = new Date(maxDate.setDate(maxDate.getDate() + 1));
  }
  const dateRange = maxDate - minDate || 1; // Avoid division by zero

  // Generate points for the line
  const points = averageSentiment.map(d => {
    const x = padding.left + chartWidth * ((new Date(d.date) - minDate) / dateRange);
    // Scale y from yDomainMin to yDomainMax -> 0 to chartHeight
    const y = padding.top + chartHeight - chartHeight * ((d.sentiment - yDomainMin) / (yDomainMax - yDomainMin));
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  // Calculate Y position of the zero line
  const zeroLineY = padding.top + chartHeight - chartHeight * ((0 - yDomainMin) / (yDomainMax - yDomainMin));


  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* Zero line (neutral sentiment) */}
      <line
        x1={padding.left}
        y1={zeroLineY}
        x2={width - padding.right}
        y2={zeroLineY}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />

      {/* X axis (bottom) */}
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="0.5"
      />

      {/* Y axis (left) */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="0.5"
      />

       {/* Date labels (simplified: start and end) */}
       {averageSentiment.length > 0 && (
         <>
           <text
             x={padding.left}
             y={height - padding.bottom + 10} // Position below axis
             textAnchor="start"
             fontSize="8"
             fill="rgba(0,0,0,0.6)"
           >
             {new Date(minDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
           </text>
           <text
             x={width - padding.right}
             y={height - padding.bottom + 10} // Position below axis
             textAnchor="end"
             fontSize="8"
             fill="rgba(0,0,0,0.6)"
           >
             {new Date(maxDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
           </text>
         </>
       )}

      {/* Sentiment labels (Max, 0, Min) */}
      {[yDomainMax, 0, yDomainMin].map((sentiment, i) => {
         // Avoid drawing label if domain is effectively zero
         if (yDomainMax === 0 && sentiment !== 0) return null;
         // Calculate Y position for the label
         const y = padding.top + chartHeight - chartHeight * ((sentiment - yDomainMin) / (yDomainMax - yDomainMin || 1));
         // Prevent labels overlapping if min/max are too close to 0
         if (i !== 1 && Math.abs(y - zeroLineY) < 5) return null;

         return (
           <text
             key={i}
             x={padding.left - 4} // Position left of axis
             y={y + 3} // Adjust vertical alignment
             textAnchor="end"
             fontSize="8"
             fill="rgba(0,0,0,0.6)"
           >
             {sentiment.toFixed(1)}
           </text>
         );
       })}


      {/* Fill area (optional, can be complex for small charts) */}
      {/*
      <path
        d={`M${padding.left},${zeroLineY} L${points} L${width - padding.right},${zeroLineY}`}
        fill="rgba(25, 118, 210, 0.1)"
      />
      */}

      {/* Line chart */}
      {points && (
        <polyline
          points={points}
          fill="none"
          stroke="#1976d2" // Material UI primary blue
          strokeWidth="1.5"
        />
      )}

      {/* Data points (optional for small charts) */}
      {/*
      {averageSentiment.map((d, i) => {
         const x = padding.left + chartWidth * ((new Date(d.date) - minDate) / dateRange);
         const y = padding.top + chartHeight - chartHeight * ((d.sentiment - yDomainMin) / (yDomainMax - yDomainMin));
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2" // Smaller radius
            fill="#1976d2"
          />
        );
      })}
      */}
    </svg>
  );
};

export default SentimentChart;
