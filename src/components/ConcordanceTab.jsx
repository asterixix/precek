import React, { useState, useEffect, useRef, useCallback } from 'react'; // Import useEffect and useRef
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import debounce from 'lodash.debounce';

const ConcordanceTab = ({ concordanceData, onSearch, isLoading, textId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Store the latest onSearch function in a ref
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Create the debounced search function only once using useRef
  // It will always call the latest onSearch function from the ref
  const debouncedSearch = useRef(
    debounce((term) => {
      if (onSearchRef.current) {
        onSearchRef.current(term);
      }
    }, 500) // 500ms delay
  ).current; // .current holds the debounced function

  // Cleanup the debounce timer on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]); // Dependency array includes the debounced function itself

  const handleInputChange = (event) => {
    const newTerm = event.target.value;
    setSearchTerm(newTerm);
    debouncedSearch(newTerm.trim()); // Call the debounced function
  };

  // Handle explicit search button click
  const handleSearchClick = () => {
    // Cancel any pending debounced calls and search immediately
    debouncedSearch.cancel();
    if (onSearchRef.current) {
      onSearchRef.current(searchTerm.trim());
    }
  };

  return (
    <Card elevation={2}>
      <CardHeader
        title={<Typography variant='h6'>Concordance Analysis</Typography>}
        subheader={
          <Typography variant='body2' color='text.secondary'>
            Find occurrences of a word in context
          </Typography>
        }
      />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            label='Search Term'
            variant='outlined'
            value={searchTerm}
            onChange={handleInputChange}
            size='small'
            sx={{ mr: 1 }}
          />
          <Button
            variant='contained'
            onClick={handleSearchClick}
            startIcon={<SearchIcon />}
            // Use the passed isLoading prop correctly
            disabled={isLoading || !searchTerm.trim()}
          >
            Search
          </Button>
        </Box>

        {/* Conditional rendering based on isLoading and search term */}
        {isLoading && searchTerm.trim() ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Searching...</Typography>
          </Box>
        ) : concordanceData && concordanceData.length > 0 ? (
          <Paper variant='outlined' sx={{ maxHeight: 400, overflowY: 'auto' }}>
            <List dense>
              {concordanceData.map((item, index) => (
                <Link
                  key={item.position || index}
                  href={`/readtext?id=${textId}&highlight=${item.position}`}
                  passHref
                  legacyBehavior //Use legacyBehavior to ensure the Link component works correctly with ListItem
                >
                  <ListItem button component='a' divider>
                    <ListItemText
                      primary={
                        <span
                          dangerouslySetInnerHTML={{
                            __html: item.highlightedContext,
                          }}
                        />
                      }
                      secondary={`Position: ${item.position}`}
                    />
                  </ListItem>
                </Link>
              ))}
            </List>
          </Paper>
        ) : searchTerm.trim() ? (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ textAlign: 'center', mt: 2 }}
          >
            No occurrences found for "{searchTerm}".
          </Typography>
        ) : (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ textAlign: 'center', mt: 2 }}
          >
            Enter a term above to search for its context.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ConcordanceTab;
