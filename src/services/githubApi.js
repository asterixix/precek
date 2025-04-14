/**
 * Service to fetch GitHub repo information
 */

/**
 * Fetches the latest commit information from the GitHub API
 * 
 * @param {string} owner - The repo owner (username)
 * @param {string} repo - The repository name
 * @returns {Promise<Object>} - Promise resolving to commit data
 */
export async function getLatestCommit(owner = 'asterixix', repo = 'precek') {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const commits = await response.json();
    
    if (!commits || commits.length === 0) {
      return null;
    }
    
    // Return formatted commit info
    const commit = commits[0];
    return {
      sha: commit.sha.substring(0, 7), // Short SHA
      message: commit.commit.message.split('\n')[0], // First line only
      date: new Date(commit.commit.author.date).toLocaleDateString(),
      author: commit.commit.author.name,
      url: commit.html_url
    };
  } catch (error) {
    console.error('Error fetching GitHub commit:', error);
    return null;
  }
}
