import Tesseract from 'tesseract.js';

// PDF validation patterns (declare once at top)
const PDF_HEADER_REGEX = /^%PDF-\d\.\d/;
const PDF_EOF_REGEX = /%%EOF[\x0D\x0A]?$/;

// PDF.js setup
let pdfjs = null;
if (typeof window !== 'undefined') {
  try {
    // Dynamically import pdfjs-dist to avoid issues during SSR or build
    import('pdfjs-dist/build/pdf.mjs').then(pdfjsModule => {
      pdfjs = pdfjsModule;
      // Use the .mjs worker file for v5+
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@5.1.91/build/pdf.worker.min.mjs`;
      console.log("PDF.js loaded and worker set.");
    }).catch(err => {
      console.error("Failed to load PDF.js:", err);
      pdfjs = null; // Ensure pdfjs is null if loading fails
    });
  } catch (err) {
      console.error("Error setting up PDF.js:", err);
      pdfjs = null;
  }
}

// Tesseract Worker Initialization (lazy)
let tesseractWorker = null;
let isTesseractInitializing = false;
const initializeTesseract = async () => {
  if (tesseractWorker || isTesseractInitializing) {
    // Wait if initialization is already in progress
    while(isTesseractInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return tesseractWorker;
  }

  isTesseractInitializing = true;
  console.log("Initializing Tesseract worker...");
  try {
    const worker = await Tesseract.createWorker('eng', 1, { // Use 'eng', OcrEngineMode OEM_LSTM_ONLY
      // logger: m => console.log(m), // Optional: for detailed logs
      // Optional: Specify paths if not using CDN defaults or if self-hosting
      // workerPath: '/path/to/tesseract/worker.min.js',
      // corePath: '/path/to/tesseract/tesseract-core.wasm.js',
      // langPath: '/path/to/tesseract/lang-data',
    });
    // No need to load/initialize separately with createWorker v5+
    tesseractWorker = worker;
    console.log("Tesseract worker initialized.");
    return worker;
  } catch (error) {
    console.error("Failed to initialize Tesseract worker:", error);
    tesseractWorker = null; // Reset on failure
    throw new Error("Could not initialize Tesseract OCR.");
  } finally {
    isTesseractInitializing = false;
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

// Read text from a PDF file using PDF.js for rendering and Tesseract.js for OCR
// PDF text extraction with hybrid approach
export const readPdfFile = async (file) => {
  if (typeof window === 'undefined') {
    throw new Error("PDF processing requires browser environment");
  }

  // Validate PDF first
  if (!(await isValidPdf(file))) {
    throw new Error("Invalid or corrupted PDF file");
  }

  let worker;
  try {
    // Read the array buffer once
    const arrayBuffer = await file.arrayBuffer();

    // Pass copies of the buffer to functions that might consume it
    const pdfType = await detectPdfType(arrayBuffer.slice(0));

    // Hybrid extraction workflow
    let text = '';
    if (pdfType === 'text') {
      text = await extractNativeText(arrayBuffer.slice(0));
    } else {
      worker = await initializeTesseract();
      text = await extractOcrText(arrayBuffer.slice(0), worker);
    }

    // Post-processing
    return cleanExtractedText(text);
  } catch (error) {
    console.error('PDF processing failed:', error);
    throw new Error(`PDF processing error: ${error.message}`);
  } finally {
    if (worker) {
      try { await worker.terminate() } catch(e) {}
    }
  }
};

// Helper: Validate PDF structure using PDF.js
const isValidPdf = async (file) => {
  if (!pdfjs) {
    console.warn("PDF.js not loaded, skipping detailed PDF validation.");
    // Fallback to a basic check if PDF.js isn't available
    try {
      const arr = new Uint8Array(await file.arrayBuffer());
      const header = String.fromCharCode(...arr.subarray(0,4));
      return PDF_HEADER_REGEX.test(header); // Just check header as a basic fallback
    } catch {
      return false;
    }
  }
  try {
    // Attempt to load the PDF using PDF.js
    const loadingTask = pdfjs.getDocument(await file.arrayBuffer());
    const pdf = await loadingTask.promise;
    // If loading succeeds, it's likely a valid PDF
    await pdf.destroy(); // Clean up resources
    return true;
  } catch (error) {
    console.error("PDF.js validation failed:", error);
    return false; // If loading fails, it's likely invalid
  }
};

// Helper: Detect PDF type (text/image)
const detectPdfType = async (arrayBuffer) => {
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  page.cleanup();

  return textContent.items.length > 5 ? 'text' : 'image';
};

// Native text extraction for text-based PDFs
const extractNativeText = async (arrayBuffer) => {
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    text += textContent.items
      .map(item => item.str)
      .join(' ') + '\n\n';
    page.cleanup();
  }

  return text;
};

// OCR extraction for image-based PDFs
const extractOcrText = async (arrayBuffer, worker) => {
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    const { data: { text: pageText } } = await worker.recognize(canvas);
    text += pageText + '\n\n';
    page.cleanup();
  }

  canvas.remove();
  return text;
};

// Text normalization pipeline
const cleanExtractedText = (text) => {
  return text
    // Fix hyphenated words
    .replace(/(\w+-\n\w+)/g, (m) => m.replace(/-\n/g, ''))
    // Remove control characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Fix quotation marks
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    // Remove orphan characters
    .replace(/(\s\w\s)/g, ' ')
    // Trim and condense
    .trim()
    .replace(/\n{3,}/g, '\n\n');
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
