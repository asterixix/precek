import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import LinearProgress from "@mui/material/LinearProgress";

const WordByWordTab = ({ wordByWordData, isLoading }) => {
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}
      >
        <LinearProgress sx={{ width: "100%" }} />
        <Typography sx={{ ml: 2 }}>Analyzing word-by-word...</Typography>
      </Box>
    );
  }

  if (!wordByWordData || wordByWordData.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">
          No word-by-word data available.
        </Typography>
      </Box>
    );
  }

  // Find max count for bar visualization
  const maxCount = Math.max(...wordByWordData.map((w) => w.count), 1);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Word-by-Word Analysis
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Each word's frequency and position(s) in the text.
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Word</TableCell>
              <TableCell align="right">Count</TableCell>
              <TableCell>Bar</TableCell>
              <TableCell>Positions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wordByWordData.map((row, idx) => (
              <TableRow key={row.word + idx}>
                <TableCell>{row.word}</TableCell>
                <TableCell align="right">{row.count}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: 120,
                      height: 8,
                      bgcolor: "grey.200",
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(row.count / maxCount) * 100}%`,
                        height: "100%",
                        bgcolor: "primary.main",
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {row.positions.join(", ")}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default WordByWordTab;
