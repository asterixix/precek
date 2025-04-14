// This file will handle multimedia processing and AI integrations using web-compatible APIs
import axios from 'axios';
import { insertData } from './database';

// Function to read file data as base64
const readFileAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Process image file with AI
const processImage = async (file) => {
  try {
    if (!file) return null;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error(`File type ${file.type} is not supported for image processing`);
    }

    const base64Data = await readFileAsBase64(file);

    // Basic image preprocessing
    await ensureValidImageData(base64Data, file.name);

    // Call API for image analysis
    const response = await fetchAIProcessing('image', base64Data, file.name);

    // Store the processed result
    const processedData = {
      originalName: file.name,
      type: 'image',
      size: file.size,
      mimeType: file.type,
      processingResult: response,
      timestamp: new Date().toISOString(),
      data: base64Data
    };

    await insertData('image', JSON.stringify(processedData));
    return processedData;
  } catch (error) {
    console.error('Error processing image:', error);

    // Create a fallback processed result with error information
    const errorData = {
      originalName: file ? file.name : 'unknown',
      type: 'image',
      size: file ? file.size : 0,
      mimeType: file ? file.type : 'unknown',
      processingResult: `Error: Unable to process image. ${error.message}`,
      timestamp: new Date().toISOString(),
      error: true
    };

    // Still store the error result so user can see it in visualizations
    await insertData('image', JSON.stringify(errorData));

    // We return the error data rather than throwing so UI can handle it gracefully
    return errorData;
  }
};

// Helper function to validate image data before sending to API
const ensureValidImageData = async (base64Data, filename) => {
  return new Promise((resolve, reject) => {
    // Create an image element to test loading
    const img = new Image();

    img.onload = () => {
      // If image loads successfully it's valid
      console.log(`Image validated: ${filename} (${img.width}x${img.height})`);
      resolve(true);
    };

    img.onerror = () => {
      reject(new Error('Invalid image data or format'));
    };

    // Set source to test loading
    img.src = base64Data;
  });
};

// Process video file with AI
const processVideo = async (file) => {
  try {
    if (!file) return null;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      throw new Error(`File type ${file.type} is not supported for video processing`);
    }

    const base64Data = await readFileAsBase64(file);

    // Call AI service for video analysis
    const response = await fetchAIProcessing('video', base64Data, file.name);

    // Store the processed result
    const processedData = {
      originalName: file.name,
      type: 'video',
      size: file.size,
      mimeType: file.type,
      processingResult: response,
      timestamp: new Date().toISOString(),
      data: base64Data
    };

    await insertData('video', JSON.stringify(processedData));
    return processedData;
  } catch (error) {
    console.error('Error processing video:', error);

    // Create a fallback processed result with error information
    const errorData = {
      originalName: file ? file.name : 'unknown',
      type: 'video',
      size: file ? file.size : 0,
      mimeType: file ? file.type : 'unknown',
      processingResult: `Error: Unable to process video. ${error.message}`,
      timestamp: new Date().toISOString(),
      error: true
    };

    // Still store the error result so user can see it in visualizations
    await insertData('video', JSON.stringify(errorData));

    // Return the error data rather than throwing
    return errorData;
  }
};

// Process audio with AI
const processAudio = async (file) => {
  try {
    if (!file) return null;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      throw new Error(`File type ${file.type} is not supported for audio processing`);
    }

    const base64Data = await readFileAsBase64(file);

    // Call AI service for audio analysis
    const response = await fetchAIProcessing('audio', base64Data, file.name);

    // Store the processed result
    const processedData = {
      originalName: file.name,
      type: 'audio',
      size: file.size,
      mimeType: file.type,
      processingResult: response,
      timestamp: new Date().toISOString(),
      data: base64Data
    };

    await insertData('audio', JSON.stringify(processedData));
    return processedData;
  } catch (error) {
    console.error('Error processing audio:', error);

    // Create a fallback processed result with error information
    const errorData = {
      originalName: file ? file.name : 'unknown',
      type: 'audio',
      size: file ? file.size : 0,
      mimeType: file ? file.type : 'unknown',
      processingResult: `Error: Unable to process audio. ${error.message}`,
      timestamp: new Date().toISOString(),
      error: true
    };

    // Still store the error result so user can see it in visualizations
    await insertData('audio', JSON.stringify(errorData));

    // Return the error data rather than throwing
    return errorData;
  }
};

