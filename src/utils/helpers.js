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
 * Retrieves API keys from various sources (window, localStorage, process.env).
 * Prioritizes window object, then localStorage, then environment variables.
 * @returns {{openai: string, openrouter: string, googleFactCheck: string}}
 */
export const getApiKeys = () => {
  // Client-side logic
  if (typeof window !== 'undefined') {
    // Prioritize keys set directly on the window object (e.g., by ApiKeyForm)
    if (window.__PRECEK_API_KEYS) {
      return {
        openai: window.__PRECEK_API_KEYS.openai || '',
        openrouter: window.__PRECEK_API_KEYS.openrouter || '',
        googleFactCheck: window.__PRECEK_API_KEYS.googleFactCheck || '', // Get Google key
      };
    }
    // Fallback to individual window properties or localStorage
    return {
      openai: window.NEXT_PUBLIC_OPENAI_API_KEY || localStorage.getItem('openai_api_key') || '',
      openrouter: window.OPENROUTER_API_KEY || localStorage.getItem('openrouter_api_key') || '',
      googleFactCheck: window.GOOGLE_FACT_CHECK_API_KEY || localStorage.getItem('google_fact_check_api_key') || '', // Get Google key
    };
  }

  // Server-side or build-time logic (environment variables)
  return {
    openai: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    openrouter: process.env.OPENROUTER_API_KEY || '',
    googleFactCheck: process.env.GOOGLE_FACT_CHECK_API_KEY || '', // Get Google key from env
  };
};
