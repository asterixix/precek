// This file will handle multimedia processing and AI integrations using web-compatible APIs
import { addData } from './database'; // Correct named import
// Import ffmpeg libraries
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { v4 as uuidv4 } from 'uuid'; // For unique filenames

// --- Text Processing ---
// Stores raw text directly into the database without AI processing.
export const processText = async (text, sourceName = 'text input', apiKeys) => {
  console.log(`Storing text from: ${sourceName}`);
  // No API key needed as we are not processing with AI anymore.

  try {
    // Directly use the input text as the "result" to be stored.
    const processingResult = text;

    // Add raw data to Dexie
    await addData({
      type: 'text',
      source: sourceName,
      content: text, // Store original text in content
      processingResult: processingResult, // Store original text here as well for consistency, or adjust DB schema later
      timestamp: new Date().toISOString(),
    });

    console.log(`Text stored successfully: ${sourceName}`);
    // Return success and the original text
    return { success: true, processingResult: processingResult };

  } catch (error) {
    console.error(`Error storing text from ${sourceName}:`, error);
    // Return error and a relevant message
    return { error: true, processingResult: `Error: ${error.message || 'Unable to store text.'}` };
  }
};

// --- Image Processing ---
// Uses OpenRouter with google/gemini-2.0-flash-thinking-exp:free
export const processImage = async (file, sourceName = 'image file', apiKeys) => {
  console.log(`Processing image: ${sourceName} using OpenRouter Gemini Flash`);
  const apiKey = apiKeys?.openrouter; // Use OpenRouter key directly

  if (!apiKey) {
    console.error(`Error processing image: OpenRouter API key is required.`);
    return { error: true, processingResult: 'OpenRouter API key for image processing is required.' };
  }

  try {
    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result?.toString().split(',')[1]);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });

    if (!base64Image) {
      throw new Error("Failed to read image file as base64.");
    }

    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // OpenRouter specific headers (Optional but recommended)
      // 'HTTP-Referer': $YOUR_SITE_URL,
      // 'X-Title': $YOUR_SITE_NAME,
    };
    // Assuming OpenRouter standardizes the vision request format similar to OpenAI
    const body = JSON.stringify({
      model: "google/gemini-2.0-flash-thinking-exp:free", // Specific model
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image and identify any key objects or themes." },
            {
              type: "image_url",
              image_url: {
                "url": `data:${file.type};base64,${base64Image}` // Use file.type for mime type
              }
            }
          ]
        }
      ],
      max_tokens: 300 // Adjust as needed for Gemini
    });

    const response = await fetch(apiUrl, { method: 'POST', headers: headers, body: body });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`OpenRouter API Error (${response.status}):`, errorData);
      if (response.status === 401) throw new Error('OpenRouter API key is invalid or unauthorized (401)');
      throw new Error(`OpenRouter API request failed with status ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    // Adjust parsing based on actual Gemini response structure via OpenRouter if needed
    const processingResult = data.choices[0]?.message?.content || 'No result from API';

    await addData({
      type: 'image',
      source: sourceName,
      content: `Image file: ${file.name}`,
      processingResult: processingResult,
      timestamp: new Date().toISOString(),
    });

    console.log(`Image processed successfully: ${sourceName}`);
    return { success: true, processingResult };

  } catch (error) {
    console.error(`Error processing image ${sourceName}:`, error);
    return { error: true, processingResult: `Error: ${error.message || 'Unable to process image.'}` };
  }
};

// --- Audio Processing ---
// Uses OpenAI with gpt-4o-transcribe
export const processAudio = async (file, sourceName = 'audio file', apiKeys) => {
  console.log(`Processing audio: ${sourceName} using OpenAI gpt-4o-transcribe`);
  const apiKey = apiKeys?.openai; // Use OpenAI key directly

  if (!apiKey) {
    console.error(`Error processing audio: OpenAI API key is required.`);
    return { error: true, processingResult: 'OpenAI API key for audio processing is required.' };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'gpt-4o-transcribe'); // Specific OpenAI model

    const apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
    };

    const response = await fetch(apiUrl, { method: 'POST', headers: headers, body: formData });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`OpenAI API Error (${response.status}):`, errorData);
      if (response.status === 401) throw new Error('OpenAI API key is invalid or unauthorized (401)');
      throw new Error(`OpenAI API request failed with status ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const processingResult = data.text || 'No transcription result from API';

    await addData({
      type: 'audio',
      source: sourceName,
      content: `Audio file: ${file.name}`,
      processingResult: processingResult,
      timestamp: new Date().toISOString(),
    });

    console.log(`Audio processed successfully: ${sourceName}`);
    return { success: true, processingResult };

  } catch (error) {
    console.error(`Error processing audio ${sourceName}:`, error);
    return { error: true, processingResult: `Error: ${error.message || 'Unable to process audio.'}` };
  }
};

