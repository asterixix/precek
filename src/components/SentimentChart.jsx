import React from 'react';
import Typography from '@mui/material/Typography';

const SentimentChart = ({ data, mode = 'time', syuzhetData, width = 300, height = 80 }) => {
  // Calculate chart dimensions
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Decide which data to use based on mode
  let chartData = [];
  let xLabel = '';
  
  if (mode === 'narrative') {
    // For narrative mode, we expect either syuzhetData or data to have chunkedMeans
    const chunkedMeans = syuzhetData?.chunkedMeans || data?.chunkedMeans || [];
    
    // Map chunked means to chart data format
    chartData = chunkedMeans.map((value, index) => ({
      x: index,
      y: value
    }));
    xLabel = 'Narrative Progress';
  } else {
    // Time mode - ensure data is an array
    const itemsArray = Array.isArray(data) ? data : [];
    
    // Group by date and calculate average
    const dateGroups = {};
    itemsArray.forEach(item => {
      if (!item) return; // Skip null/undefined items
      
      const date = item.date || new Date().toISOString().split('T')[0];
      if (!dateGroups[date]) dateGroups[date] = [];
      
      // Only add the sentiment if it's a valid number
      if (typeof item.sentiment === 'number') {
        dateGroups[date].push(item.sentiment);
      }
    });
    
    // Convert to chart data format
    chartData = Object.entries(dateGroups)
      .map(([date, sentiments]) => {
        const avgSentiment = sentiments.length > 0 
          ? sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length 
          : 0;
        
        return {
          x: new Date(date),
          y: avgSentiment,
          label: date
        };
      })
      .sort((a, b) => a.x - b.x);
    
    xLabel = 'Time';
  }

  // No data case
  if (chartData.length === 0) {
    return <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>No data</Typography>;
  }

  // Find min/max for scaling
  const sentiments = chartData.map(d => d.y);
  const maxS = Math.max(...sentiments, 0); // Ensure range includes 0
  const minS = Math.min(...sentiments, 0); // Ensure range includes 0
  
  // Use symmetric range around 0 if both positive and negative values exist
  const absMax = Math.max(Math.abs(minS), Math.abs(maxS));
  const yDomainMax = absMax === 0 ? 1 : absMax; // Avoid division by zero
  const yDomainMin = -yDomainMax;

  // Calculate scales
  let xMin, xMax, xRange;
  
  if (mode === 'narrative') {
    xMin = 0;
    xMax = chartData.length - 1;
    xRange = xMax - xMin || 1; // Avoid division by zero
  } else {
    const dates = chartData.map(d => d.x);
    xMin = Math.min(...dates);
    xMax = Math.max(...dates);
    
    // Add padding if only one date point
    if (dates.length === 1) {
      xMin = new Date(new Date(xMin).setDate(new Date(xMin).getDate() - 1));
      xMax = new Date(new Date(xMax).setDate(new Date(xMax).getDate() + 1));
    }
    xRange = xMax - xMin || 1; // Avoid division by zero
  }

  // Generate points for the line
  const points = chartData.map(d => {
    let x;
    if (mode === 'narrative') {
      x = padding.left + chartWidth * (d.x / xRange);
    } else {
      x = padding.left + chartWidth * ((d.x - xMin) / xRange);
    }
    
    // Scale y from yDomainMin to yDomainMax -> 0 to chartHeight
    const y = padding.top + chartHeight - chartHeight * ((d.y - yDomainMin) / (yDomainMax - yDomainMin));
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  // Calculate Y position of the zero line
  const zeroLineY = padding.top + chartHeight - chartHeight * ((0 - yDomainMin) / (yDomainMax - yDomainMin));

  // Generate area fill path
  const areaPath = `M${padding.left},${zeroLineY} ` + 
                   chartData.map((d, i) => {
                     let x;
                     if (mode === 'narrative') {
                       x = padding.left + chartWidth * (d.x / xRange);
                     } else {
                       x = padding.left + chartWidth * ((d.x - xMin) / xRange);
                     }
                     const y = padding.top + chartHeight - chartHeight * ((d.y - yDomainMin) / (yDomainMax - yDomainMin));
                     return `L${x.toFixed(2)},${y.toFixed(2)}`;
                   }).join(' ') +
                   ` L${width - padding.right},${zeroLineY} Z`;

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

      {/* Area fill - with different colors for positive/negative */}
      <path
        d={areaPath}
        fill="rgba(25, 118, 210, 0.1)"
        opacity="0.6"
      />

      {/* X-axis labels */}
      {mode === 'narrative' ? (
        // For narrative mode, show start/middle/end
        <>
          <text
            x={padding.left}
            y={height - padding.bottom + 10}
            textAnchor="start"
            fontSize="8"
            fill="rgba(0,0,0,0.6)"
          >
            Start
          </text>
          <text
            x={padding.left + chartWidth/2}
            y={height - padding.bottom + 10}
            textAnchor="middle"
            fontSize="8"
            fill="rgba(0,0,0,0.6)"
          >
            Middle
          </text>
          <text
            x={width - padding.right}
            y={height - padding.bottom + 10}
            textAnchor="end"
            fontSize="8"
            fill="rgba(0,0,0,0.6)"
          >
            End
          </text>
        </>
      ) : (
        // For time mode, show dates
        chartData.length > 0 && (
          <>
            <text
              x={padding.left}
              y={height - padding.bottom + 10}
              textAnchor="start"
              fontSize="8"
              fill="rgba(0,0,0,0.6)"
            >
              {new Date(xMin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
            <text
              x={width - padding.right}
              y={height - padding.bottom + 10}
              textAnchor="end"
              fontSize="8"
              fill="rgba(0,0,0,0.6)"
            >
              {new Date(xMax).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          </>
        )
      )}

      {/* Sentiment labels (Max, 0, Min) */}
      {[yDomainMax, 0, yDomainMin].map((sentiment, i) => {
         if (yDomainMax === 0 && sentiment !== 0) return null;
         const y = padding.top + chartHeight - chartHeight * ((sentiment - yDomainMin) / (yDomainMax - yDomainMin || 1));
         if (i !== 1 && Math.abs(y - zeroLineY) < 5) return null;

         return (
           <text
             key={i}
             x={padding.left - 4}
             y={y + 3}
             textAnchor="end"
             fontSize="8"
             fill="rgba(0,0,0,0.6)"
           >
             {sentiment.toFixed(1)}
           </text>
         );
       })}

      {/* Line chart */}
      {points && (
        <polyline
          points={points}
          fill="none"
          stroke="#1976d2"
          strokeWidth="1.5"
        />
      )}

      {/* Data points */}
      {chartData.map((d, i) => {
        let x;
        if (mode === 'narrative') {
          x = padding.left + chartWidth * (d.x / xRange);
        } else {
          x = padding.left + chartWidth * ((d.x - xMin) / xRange);
        }
        const y = padding.top + chartHeight - chartHeight * ((d.y - yDomainMin) / (yDomainMax - yDomainMin));
        
        // Only show points for narrative mode or when we have few data points
        if (mode === 'narrative' || chartData.length < 10) {
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5" // Smaller radius
              fill="#1976d2"
            />
          );
        }
        return null;
      })}
    </svg>
  );
};

export default SentimentChart;
