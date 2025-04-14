/**
 * Checks if a search term yields results on English Wikipedia using the MediaWiki API.
 * @param {string} searchTerm The term to search for (e.g., a filename).
 * @returns {Promise<boolean>} True if search results are found, false otherwise.
 */
export const checkExistenceOnWikipedia = async (searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return false;
  }

  // Use English Wikipedia API endpoint
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*`; // origin=* is needed for CORS

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Check if the search array exists and has results
    return data.query && data.query.search && data.query.search.length > 0;
  } catch (error) {
    console.error(`Error checking Wikipedia for "${searchTerm}":`, error);
    // Depending on requirements, you might want to re-throw or return a specific error state
    return false; // Indicate failure or absence due to error
  }
};
