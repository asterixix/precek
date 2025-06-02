import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
} from "recharts";

const TrendsTab = ({ trendsData, isLoading }) => {
  console.log("TrendsTab trendsData:", trendsData);
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading trends data...</Typography>
      </Box>
    );
  }

  if (!trendsData || Object.keys(trendsData).length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">
          No trends data available.
        </Typography>
      </Box>
    );
  }

  // Process the data for visualization
  const wordEvolutionData = trendsData.overallTrending?.map((item) => ({
    word: item.word,
    avgChange: item.avgChange,
    documents: item.documents,
  })) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Term Frequency Trends Across Documents
      </Typography>
      <Typography sx={{ mb: 3 }}>
        This chart shows how word frequencies change from beginning to end across all documents.
      </Typography>

      {/* Overall word evolution chart */}
      {wordEvolutionData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={wordEvolutionData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="word" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgChange" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Typography color="text.secondary">
          No trending words found in the analyzed documents.
        </Typography>
      )}

      {/* Document-specific trends */}
      {trendsData.documents && trendsData.documents.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Individual Document Trends
          </Typography>
          {trendsData.documents.slice(0, 3).map((doc) => (
            <Box key={doc.documentId} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {doc.documentName}
              </Typography>
              {doc.trendingWords && doc.trendingWords.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={doc.trendingWords.slice(0, 8)}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="word" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="change" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TrendsTab;