// Process text with AI
const processText = async (text) => {
  try {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Invalid or empty text input');
    }

    // Call AI service for text analysis
    const response = await fetchAIProcessing('text', text);

    // Store the processed result
    const processedData = {
      type: 'text',
      content: text,
      processingResult: response,
      timestamp: new Date().toISOString()
    };

    await insertData('text', JSON.stringify(processedData));
    return processedData;
  } catch (error) {
    console.error('Error processing text:', error);

    // Create a fallback processed result with error information
    const errorData = {
      type: 'text',
      content: text || '',
      processingResult: `Error: Unable to process text. ${error.message}`,
      timestamp: new Date().toISOString(),
      error: true
    };

    // Still store the error result so user can see it in visualizations
    await insertData('text', JSON.stringify(errorData));

    // Return the error data rather than throwing
    return errorData;
  }
};

// Helper function to get API keys from all possible sources
const getAPIKeys = () => {
  // Check for keys in our specific global object first (most reliable method)
  if (typeof window !== 'undefined' && window.__PRECEK_API_KEYS) {
    const precekKeys = window.__PRECEK_API_KEYS;
    if (precekKeys.openai || precekKeys.openrouter) {
      return {
        openAIApiKey: precekKeys.openai || '',
        openRouterApiKey: precekKeys.openrouter || ''
      };
    }
  }
  
  // Fall back to checking other sources
  const openAIApiKey = 
    (typeof window !== 'undefined' && window.NEXT_PUBLIC_OPENAI_API_KEY) ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY || 
    (typeof window !== 'undefined' && localStorage.getItem('openai_api_key')) || 
    '';
  
  const openRouterApiKey = 
    (typeof window !== 'undefined' && window.OPENROUTER_API_KEY) ||
    process.env.OPENROUTER_API_KEY || 
    (typeof window !== 'undefined' && localStorage.getItem('openrouter_api_key')) || 
    '';
    
  return { openAIApiKey, openRouterApiKey };
};

// Function to call relevant API for processing based on media type
const fetchAIProcessing = async (mediaType, content, filename = '') => {
  // Get API keys using our helper function
  const { openAIApiKey, openRouterApiKey } = getAPIKeys();

  // Ensure we have at least one API key
  if (!openAIApiKey && !openRouterApiKey) {
    console.error('API key not found in any available source');
    throw new Error('API key is required for media processing');
  }

  try {
    switch(mediaType) {
      case 'image':
        // Use OpenAI GPT-4 Vision or similar model for image analysis
        return await processImageWithGPT4Vision(openAIApiKey, content, filename);
      case 'audio':
        // Use OpenAI Whisper or similar model for audio processing
        return await processAudioWithWhisper(openAIApiKey, content, filename);
      case 'video':
        // Use specialized video processing by extracting frames and audio
        return await processVideoWithFrameExtraction(openAIApiKey, content, filename);
      case 'text':
        // Use OpenRouter for text processing (as it has more cost-effective options)
        return await processTextWithGPT(openRouterApiKey || openAIApiKey, content);
      default:
        throw new Error(`Unsupported media type: ${mediaType}`);
    }
  } catch (error) {
    console.error(`Error in AI processing for ${mediaType}:`, error);
    throw error;
  }
};