// --- Video Processing ---
// Uses OpenAI gpt-4o-transcribe for audio and OpenRouter Gemini Flash for frames.
// Implements frame extraction using ffmpeg.wasm.
export const processVideo = async (file, sourceName = 'video file', apiKeys) => {
  console.log(`Processing video: ${sourceName}`);
  const audioApiKey = apiKeys?.openai; // OpenAI key for audio
  const visionApiKey = apiKeys?.openrouter; // OpenRouter key for vision

  let audioTranscription = 'Audio transcription requires an OpenAI API key.';
  let frameAnalysisResult = 'Frame analysis requires an OpenRouter API key and ffmpeg integration.';
  let combinedResult = '';
  let audioSuccess = false;
  let visionSuccess = false; // Flag for vision implementation success

  // --- 1. Audio Transcription using OpenAI gpt-4o-transcribe ---
  if (audioApiKey) {
    try {
      console.log(`Starting audio transcription for video: ${sourceName} using OpenAI gpt-4o-transcribe`);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'gpt-4o-transcribe');

      const apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
      const headers = {
        'Authorization': `Bearer ${audioApiKey}`,
      };

      const response = await fetch(apiUrl, { method: 'POST', headers: headers, body: formData });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`OpenAI Whisper API Error (${response.status}):`, errorData);
        if (response.status === 401) throw new Error('OpenAI API key is invalid or unauthorized (401)');
        throw new Error(`OpenAI Whisper API request failed with status ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      audioTranscription = data.text || 'No transcription result from OpenAI API.';
      audioSuccess = true; // Mark audio transcription as successful
      console.log(`Audio transcription successful for video: ${sourceName}`);

    } catch (audioError) {
      console.error(`Error during video audio transcription for ${sourceName}:`, audioError);
      audioTranscription = `Audio transcription error: ${audioError.message}`;
    }
  } else {
      console.warn(`Skipping audio transcription for ${sourceName}: OpenAI API key not provided.`);
  }


  // --- 2. Frame Analysis / OCR using OpenRouter Gemini Flash ---
  if (visionApiKey) {
    const ffmpeg = new FFmpeg();
    // Unique identifier for this processing job's files
    const jobPrefix = uuidv4().substring(0, 8);
    const inputFilename = `${jobPrefix}_input.mp4`; // Use unique names
    const outputPattern = `${jobPrefix}_frame-%03d.jpg`;

    try {
        console.log("Loading ffmpeg-core. This might take a while...");
        // IMPORTANT: Provide correct paths to the ffmpeg core files.
        // These URLs assume you are serving the files from your public directory.
        // Adjust paths as necessary for your setup (e.g., using unpkg CDN).
        // const coreURL = await toBlobURL('/@ffmpeg/core/ffmpeg-core.js', 'text/javascript');
        // const wasmURL = await toBlobURL('/@ffmpeg/core/ffmpeg-core.wasm', 'application/wasm');
        // const workerURL = await toBlobURL('/@ffmpeg/core/ffmpeg-core.worker.js', 'text/javascript'); // If using worker

        // Example using unpkg CDN (easier for setup, but relies on external service)
         const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd"
         const coreURL = `${baseURL}/ffmpeg-core.js`
         const wasmURL = `${baseURL}/ffmpeg-core.wasm`
         // If using SharedArrayBuffer (requires specific server headers - COOP/COEP):
         // const workerURL = `${baseURL}/ffmpeg-core.worker.js`
         // await ffmpeg.load({ coreURL, wasmURL, workerURL });
         // If NOT using SharedArrayBuffer:
         await ffmpeg.load({ coreURL, wasmURL });


        console.log("FFmpeg loaded. Writing video file to virtual FS...");
        await ffmpeg.writeFile(inputFilename, await fetchFile(file));

        console.log("Extracting keyframes (1 frame per 5 seconds)...");
        // Extract 1 frame every 5 seconds. Adjust 'fps=1/5' as needed.
        // Using unique output pattern
        await ffmpeg.exec(['-i', inputFilename, '-vf', 'fps=1/5', outputPattern]);
        console.log("Keyframes extracted.");

        console.log("Reading extracted frames...");
        const frameFiles = await ffmpeg.listDir('.');
        const imageFrames = [];
        for (const frameFile of frameFiles) {
            // Match only the frames for this job
            if (frameFile.name.startsWith(`${jobPrefix}_frame-`) && frameFile.name.endsWith('.jpg')) {
                const data = await ffmpeg.readFile(frameFile.name);
                const blob = new Blob([data], { type: 'image/jpeg' });
                const base64Image = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result?.toString().split(',')[1]);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(blob);
                });
                if (base64Image) {
                    imageFrames.push({ name: frameFile.name, base64: base64Image });
                }
                // Clean up frame file immediately after reading
                await ffmpeg.deleteFile(frameFile.name);
            }
        }
        // Clean up input file
        await ffmpeg.deleteFile(inputFilename);
        console.log(`Read ${imageFrames.length} frames.`);

        if (imageFrames.length > 0) {
            console.log("Analyzing frames with OpenRouter Gemini Flash...");
            let aggregatedFrameTexts = '';
            const visionApiUrl = 'https://openrouter.ai/api/v1/chat/completions';
            const visionHeaders = {
                'Authorization': `Bearer ${visionApiKey}`,
                'Content-Type': 'application/json',
                // 'HTTP-Referer': $YOUR_SITE_URL, // Optional
                // 'X-Title': $YOUR_SITE_NAME, // Optional
            };

            // Limit the number of frames to process (e.g., first 5)
            const framesToProcess = imageFrames.slice(0, 5);
            console.log(`Sending ${framesToProcess.length} frames for analysis...`);

            for (const frame of framesToProcess) {
                try {
                    const visionBody = JSON.stringify({
                        model: "google/gemini-2.0-flash-thinking-exp:free",
                        messages: [ { role: "user", content: [ { type: "text", text: "Extract any text visible in this image. If no text is present, respond with 'No text found'." }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${frame.base64}` } } ] } ],
                        max_tokens: 200
                    });
                    const visionResponse = await fetch(visionApiUrl, { method: 'POST', headers: visionHeaders, body: visionBody });
                    if (visionResponse.ok) {
                        const visionData = await visionResponse.json();
                        const frameText = visionData.choices[0]?.message?.content || 'Error analyzing frame';
                        if (frameText && frameText.toLowerCase().trim() !== 'no text found') {
                          aggregatedFrameTexts += `[${frame.name.replace(jobPrefix + '_', '')}]: ${frameText}\n`; // Cleaner name
                        }
                    } else {
                        const errorData = await visionResponse.json().catch(() => ({}));
                        console.error(`Error analyzing frame ${frame.name}: Status ${visionResponse.status}`, errorData);
                        aggregatedFrameTexts += `[${frame.name.replace(jobPrefix + '_', '')}]: Error ${visionResponse.status}\n`;
                    }
                } catch (visionError) {
                    console.error(`Error during vision API call for frame ${frame.name}:`, visionError);
                    aggregatedFrameTexts += `[${frame.name.replace(jobPrefix + '_', '')}]: API Call Failed\n`;
                }
            }
            frameAnalysisResult = aggregatedFrameTexts.trim() || 'No text found in analyzed frames.';
            visionSuccess = true; // Mark vision analysis as attempted/completed
            console.log("Frame analysis finished.");
        } else {
            frameAnalysisResult = 'No frames were extracted from the video.';
        }

    } catch (ffmpegError) {
        console.error("Error during ffmpeg processing:", ffmpegError);
        frameAnalysisResult = `Frame analysis failed: ${ffmpegError.message}`;
        // Attempt cleanup even on error
        try {
            const files = await ffmpeg.listDir('.');
            for (const f of files) {
                if (f.name.startsWith(jobPrefix)) {
                    await ffmpeg.deleteFile(f.name);
                }
            }
        } catch (cleanupError) {
            console.error("Error during ffmpeg cleanup:", cleanupError);
        }
    } finally {
        // Ensure ffmpeg instance is terminated if it was loaded
        if (ffmpeg.loaded) {
            try {
                await ffmpeg.terminate();
                console.log("FFmpeg terminated.");
            } catch (terminateError) {
                console.error("Error terminating ffmpeg:", terminateError);
            }
        }
    }

  } else {
      console.warn(`Skipping frame analysis for ${sourceName}: OpenRouter API key not provided.`);
      frameAnalysisResult = 'Frame analysis/OCR requires an OpenRouter API key.';
  }

  // --- 3. Combine Results ---
  combinedResult = `--- Audio Transcription ---\n${audioTranscription}\n\n--- On-Screen Text (OCR) ---\n${frameAnalysisResult}`;

  // --- 4. Add to Database ---
  try {
      await addData({
        type: 'video',
        source: sourceName,
        content: `Video file: ${file.name}`,
        processingResult: combinedResult,
        timestamp: new Date().toISOString(),
      });
      console.log(`Video processing finished for: ${sourceName}`);
      // Return success based on whether *either* audio or vision was attempted and didn't fail critically (or keys were missing)
      return { success: (audioSuccess || !audioApiKey) && (visionSuccess || !visionApiKey), processingResult: combinedResult };
  } catch (dbError) {
      console.error(`Failed to save video processing results to DB for ${sourceName}:`, dbError);
      return { error: true, processingResult: `Failed to save results to database. ${combinedResult}` };
  }
};
