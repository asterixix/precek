import React from 'react';
import Typography from '@mui/material/Typography';

const SentimentChart = ({ data, mode = 'time', syuzhetData = [] }) => {
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

  // Calculate Y position of the zero line
  const zeroLineY = padding.top + chartHeight - chartHeight * ((0 - yDomainMin) / (yDomainMax - yDomainMin));

  // Choose visualization mode: time or narrative arc
  const useNarrativeMode = mode === 'narrative';
  
  // Calculate scales for x-axis
  let dataPoints = [];
  let minX, maxX, xRange;
  
  if (useNarrativeMode) {
    // For narrative mode, use equal spacing for points to show emotional arc
    dataPoints = sentiments.map((s, i) => ({
      x: i,
      sentiment: s,
      isKeyPoint: i === 0 || i === sentiments.length - 1 || 
                 (i > 0 && i < sentiments.length - 1 && 
                  ((s > 0 && sentiments[i-1] < 0) || 
                   (s < 0 && sentiments[i-1] > 0) ||
                   Math.abs(s) > yDomainMax * 0.7))
    }));
    minX = 0;
    maxX = dataPoints.length - 1 || 1;
    xRange = maxX - minX || 1;
  } else {
    // Time-based visualization
    const dates = averageSentiment.map(d => new Date(d.date));
    minX = new Date(Math.min(...dates));
    maxX = new Date(Math.max(...dates));
    
    // Add padding if only one date point
    if (dates.length === 1) {
      minX = new Date(minX.setDate(minX.getDate() - 1));
      maxX = new Date(maxX.setDate(maxX.getDate() + 1));
    }
    xRange = maxX - minX || 1; // Avoid division by zero
    
    // Find key points (significant changes, peaks, or zero-crossings)
    dataPoints = averageSentiment.map((d, i, arr) => {
      const sentiment = d.sentiment;
      const isKeyPoint = 
        i === 0 || i === arr.length - 1 || // First and last points
        (i > 0 && 
          ((sentiment > 0 && arr[i-1].sentiment < 0) || // Zero crossings
           (sentiment < 0 && arr[i-1].sentiment > 0) ||
           Math.abs(sentiment) > yDomainMax * 0.7)); // Peaks and valleys
           
      return {
        x: new Date(d.date),
        sentiment,
        isKeyPoint
      };
    });
  }
  
  // Generate points for the lines and areas
  let points = '';
  let positiveAreaPoints = '';
  let negativeAreaPoints = '';
  
  dataPoints.forEach((point, i) => {
    // Calculate x position
    let x;
    if (useNarrativeMode) {
      x = padding.left + chartWidth * (point.x / xRange);
    } else {
      x = padding.left + chartWidth * ((point.x - minX) / xRange);
    }
    
    // Calculate y position
    const y = padding.top + chartHeight - chartHeight * ((point.sentiment - yDomainMin) / (yDomainMax - yDomainMin || 1));
    
    // Add to the main line
    points += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `;
    
    // Add to appropriate area path
    if (point.sentiment >= 0) {
      positiveAreaPoints += `${positiveAreaPoints === '' ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `;
    } else {
      negativeAreaPoints += `${negativeAreaPoints === '' ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `;
    }
  });
  
  // Complete area paths by closing to zero line
  if (positiveAreaPoints) {
    const firstX = padding.left + chartWidth * ((useNarrativeMode ? dataPoints[0].x : dataPoints[0].x - minX) / xRange);
    const lastX = padding.left + chartWidth * ((useNarrativeMode ? dataPoints[dataPoints.length-1].x : dataPoints[dataPoints.length-1].x - minX) / xRange);
    positiveAreaPoints += `L${lastX.toFixed(2)},${zeroLineY.toFixed(2)} L${firstX.toFixed(2)},${zeroLineY.toFixed(2)} Z`;
  }
  
  if (negativeAreaPoints) {
    // Find first and last negative points to properly close the area
    const firstNegativeIndex = dataPoints.findIndex(p => p.sentiment < 0);
    const lastNegativeIndex = dataPoints.length - 1 - [...dataPoints].reverse().findIndex(p => p.sentiment < 0);
    
    if (firstNegativeIndex !== -1 && lastNegativeIndex !== -1) {
      const firstX = padding.left + chartWidth * ((useNarrativeMode ? dataPoints[firstNegativeIndex].x : dataPoints[firstNegativeIndex].x - minX) / xRange);
      const lastX = padding.left + chartWidth * ((useNarrativeMode ? dataPoints[lastNegativeIndex].x : dataPoints[lastNegativeIndex].x - minX) / xRange);
      negativeAreaPoints += `L${lastX.toFixed(2)},${zeroLineY.toFixed(2)} L${firstX.toFixed(2)},${zeroLineY.toFixed(2)} Z`;
    }
  }

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* Background grid lines */}
      <line
        x1={padding.left}
        y1={padding.top + chartHeight/4}
        x2={width - padding.right}
        y2={padding.top + chartHeight/4}
        stroke="rgba(0,0,0,0.05)"
        strokeWidth="0.5"
      />
      <line
        x1={padding.left}
        y1={padding.top + chartHeight*3/4}
        x2={width - padding.right}
        y2={padding.top + chartHeight*3/4}
        stroke="rgba(0,0,0,0.05)"
        strokeWidth="0.5"
      />
      
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

      {/* Area fills for positive and negative sentiment */}
      {positiveAreaPoints && (
        <path
          d={positiveAreaPoints}
          fill="rgba(76, 175, 80, 0.15)" // Light green with transparency
          stroke="none"
        />
      )}
      
      {negativeAreaPoints && (
        <path
          d={negativeAreaPoints}
          fill="rgba(244, 67, 54, 0.15)" // Light red with transparency
          stroke="none"
        />
      )}

      {/* Labels for x-axis */}
      {!useNarrativeMode && averageSentiment.length > 0 ? (
        <>
          <text
            x={padding.left}
            y={height - padding.bottom + 10}
            textAnchor="start"
            fontSize="8"
            fill="rgba(0,0,0,0.6)"
          >
            {new Date(minX).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
          <text
            x={width - padding.right}
            y={height - padding.bottom + 10}
            textAnchor="end"
            fontSize="8"
            fill="rgba(0,0,0,0.6)"
          >
            {new Date(maxX).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
        </>
      ) : useNarrativeMode && (
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
            x={width - padding.right}
            y={height - padding.bottom + 10}
            textAnchor="end"
            fontSize="8"
            fill="rgba(0,0,0,0.6)"
          >
            End
          </text>
        </>
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
            fill={sentiment > 0 ? "rgba(76, 175, 80, 0.8)" : 
                  sentiment < 0 ? "rgba(244, 67, 54, 0.8)" : 
                  "rgba(0,0,0,0.6)"}
          >
            {sentiment.toFixed(1)}
          </text>
        );
      })}

      {/* Main line chart */}
      <path
        d={points}
        fill="none"
        stroke="#1976d2"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Data points for key moments */}
      {dataPoints.map((point, i) => {
        if (!point.isKeyPoint && i % Math.max(1, Math.floor(dataPoints.length / 10)) !== 0) return null;
        
        let x;
        if (useNarrativeMode) {
          x = padding.left + chartWidth * (point.x / xRange);
        } else {
          x = padding.left + chartWidth * ((point.x - minX) / xRange);
        }
        
        const y = padding.top + chartHeight - chartHeight * ((point.sentiment - yDomainMin) / (yDomainMax - yDomainMin || 1));
        
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={point.isKeyPoint ? "2.5" : "1.5"}
            fill={point.sentiment > 0 ? "#4caf50" : 
                 point.sentiment < 0 ? "#f44336" : 
                 "#1976d2"}
            stroke="#fff"
            strokeWidth="0.5"
          />
        );
      })}
    </svg>
  );
};

export default SentimentChart;