// Process image with OpenAI Vision models
const processImageWithGPT4Vision = async (apiKey, imageData, filename) => {
  try {
    console.log('Processing image with OpenAI Vision models...');
    
    // Check if we're using OpenRouter or OpenAI based on the API key format
    // OpenRouter keys start with sk-or-, OpenAI keys start with sk- (including sk-proj-)
    const isOpenRouter = apiKey.startsWith('sk-or-');
    let model;
    let endpoint;
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    // Log API key format for debugging (without revealing the full key)
    console.log(`API key format: ${apiKey.substring(0, 7)}...`);    // Select appropriate model and endpoint based on API key type
    if (isOpenRouter) {
      model = 'openai/gpt-4-vision-preview'; // OpenRouter format for Vision model
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      headers['HTTP-Referer'] = 'https://precek.app'; // Required by OpenRouter
      console.log('Using OpenRouter for image processing');
    } else {
      // Using OpenAI directly
      model = 'gpt-4-vision-preview'; // Latest vision model
      endpoint = 'https://api.openai.com/v1/chat/completions'; // Ensures correct path
      console.log('Using OpenAI directly for image processing');
    }    // Process the image data - make sure we have a proper format
    let base64Image = imageData;
    let imageUrl;
    
    // Get image details
    const imgDetails = await getImageDetails(imageData);
    console.log(`Image validated: ${filename} (${imgDetails.width}x${imgDetails.height}, ${imgDetails.format})`);

    // Check if the image data is already a URL or needs to be converted to base64
    if (base64Image.startsWith('http')) {
      // If it's already a URL, use it directly
      imageUrl = base64Image;
    } else {
      // If it's base64 data, extract the base64 part if needed
      if (base64Image.includes(',')) {
        // Extract the base64 part after the comma if it's a data URL
        base64Image = base64Image.split(',')[1];
      }
      // Format as a data URL
      imageUrl = `data:${imgDetails.mimeType};base64,${base64Image}`;
    }

    // Create the API request body according to OpenAI documentation
    const requestBody = {
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are an image analysis assistant. Analyze images thoroughly and accurately.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please analyze this image thoroughly and provide:
1. Description of main subjects and elements
2. Colors, lighting, and composition analysis
3. Any text visible in the image (transcribe exactly)
4. Context and potential meaning/purpose of the image
5. Any notable objects, landmarks, or people
6. Image quality and technical assessment

Filename: ${filename || 'uploaded image'}`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    };

    // Make the API request
    console.log(`Sending request to ${isOpenRouter ? 'OpenRouter' : 'OpenAI'} API...`);
    const response = await axios({
      method: 'post',
      url: endpoint,
      headers: headers,
      data: requestBody,
      timeout: 60000 // 60 second timeout for image processing
    });

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      console.log('Image successfully processed by vision model');
      return formatImageAnalysis(response.data.choices[0].message.content, filename, imgDetails);
    } else {
      console.error('Unexpected API response format:', response.data);
      throw new Error('Failed to process image with AI model: invalid response format');
    }
  } catch (error) {
    console.error('Image processing error:', error);
    // Check for specific API error types
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 400) {
        throw new Error(`Image processing failed: Bad request - ${data.error?.message || 'Invalid request parameters'}`);
      } else if (status === 401) {
        throw new Error('Image processing failed: Invalid API key or unauthorized access');
      } else if (status === 429) {
        throw new Error('Image processing failed: Rate limit exceeded or insufficient quota');
      } else if (status === 500) {
        throw new Error('Image processing failed: OpenAI service error');
      }
    }
    
    // Generic error if not caught by specifics above
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

// Helper function to get image details
const getImageDetails = async (imageData) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Get image format from data URL
      let format = 'jpeg'; // Default
      let mimeType = 'image/jpeg'; // Default
      
      if (imageData.includes('data:')) {
        const mimeMatch = imageData.match(/data:([^;]+);/);
        if (mimeMatch && mimeMatch[1]) {
          mimeType = mimeMatch[1];
          format = mimeMatch[1].split('/')[1];
        }
      }
      
      resolve({
        width: img.width,
        height: img.height,
        format: format,
        mimeType: mimeType,
        aspectRatio: img.width / img.height
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for analysis'));
    };
    
    img.src = imageData;
  });
};

// Format the image analysis in a structured way
const formatImageAnalysis = (content, filename, imageDetails) => {
  return `# Image Analysis: ${filename || 'Uploaded Image'}

## Technical Details
- Dimensions: ${imageDetails.width}x${imageDetails.height} pixels
- Format: ${imageDetails.format.toUpperCase()}
- Aspect Ratio: ${imageDetails.aspectRatio.toFixed(2)}

## Analysis
${content}

---
*Analyzed with OpenAI Vision Model*`;
};

// Process audio with Whisper API according to OpenAI docs
// https://platform.openai.com/docs/guides/speech-to-text/quickstart
const processAudioWithWhisper = async (apiKey, audioData, filename) => {
  try {
    console.log('Processing audio with Whisper API...');

    // Convert base64 audio data to a Blob
    let audioBase64 = audioData;
    if (audioBase64.includes(',')) {
      audioBase64 = audioBase64.split(',')[1];
    }

    // Determine the content type from the data URL or filename
    const contentType = audioData.includes('data:')
      ? audioData.split(';')[0].split(':')[1]
      : filename.endsWith('.mp3') ? 'audio/mp3' : 'audio/mpeg';

    // Convert base64 to a Blob (important for FormData)
    const byteCharacters = atob(audioBase64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const audioBlob = new Blob(byteArrays, { type: contentType });
    console.log(`Created audio blob of type ${contentType}, size: ${audioBlob.size} bytes`);

    // Create a form data object as required by the Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, filename || 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json'); // Get structured JSON response
    formData.append('language', 'en'); // Set to English for better accuracy

    // Call the OpenAI Whisper API
    console.log('Sending request to Whisper API...');
    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/audio/transcriptions',
      headers: {
        'Authorization': `Bearer ${apiKey}`
        // Content-Type is set automatically by axios with FormData
      },
      data: formData
    });

    // Check if we have a valid response
    if (response.data && response.data.text) {
      const transcription = response.data.text;
      console.log('Successfully transcribed audio');

      // Now analyze the transcription with GPT
      console.log('Analyzing transcription content...');      const analysisResponse = await axios({
        method: 'post',
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        data: {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Analyze this audio transcription and provide a summary of key points, topics, and any notable patterns or insights:\n\n${transcription}`
            }
          ],
          max_tokens: 500
        },
        timeout: 60000 // Adding 60 second timeout for reliability
      });

      // Combine transcription and analysis
      if (analysisResponse.data && analysisResponse.data.choices &&
          analysisResponse.data.choices.length > 0 &&
          analysisResponse.data.choices[0].message) {
        return `## Audio Transcription\n\n${transcription}\n\n## Analysis\n\n${analysisResponse.data.choices[0].message.content}`;
      } else {
        return `## Audio Transcription\n\n${transcription}\n\n(Analysis unavailable)`;
      }
    } else {
      console.error('Unexpected API response format:', response.data);
      throw new Error('Failed to transcribe audio: unexpected response format');
    }
  } catch (error) {
    console.error('Audio processing error:', error);
    if (error.response) {
      console.error('API error response:', error.response.data);
    }
    throw new Error(`Audio processing failed: ${error.message}`);
  }
};

