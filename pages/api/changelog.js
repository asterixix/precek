import fs from 'fs';
import path from 'path';

// Helper function to parse the CHANGELOG.md file
function parseChangelogMd(content) {
  const versions = [];
  let currentVersion = null;
  let currentType = null;
  
  // Split content by lines
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Match version lines: ## [1.2.0] - 2025-04-14
    const versionMatch = line.match(/^## \[([^\]]+)\] - (.+)$/);
    if (versionMatch) {
      if (currentVersion) {
        versions.push(currentVersion);
      }
      currentVersion = {
        version: versionMatch[1],
        date: versionMatch[2],
        changes: {}
      };
      currentType = null;
      continue;
    }
    
    // Match change types: ### Added, ### Changed, etc.
    const typeMatch = line.match(/^### (.+)$/);
    if (typeMatch && currentVersion) {
      currentType = typeMatch[1];
      currentVersion.changes[currentType] = [];
      continue;
    }
    
    // Match change items (bullet points)
    const itemMatch = line.match(/^- (.+)$/);
    if (itemMatch && currentVersion && currentType) {
      currentVersion.changes[currentType].push(itemMatch[1]);
    }
  }
  
  // Add the last version
  if (currentVersion) {
    versions.push(currentVersion);
  }
  
  return versions;
}

export default function handler(req, res) {
  try {
    // Read the CHANGELOG.md file
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const fileContent = fs.readFileSync(changelogPath, 'utf8');
    
    // Parse the content
    const changelog = parseChangelogMd(fileContent);
    
    // Return the parsed changelog
    res.status(200).json(changelog);
  } catch (error) {
    console.error('Error reading changelog:', error);
    res.status(500).json({ error: 'Failed to load changelog' });
  }
}
