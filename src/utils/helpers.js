import Tesseract from 'tesseract.js';

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
export const readPdfFile = async (file) => {
  if (typeof window === 'undefined') {
    throw new Error("PDF processing can only be done in the browser.");
  }
  if (!pdfjs) {
    // Attempt to wait a bit for dynamic import if called too early
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!pdfjs) {
       throw new Error('PDF processing library (PDF.js) is not loaded or failed to load.');
    }
  }

  let worker;
  try {
    worker = await initializeTesseract();
    if (!worker) {
      throw new Error("Tesseract worker is not available.");
    }
  } catch (error) {
    console.error("Tesseract initialization failed:", error);
    throw error; // Re-throw the error
  }

  try {
    console.log("Reading PDF file:", file.name);
    const arrayBuffer = await file.arrayBuffer();

    // Ensure worker source is set (redundant if set globally, but safe)
    // pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@5.1.91/build/pdf.worker.min.mjs`; // Already set globally

    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded: ${pdf.numPages} pages.`);

    let fullText = '';
    const canvas = document.createElement('canvas'); // Create canvas for rendering
    const context = canvas.getContext('2d');

    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i}...`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 }); // Increase scale for better OCR accuracy

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      console.log(`Page ${i} rendered to canvas.`);

      // Perform OCR on the rendered canvas
      console.log(`Performing OCR on page ${i}...`);
      const { data: { text } } = await worker.recognize(canvas);
      console.log(`OCR result for page ${i} obtained.`);
      fullText += text + '\n\n'; // Add space between pages

      // Clean up page resources if necessary (check PDF.js docs for best practices)
      page.cleanup();
    }

    // Terminate worker if no longer needed frequently, or keep it for reuse
    // await worker.terminate(); // Consider terminating if usage is infrequent
    // console.log("Tesseract worker terminated.");

    canvas.remove(); // Clean up the canvas element
    console.log("PDF OCR finished.");
    return fullText.trim();

  } catch (error) {
    console.error('Error processing PDF with OCR:', error);
    // Attempt to terminate worker on error if it exists
    if (worker && worker.terminate) {
      try {
        await worker.terminate();
        console.log("Tesseract worker terminated due to error.");
      } catch (termError) {
        console.error("Error terminating Tesseract worker:", termError);
      }
    }
    throw new Error(`Failed to extract text from PDF using OCR: ${error.message}`);
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
