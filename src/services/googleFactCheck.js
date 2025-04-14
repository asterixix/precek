import { getApiKeys } from '/src/utils/helpers';

/**
 * Calls the Google Fact Check API directly from the client.
 * @param {string} query - The search term for fact-checking.
 * @returns {Promise<object>} - The result from the Google Fact Check API.
 */
export const searchFactChecks = async (query) => {
  const { googleFactCheck: apiKey } = getApiKeys(); // Get key from helper

  if (!apiKey) {
    // Throw an error if the key is not provided by the user
    throw new Error('Google Fact Check API key is not configured. Please add it via the API Key form.');
  }

  const apiUrl = `https://factchecktools.googleapis.com/v1alpha1/claims:search?key=${apiKey}&query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('Google Fact Check API error:', data);
      // Provide more specific error message if available
      const errorMessage = data.error?.message || `Error fetching fact checks (Status: ${response.status})`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Error calling Google Fact Check API:', error);
    // Re-throw the error with potentially more context
    throw new Error(`Failed to fetch fact checks: ${error.message}`);
  }
};
