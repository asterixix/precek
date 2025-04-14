// PDF.js setup - needs to be accessible globally or passed where needed
let pdfjs = null;
if (typeof window !== 'undefined') {
  pdfjs = require('pdfjs-dist');
  if (pdfjs) {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
}

// Text truncation
export function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Get MUI color based on item type
export function getTypeColorMui(type) {
  switch (type) {
    case 'text':
      return 'primary.main';
    case 'image':
      return 'success.main';
    case 'audio':
      return 'warning.main';
    case 'video':
      return 'secondary.main';
    default:
      return 'grey.500';
  }
}

// Read text from a .txt file
export const readTextFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Error reading text file'));
    reader.readAsText(file);
  });
};

// Read text from a PDF file
export const readPdfFile = async (file) => {
  if (!pdfjs) {
    throw new Error('PDF processing library (pdf.js) is not loaded.');
  }
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Ensure worker source is set (redundant if set globally, but safe)
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n'; // Add space between pages
    }
    return fullText;
  } catch (error) {
    console.error('Error reading PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Retrieves API keys from various sources.
 * Priority:
 *   - OpenAI: window.__PRECEK_API_KEYS > localStorage > process.env (build-time/public).
 *   - OpenRouter: process.env (build-time/public ONLY).
 * @returns {{openai: string, openrouter: string}}
 */
export const getApiKeys = () => {
  let openai = '';
  // Always prioritize the build-time key for OpenRouter
  const openrouter = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
  const buildTimeOpenAI = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

  // Client-side logic for OpenAI key
  if (typeof window !== 'undefined') {
    // 1. Prioritize OpenAI key set directly on the window object
    if (window.__PRECEK_API_KEYS && window.__PRECEK_API_KEYS.openai) {
      openai = window.__PRECEK_API_KEYS.openai;
    }

    // 2. Fallback to localStorage for OpenAI key
    if (!openai) {
      openai = localStorage.getItem('openai_api_key') || '';
    }

    // 3. Fallback to build-time environment variable for OpenAI key
    if (!openai) {
      openai = buildTimeOpenAI;
    }

    // Deprecated check (can likely be removed if migration to __PRECEK_API_KEYS is complete)
    // if (!openai) {
    //   openai = window.NEXT_PUBLIC_OPENAI_API_KEY || '';
    // }

  } else {
    // Server-side or build-time logic (environment variables only)
    openai = buildTimeOpenAI;
  }

  return {
    openai: openai,
    openrouter: openrouter, // Return the build-time key directly
  };
};
