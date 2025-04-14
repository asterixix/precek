// This file will handle multimedia processing and AI integrations using web-compatible APIs
import { addData } from './database';
import { getApiKeys } from '/src/utils/helpers'; // Keep getApiKeys for potential direct use or fallback if needed

// --- Helper function to get the primary API key ---
// Prioritizes OpenRouter if both are present, otherwise uses whichever is available.
// Accepts the keys object directly.
const getPrimaryApiKey = (apiKeys) => {
  if (!apiKeys) {
    console.error("API keys object not provided to getPrimaryApiKey");
    return { key: null, type: null, error: 'API keys object missing' };
  }
  if (apiKeys.openrouter) {
    return { key: apiKeys.openrouter, type: 'openrouter' };
  }
  if (apiKeys.openai) {
    return { key: apiKeys.openai, type: 'openai' };
  }
  console.error("No OpenAI or OpenRouter API key found in the provided keys object.");
  return { key: null, type: null, error: 'Core API key missing' };
};


// --- Text Processing ---
// (No changes needed here from the previous step)
export const processText = async (text, sourceName = 'text input', apiKeys) => {
  console.log(`Processing text from: ${sourceName}`);
  const { key: apiKey, type: keyType, error: keyError } = getPrimaryApiKey(apiKeys);

  if (keyError) {
    console.error(`Error processing text: ${keyError}`);
    return { error: true, processingResult: keyError }; // Return error object
  }
  if (!apiKey) {
     console.error('Error processing text: API key is required.');
     return { error: true, processingResult: 'API key is required for media processing' };
  }

  try {
    // Example: Using the key in an API call (replace with actual implementation)
    const apiUrl = keyType === 'openrouter' ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions'; // Adjust endpoint as needed
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
     if (keyType === 'openrouter') {
        // OpenRouter specific headers, if any (e.g., HTTP-Referer, X-Title)
        // headers['HTTP-Referer'] = $YOUR_SITE_URL; // Optional
        // headers['X-Title'] = $YOUR_SITE_NAME; // Optional
     }

    const body = JSON.stringify({
      model: keyType === 'openrouter' ? "openai/gpt-3.5-turbo" : "gpt-3.5-turbo", // Example model
      messages: [
        { role: "system", content: "Analyze the following text for key themes, sentiment, and potential misinformation. Provide a concise summary." },
        { role: "user", content: text }
      ],
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to parse error details
      console.error(`API Error (${response.status}):`, errorData);
       // Check for specific authentication errors
       if (response.status === 401) {
           throw new Error('API key is invalid or unauthorized (401)');
       }
      throw new Error(`API request failed with status ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const processingResult = data.choices[0]?.message?.content || 'No result from API';

    // Add processed data to Dexie
    await addData({
      type: 'text',
      source: sourceName,
      content: text, // Store original text
      processingResult: processingResult,
      timestamp: new Date().toISOString(),
    });

    console.log(`Text processed successfully: ${sourceName}`);
    return { success: true, processingResult }; // Indicate success

  } catch (error) {
    console.error(`Error processing text from ${sourceName}:`, error);
    // Propagate specific error messages
    return { error: true, processingResult: `Error: ${error.message || 'Unable to process text.'}` };
  }
};

// --- Image Processing ---
// Restored logic using apiKeys parameter
export const processImage = async (file, sourceName = 'image file', apiKeys) => {
  console.log(`Processing image: ${sourceName}`);
  // Use OpenAI key specifically if available, as vision models might be provider-specific
  // Or adapt based on OpenRouter's vision model support
  const apiKey = apiKeys?.openai || apiKeys?.openrouter; // Prioritize OpenAI for vision? Adjust as needed.
  const keyType = apiKeys?.openai ? 'openai' : (apiKeys?.openrouter ? 'openrouter' : null);

  if (!apiKey) {
    console.error(`Error processing image: Compatible API key (OpenAI or OpenRouter Vision) is required.`);
    return { error: true, processingResult: 'API key for image processing is required.' };
  }

  try {
    // 1. Convert image to base64 (requires a helper function or client-side logic)
    const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result?.toString().split(',')[1]); // Get base64 part
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });

    if (!base64Image) {
        throw new Error("Failed to read image file as base64.");
    }

    // 2. Prepare API Request (Example for OpenAI GPT-4 Vision)
    // Adjust URL and model if using OpenRouter or other models
    const apiUrl = 'https://api.openai.com/v1/chat/completions'; // Assuming OpenAI Vision endpoint
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    const body = JSON.stringify({
      model: "gpt-4-vision-preview", // Or the appropriate model via OpenRouter
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image and identify any key objects or themes." },
            {
              type: "image_url",
              image_url: {
                "url": `data:image/jpeg;base64,${base64Image}` // Adjust mime type if needed
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    // 3. Make API Call
    const response = await fetch(apiUrl, { method: 'POST', headers: headers, body: body });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error (${response.status}):`, errorData);
      if (response.status === 401) throw new Error('API key is invalid or unauthorized (401)');
      throw new Error(`API request failed with status ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const processingResult = data.choices[0]?.message?.content || 'No result from API';

    // 4. Add to Database
    await addData({
      type: 'image',
      source: sourceName,
      content: `Image file: ${file.name}`, // Store reference, not base64 in DB usually
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
// Restored logic using apiKeys parameter
export const processAudio = async (file, sourceName = 'audio file', apiKeys) => {
  console.log(`Processing audio: ${sourceName}`);
  // Whisper typically uses OpenAI key, check OpenRouter compatibility if needed
  const apiKey = apiKeys?.openai || apiKeys?.openrouter;
  const keyType = apiKeys?.openai ? 'openai' : (apiKeys?.openrouter ? 'openrouter' : null);


  if (!apiKey) {
    console.error(`Error processing audio: API key is required.`);
    return { error: true, processingResult: 'API key for audio processing is required.' };
  }

  try {
    // 1. Prepare API Request (Example for OpenAI Whisper)
    // Use FormData for file uploads
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1'); // Or appropriate model via OpenRouter

    // Adjust URL if using OpenRouter
    const apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      // Content-Type is set automatically by browser for FormData
    };

    // 2. Make API Call
    const response = await fetch(apiUrl, { method: 'POST', headers: headers, body: formData });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error (${response.status}):`, errorData);
       if (response.status === 401) throw new Error('API key is invalid or unauthorized (401)');
      throw new Error(`API request failed with status ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const processingResult = data.text || 'No transcription result from API'; // Whisper returns 'text'

    // 3. Add to Database
    await addData({
      type: 'audio',
      source: sourceName,
      content: `Audio file: ${file.name}`,
      processingResult: processingResult, // Store transcription
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
// Implements audio transcription directly from video using Whisper.
// Outlines steps for future frame analysis/OCR implementation.
export const processVideo = async (file, sourceName = 'video file', apiKeys) => {
  console.log(`Processing video: ${sourceName}`);
  // Use separate keys logic in case different providers/models are needed
  const audioApiKey = apiKeys?.openai || apiKeys?.openrouter; // Whisper key
  const visionApiKey = apiKeys?.openai || apiKeys?.openrouter; // Vision model key (e.g., GPT-4V)
  const audioKeyType = apiKeys?.openai ? 'openai' : (apiKeys?.openrouter ? 'openrouter' : null);
  // const visionKeyType = audioKeyType; // Assuming same provider for now

  // Need at least an audio key for transcription
  if (!audioApiKey) {
     console.error(`Error processing video: API key for audio transcription is required.`);
     return { error: true, processingResult: 'API key for audio transcription is required.' };
  }

  let audioTranscription = 'Audio transcription failed or key not available.';
  let frameAnalysisResult = 'Frame analysis/OCR not implemented.';
  let combinedResult = '';

  try {
    // --- 1. Audio Transcription using Whisper ---
    // OpenAI Whisper API can directly handle video files to extract and transcribe audio.
    try {
        console.log(`Starting audio transcription for video: ${sourceName}`);
        const formData = new FormData();
        formData.append('file', file); // Send the video file directly
        formData.append('model', 'whisper-1'); // Or appropriate model via OpenRouter

        // Adjust URL if using OpenRouter
        const audioApiUrl = 'https://api.openai.com/v1/audio/transcriptions';
        const audioHeaders = {
          'Authorization': `Bearer ${audioApiKey}`,
        };

        const audioResponse = await fetch(audioApiUrl, { method: 'POST', headers: audioHeaders, body: formData });

        if (!audioResponse.ok) {
          const errorData = await audioResponse.json().catch(() => ({}));
          console.error(`Whisper API Error (${audioResponse.status}):`, errorData);
          if (audioResponse.status === 401) throw new Error('Whisper API key is invalid or unauthorized (401)');
          throw new Error(`Whisper API request failed with status ${audioResponse.status}: ${errorData.error?.message || audioResponse.statusText}`);
        }

        const audioData = await audioResponse.json();
        audioTranscription = audioData.text || 'No transcription result from Whisper API.';
        console.log(`Audio transcription successful for video: ${sourceName}`);

    } catch (audioError) {
        console.error(`Error during video audio transcription for ${sourceName}:`, audioError);
        // Don't stop the whole process, just note the error
        audioTranscription = `Audio transcription error: ${audioError.message}`;
    }


    // --- 2. Frame Analysis / OCR (Conceptual Outline) ---
    // This part requires frame extraction, which is complex client-side without ffmpeg.wasm or similar.
    if (visionApiKey) {
        console.warn("Video processing: Frame extraction and analysis (OCR) is complex and not fully implemented client-side.");
        frameAnalysisResult = 'Frame analysis/OCR requires client-side frame extraction (e.g., using ffmpeg.wasm) or server-side processing.';

        /*
        Conceptual Steps if frame extraction were available:

        1. Extract Keyframes:
           Use a library (like ffmpeg.wasm) or a server-side process to extract
           representative frames from the video file into image formats (e.g., base64 JPEG/PNG).
           const framesBase64 = await extractKeyframes(file); // Hypothetical function

        2. Analyze Frames with Vision Model:
           For each extracted frame (or a selection):
           a. Prepare API request similar to processImage, sending the frame's base64 data.
           b. Use a prompt specifically asking for text extraction (OCR). Example prompt:
              "Extract any text visible in this image. If no text is present, respond with 'No text found'."
           c. Make the API call to the vision model (e.g., GPT-4 Vision).
           const visionApiUrl = 'https://api.openai.com/v1/chat/completions';
           const visionHeaders = { 'Authorization': `Bearer ${visionApiKey}`, 'Content-Type': 'application/json' };
           const visionBody = JSON.stringify({
               model: "gpt-4-vision-preview", // Or appropriate model
               messages: [ { role: "user", content: [ { type: "text", text: "Extract any text visible in this image." }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${frameBase64}` } } ] } ],
               max_tokens: 200
           });
           const visionResponse = await fetch(visionApiUrl, { method: 'POST', headers: visionHeaders, body: visionBody });
           // Handle response and errors...
           const visionData = await visionResponse.json();
           const frameText = visionData.choices[0]?.message?.content || 'Error analyzing frame';

           d. Aggregate results from all analyzed frames.
           frameAnalysisResult = aggregatedFrameTexts; // Combine text found in frames

        */

    } else {
        frameAnalysisResult = 'Frame analysis/OCR requires a vision-capable API key.';
    }

    // --- 3. Combine Results ---
    combinedResult = `--- Audio Transcription ---\n${audioTranscription}\n\n--- On-Screen Text (OCR) ---\n${frameAnalysisResult}`;

    // --- 4. Add to Database ---
    await addData({
      type: 'video',
      source: sourceName,
      content: `Video file: ${file.name}`, // Store reference
      processingResult: combinedResult,
      timestamp: new Date().toISOString(),
    });

    console.log(`Video processing finished for: ${sourceName}`);
    return { success: true, processingResult: combinedResult };

  } catch (error) {
    // Catch any unexpected errors during the overall process
    console.error(`Error processing video ${sourceName}:`, error);
    // Attempt to save whatever results were obtained
    combinedResult = `--- Audio Transcription ---\n${audioTranscription}\n\n--- On-Screen Text (OCR) ---\n${frameAnalysisResult}\n\n--- ERROR ---\nProcessing error: ${error.message}`;
     await addData({
      type: 'video',
      source: sourceName,
      content: `Video file: ${file.name} (encountered error)`,
      processingResult: combinedResult,
      timestamp: new Date().toISOString(),
    }).catch(dbError => console.error("Failed to save error state to DB:", dbError)); // Log DB error if saving fails

    return { error: true, processingResult: `Error: ${error.message || 'Unable to process video.'}` };
  }
};