// Process video by extracting multiple frames for analysis
const processVideoWithFrameExtraction = async (apiKey, videoData, filename) => {
  try {
    console.log('Processing video with frame extraction...');

    // Convert data URL to Blob for video element
    const videoBlob = await fetch(videoData).then(res => res.blob());
    const videoUrl = URL.createObjectURL(videoBlob);

    // Create a video element to extract frames
    const video = document.createElement('video');
    video.muted = true; // Required for autoplay in some browsers
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;

    // Wait for metadata to load
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
      video.load();
    });

    console.log(`Video loaded: Duration ${video.duration}s, Dimensions: ${video.videoWidth}x${video.videoHeight}`);

    // Extract multiple frames from different points in the video
    const frameCount = Math.min(3, Math.max(1, Math.floor(video.duration / 5)));
    const frames = [];

    // Create canvas for frame extraction
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Extract frames at different timestamps
    for (let i = 0; i < frameCount; i++) {
      const timestamp = i * (video.duration / (frameCount + 1));

      // Seek to timestamp
      video.currentTime = timestamp;

      // Wait for seek to complete
      await new Promise(resolve => {
        video.onseeked = resolve;
      });

      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get frame as data URL
      const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8);

      frames.push({
        timestamp,
        dataUrl: frameDataUrl
      });

      console.log(`Extracted frame at ${timestamp.toFixed(2)}s`);
    }

    // Clean up video resources
    URL.revokeObjectURL(videoUrl);

    // Analyze frames with Vision API
    console.log('Analyzing video frames with Vision API...');
    const frameAnalyses = [];

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const analysis = await processImageWithGPT4Vision(
        apiKey,
        frame.dataUrl,
        `Frame at ${frame.timestamp.toFixed(2)}s from ${filename}`
      );

      frameAnalyses.push({
        timestamp: frame.timestamp,
        analysis
      });
    }

    // Combine all frame analyses into a comprehensive video analysis
    const formattedAnalyses = frameAnalyses.map(fa =>
      `### Frame at ${fa.timestamp.toFixed(2)}s:\n${fa.analysis}`
    ).join('\n\n');

    return `# Video Analysis for: ${filename}

## Technical Details
- Duration: ${Math.round(video.duration)} seconds
- Dimensions: ${video.videoWidth}x${video.videoHeight}
- Format: ${videoBlob.type}
- File Size: ${(videoBlob.size / (1024 * 1024)).toFixed(2)} MB

## Content Analysis
${formattedAnalyses}

This analysis is based on ${frameCount} key frames extracted from the video.`;
  } catch (error) {
    console.error('Video processing error:', error);
    throw new Error(`Video processing failed: ${error.message}`);
  }
};

// Process text with GPT model through OpenRouter
const processTextWithGPT = async (apiKey, text) => {
  try {
    // Determine if we're using OpenRouter or OpenAI based on the API key format
    const isOpenRouter = apiKey.startsWith('sk-or-');
    const endpoint = isOpenRouter
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    // Use a more cost-effective model if going through OpenRouter
    const model = isOpenRouter ? 'openai/gpt-3.5-turbo' : 'gpt-3.5-turbo';

    const requestBody = {
      model: model,
      messages: [{ role: 'user', content: text }],
      max_tokens: 1000
    };

    const response = await axios.post(
      endpoint,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      console.error('Unexpected API response format:', response.data);
      throw new Error('Failed to process text with AI model');
    }
  } catch (error) {
    console.error('Text processing error:', error);
    throw new Error(`Text processing failed: ${error.message}`);
  }
};

export { processImage, processAudio, processVideo, processText };
