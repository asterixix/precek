(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[332],{2936:(e,t,r)=>{(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return r(5685)}])},5654:(e,t,r)=>{"use strict";r.d(t,{Bq:()=>d,GF:()=>p,Ou:()=>u,WP:()=>l});var n=r(236),a=r(3857),o=r(3081),s=r.n(o),i="processedData",c=function(){return new Promise(function(e,t){var r=indexedDB.open("precekDB",1);r.onerror=function(e){console.error("Error opening database:",e.target.error),t(e.target.error)},r.onsuccess=function(t){e(t.target.result)},r.onupgradeneeded=function(e){var t=e.target.result;if(!t.objectStoreNames.contains(i)){var r=t.createObjectStore(i,{keyPath:"id",autoIncrement:!0});r.createIndex("type","type",{unique:!1}),r.createIndex("timestamp","timestamp",{unique:!1})}}})},u=function(){var e=(0,a.A)(s().mark(function e(t,r){var n;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,c();case 3:return n=e.sent,e.abrupt("return",new Promise(function(e,a){var o,s=n.transaction([i],"readwrite"),c=s.objectStore(i);if("string"==typeof r)try{o=JSON.parse(r)}catch(e){o={content:r}}else o=r;o.timestamp||(o.timestamp=new Date().toISOString()),o.type||(o.type=t);var u=c.add(o);u.onsuccess=function(t){e(t.target.result)},u.onerror=function(e){console.error("Error inserting data:",e.target.error),a(e.target.error)},s.oncomplete=function(){n.close()}}));case 7:return e.prev=7,e.t0=e.catch(0),console.error("Error in insertData:",e.t0),e.abrupt("return",null);case 11:case"end":return e.stop()}},e,null,[[0,7]])}));return function(t,r){return e.apply(this,arguments)}}(),l=function(){var e=(0,a.A)(s().mark(function e(){var t;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,c();case 3:return t=e.sent,e.abrupt("return",new Promise(function(e,r){var n=t.transaction([i],"readonly"),a=n.objectStore(i).getAll();a.onsuccess=function(t){e(t.target.result)},a.onerror=function(e){console.error("Error getting data:",e.target.error),r(e.target.error)},n.oncomplete=function(){t.close()}}));case 7:return e.prev=7,e.t0=e.catch(0),console.error("Error in getAllData:",e.t0),e.abrupt("return",[]);case 11:case"end":return e.stop()}},e,null,[[0,7]])}));return function(){return e.apply(this,arguments)}}(),p=function(){var e=(0,a.A)(s().mark(function e(){var t,r,a,o,i,c;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,l();case 3:if(r=(t=e.sent).length>0?t[0]:null){e.next=7;break}return e.abrupt("return","No data to export");case 7:return a=["id","type","timestamp"],o=Object.keys(r).filter(function(e){return!a.includes(e)&&"data"!==e}).sort(),c=(i=[].concat(a,(0,n.A)(o),["data"])).join(",")+"\n",t.forEach(function(e){var t=i.map(function(t){var r=e[t];return null==r?"":("object"==typeof r&&(r=JSON.stringify(r).replace(/"/g,'""')),'"'.concat(String(r).replace(/"/g,'""'),'"'))});c+=t.join(",")+"\n"}),e.abrupt("return",c);case 15:return e.prev=15,e.t0=e.catch(0),console.error("Error exporting to CSV:",e.t0),e.abrupt("return","Error exporting data to CSV");case 19:case"end":return e.stop()}},e,null,[[0,15]])}));return function(){return e.apply(this,arguments)}}(),d=function(){var e=(0,a.A)(s().mark(function e(){var t;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,c();case 3:return t=e.sent,e.abrupt("return",new Promise(function(e,r){var n=t.transaction([i],"readwrite"),a=n.objectStore(i).clear();a.onsuccess=function(){e(!0)},a.onerror=function(e){console.error("Error clearing data:",e.target.error),r(e.target.error)},n.oncomplete=function(){t.close()}}));case 7:return e.prev=7,e.t0=e.catch(0),console.error("Error in clearAllData:",e.t0),e.abrupt("return",!1);case 11:case"end":return e.stop()}},e,null,[[0,7]])}));return function(){return e.apply(this,arguments)}}();(function(){var e=(0,a.A)(s().mark(function e(){return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!window.indexedDB){e.next=18;break}if(e.prev=1,window.sessionStorage.getItem("precekSessionId")){e.next=10;break}return window.sessionStorage.setItem("precekSessionId",Date.now().toString()),console.log("New user session started, clearing previous database"),e.next=7,c();case 7:return e.sent,e.next=10,d();case 10:console.log("Database initialized for current session"),e.next=16;break;case 13:e.prev=13,e.t0=e.catch(1),console.error("Database initialization failed:",e.t0);case 16:e.next=19;break;case 18:console.warn("IndexedDB is not available in this environment");case 19:case"end":return e.stop()}},e,null,[[1,13]])}));return function(){return e.apply(this,arguments)}})()(),window.addEventListener("beforeunload",function(){d().catch(function(e){return console.log("Error clearing data on unload:",e)})})},5685:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>G});var n=r(2969),a=r(3857),o=r(3081),s=r.n(o),i=r(4232),c=r(8230),u=r.n(c),l=r(1040),p=r(5654),d=r(5364),m=function(e){return new Promise(function(t,r){var n=new FileReader;n.onload=function(){return t(n.result)},n.onerror=function(e){return r(e)},n.readAsDataURL(e)})},f=function(){var e=(0,a.A)(s().mark(function e(t){var r,n,a,o;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(e.prev=0,t){e.next=3;break}return e.abrupt("return",null);case 3:if(t.type.startsWith("image/")){e.next=5;break}throw Error("File type ".concat(t.type," is not supported for image processing"));case 5:return e.next=7,m(t);case 7:return r=e.sent,e.next=10,x(r,t.name);case 10:return e.next=12,y("image",r,t.name);case 12:return n=e.sent,a={originalName:t.name,type:"image",size:t.size,mimeType:t.type,processingResult:n,timestamp:new Date().toISOString(),data:r},e.next=16,(0,p.Ou)("image",JSON.stringify(a));case 16:return e.abrupt("return",a);case 19:return e.prev=19,e.t0=e.catch(0),console.error("Error processing image:",e.t0),o={originalName:t?t.name:"unknown",type:"image",size:t?t.size:0,mimeType:t?t.type:"unknown",processingResult:"Error: Unable to process image. ".concat(e.t0.message),timestamp:new Date().toISOString(),error:!0},e.next=25,(0,p.Ou)("image",JSON.stringify(o));case 25:return e.abrupt("return",o);case 26:case"end":return e.stop()}},e,null,[[0,19]])}));return function(t){return e.apply(this,arguments)}}(),x=function(){var e=(0,a.A)(s().mark(function e(t,r){return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise(function(e,n){var a=new Image;a.onload=function(){console.log("Image validated: ".concat(r," (").concat(a.width,"x").concat(a.height,")")),e(!0)},a.onerror=function(){n(Error("Invalid image data or format"))},a.src=t}));case 1:case"end":return e.stop()}},e)}));return function(t,r){return e.apply(this,arguments)}}(),h=function(){var e=(0,a.A)(s().mark(function e(t){var r,n,a,o;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(e.prev=0,t){e.next=3;break}return e.abrupt("return",null);case 3:if(t.type.startsWith("video/")){e.next=5;break}throw Error("File type ".concat(t.type," is not supported for video processing"));case 5:return e.next=7,m(t);case 7:return r=e.sent,e.next=10,y("video",r,t.name);case 10:return n=e.sent,a={originalName:t.name,type:"video",size:t.size,mimeType:t.type,processingResult:n,timestamp:new Date().toISOString(),data:r},e.next=14,(0,p.Ou)("video",JSON.stringify(a));case 14:return e.abrupt("return",a);case 17:return e.prev=17,e.t0=e.catch(0),console.error("Error processing video:",e.t0),o={originalName:t?t.name:"unknown",type:"video",size:t?t.size:0,mimeType:t?t.type:"unknown",processingResult:"Error: Unable to process video. ".concat(e.t0.message),timestamp:new Date().toISOString(),error:!0},e.next=23,(0,p.Ou)("video",JSON.stringify(o));case 23:return e.abrupt("return",o);case 24:case"end":return e.stop()}},e,null,[[0,17]])}));return function(t){return e.apply(this,arguments)}}(),g=function(){var e=(0,a.A)(s().mark(function e(t){var r,n,a,o;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(e.prev=0,t){e.next=3;break}return e.abrupt("return",null);case 3:if(t.type.startsWith("audio/")){e.next=5;break}throw Error("File type ".concat(t.type," is not supported for audio processing"));case 5:return e.next=7,m(t);case 7:return r=e.sent,e.next=10,y("audio",r,t.name);case 10:return n=e.sent,a={originalName:t.name,type:"audio",size:t.size,mimeType:t.type,processingResult:n,timestamp:new Date().toISOString(),data:r},e.next=14,(0,p.Ou)("audio",JSON.stringify(a));case 14:return e.abrupt("return",a);case 17:return e.prev=17,e.t0=e.catch(0),console.error("Error processing audio:",e.t0),o={originalName:t?t.name:"unknown",type:"audio",size:t?t.size:0,mimeType:t?t.type:"unknown",processingResult:"Error: Unable to process audio. ".concat(e.t0.message),timestamp:new Date().toISOString(),error:!0},e.next=23,(0,p.Ou)("audio",JSON.stringify(o));case 23:return e.abrupt("return",o);case 24:case"end":return e.stop()}},e,null,[[0,17]])}));return function(t){return e.apply(this,arguments)}}(),v=function(){var e=(0,a.A)(s().mark(function e(t){var r,n;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(e.prev=0,!(!t||"string"!=typeof t||0===t.trim().length)){e.next=3;break}throw Error("Invalid or empty text input");case 3:return e.next=5,y("text",t);case 5:return r={type:"text",content:t,processingResult:e.sent,timestamp:new Date().toISOString()},e.next=9,(0,p.Ou)("text",JSON.stringify(r));case 9:return e.abrupt("return",r);case 12:return e.prev=12,e.t0=e.catch(0),console.error("Error processing text:",e.t0),n={type:"text",content:t||"",processingResult:"Error: Unable to process text. ".concat(e.t0.message),timestamp:new Date().toISOString(),error:!0},e.next=18,(0,p.Ou)("text",JSON.stringify(n));case 18:return e.abrupt("return",n);case 19:case"end":return e.stop()}},e,null,[[0,12]])}));return function(t){return e.apply(this,arguments)}}(),y=function(){var e=(0,a.A)(s().mark(function e(t,r){var n,a,o,i=arguments;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(n=i.length>2&&void 0!==i[2]?i[2]:"",a=d.env.NEXT_PUBLIC_OPENAI_API_KEY,o=d.env.OPENROUTER_API_KEY,!(!a&&!o)){e.next=6;break}throw console.error("API key not found in environment variables"),Error("API key is required for media processing");case 6:e.prev=6,e.t0=t,e.next="image"===e.t0?10:"audio"===e.t0?13:"video"===e.t0?16:"text"===e.t0?19:22;break;case 10:return e.next=12,b(a,r,n);case 12:case 15:case 18:case 21:return e.abrupt("return",e.sent);case 13:return e.next=15,k(a,r,n);case 16:return e.next=18,j(a,r,n);case 19:return e.next=21,I(o||a,r);case 22:throw Error("Unsupported media type: ".concat(t));case 23:e.next=29;break;case 25:throw e.prev=25,e.t1=e.catch(6),console.error("Error in AI processing for ".concat(t,":"),e.t1),e.t1;case 29:case"end":return e.stop()}},e,null,[[6,25]])}));return function(t,r){return e.apply(this,arguments)}}(),b=function(){var e=(0,a.A)(s().mark(function e(t,r,n){var a,o,i,c,u,p,d,m,f,x,h,g;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,console.log("Processing image with OpenAI Vision models..."),a=t.startsWith("sk-or-"),c={"Content-Type":"application/json",Authorization:"Bearer ".concat(t)},console.log("API key format: ".concat(t.substring(0,7),"...")),a?(o="openai/gpt-4-vision-preview",i="https://openrouter.ai/api/v1/chat/completions",c["HTTP-Referer"]="https://precek.app",console.log("Using OpenRouter for image processing")):(o="gpt-4-vision-preview",i="https://api.openai.com/v1/chat/completions",console.log("Using OpenAI directly for image processing")),u=r,e.next=9,w(r);case 9:return d=e.sent,console.log("Image validated: ".concat(n," (").concat(d.width,"x").concat(d.height,", ").concat(d.format,")")),u.startsWith("http")?p=u:(u.includes(",")&&(u=u.split(",")[1]),p="data:".concat(d.mimeType,";base64,").concat(u)),m={model:o,messages:[{role:"system",content:"You are an image analysis assistant. Analyze images thoroughly and accurately."},{role:"user",content:[{type:"text",text:"Please analyze this image thoroughly and provide:\n1. Description of main subjects and elements\n2. Colors, lighting, and composition analysis\n3. Any text visible in the image (transcribe exactly)\n4. Context and potential meaning/purpose of the image\n5. Any notable objects, landmarks, or people\n6. Image quality and technical assessment\n\nFilename: ".concat(n||"uploaded image")},{type:"image_url",image_url:{url:p}}]}],max_tokens:1e3,temperature:.7},console.log("Sending request to ".concat(a?"OpenRouter":"OpenAI"," API...")),e.next=16,(0,l.A)({method:"post",url:i,headers:c,data:m,timeout:6e4});case 16:if(!((f=e.sent).data&&f.data.choices&&f.data.choices.length>0)){e.next=22;break}return console.log("Image successfully processed by vision model"),e.abrupt("return",A(f.data.choices[0].message.content,n,d));case 22:throw console.error("Unexpected API response format:",f.data),Error("Failed to process image with AI model: invalid response format");case 24:e.next=47;break;case 26:if(e.prev=26,e.t0=e.catch(0),console.error("Image processing error:",e.t0),!e.t0.response){e.next=46;break}if(x=e.t0.response.status,h=e.t0.response.data,400!==x){e.next=36;break}throw Error("Image processing failed: Bad request - ".concat((null==(g=h.error)?void 0:g.message)||"Invalid request parameters"));case 36:if(401!==x){e.next=40;break}throw Error("Image processing failed: Invalid API key or unauthorized access");case 40:if(429!==x){e.next=44;break}throw Error("Image processing failed: Rate limit exceeded or insufficient quota");case 44:if(500!==x){e.next=46;break}throw Error("Image processing failed: OpenAI service error");case 46:throw Error("Image processing failed: ".concat(e.t0.message));case 47:case"end":return e.stop()}},e,null,[[0,26]])}));return function(t,r,n){return e.apply(this,arguments)}}(),w=function(){var e=(0,a.A)(s().mark(function e(t){return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise(function(e,r){var n=new Image;n.onload=function(){var r="jpeg",a="image/jpeg";if(t.includes("data:")){var o=t.match(/data:([^;]+);/);o&&o[1]&&(a=o[1],r=o[1].split("/")[1])}e({width:n.width,height:n.height,format:r,mimeType:a,aspectRatio:n.width/n.height})},n.onerror=function(){r(Error("Failed to load image for analysis"))},n.src=t}));case 1:case"end":return e.stop()}},e)}));return function(t){return e.apply(this,arguments)}}(),A=function(e,t,r){return"# Image Analysis: ".concat(t||"Uploaded Image","\n\n## Technical Details\n- Dimensions: ").concat(r.width,"x").concat(r.height," pixels\n- Format: ").concat(r.format.toUpperCase(),"\n- Aspect Ratio: ").concat(r.aspectRatio.toFixed(2),"\n\n## Analysis\n").concat(e,"\n\n---\n*Analyzed with OpenAI Vision Model*")},k=function(){var e=(0,a.A)(s().mark(function e(t,r,n){var a,o,i,c,u,p,d,m,f,x,h,g,v,y;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:for(e.prev=0,console.log("Processing audio with Whisper API..."),(a=r).includes(",")&&(a=a.split(",")[1]),o=r.includes("data:")?r.split(";")[0].split(":")[1]:n.endsWith(".mp3")?"audio/mp3":"audio/mpeg",i=atob(a),c=[],u=0;u<i.length;u+=1024){for(m=0,d=Array((p=i.slice(u,u+1024)).length);m<p.length;m++)d[m]=p.charCodeAt(m);f=new Uint8Array(d),c.push(f)}return x=new Blob(c,{type:o}),console.log("Created audio blob of type ".concat(o,", size: ").concat(x.size," bytes")),(h=new FormData).append("file",x,n||"audio.mp3"),h.append("model","whisper-1"),h.append("response_format","json"),h.append("language","en"),console.log("Sending request to Whisper API..."),e.next=18,(0,l.A)({method:"post",url:"https://api.openai.com/v1/audio/transcriptions",headers:{Authorization:"Bearer ".concat(t)},data:h});case 18:if(!((g=e.sent).data&&g.data.text)){e.next=33;break}return v=g.data.text,console.log("Successfully transcribed audio"),console.log("Analyzing transcription content..."),e.next=25,(0,l.A)({method:"post",url:"https://api.openai.com/v1/chat/completions",headers:{"Content-Type":"application/json",Authorization:"Bearer ".concat(t)},data:{model:"gpt-3.5-turbo",messages:[{role:"user",content:"Analyze this audio transcription and provide a summary of key points, topics, and any notable patterns or insights:\n\n".concat(v)}],max_tokens:500}});case 25:if(!((y=e.sent).data&&y.data.choices&&y.data.choices.length>0&&y.data.choices[0].message)){e.next=30;break}return e.abrupt("return","## Audio Transcription\n\n".concat(v,"\n\n## Analysis\n\n").concat(y.data.choices[0].message.content));case 30:return e.abrupt("return","## Audio Transcription\n\n".concat(v,"\n\n(Analysis unavailable)"));case 31:e.next=35;break;case 33:throw console.error("Unexpected API response format:",g.data),Error("Failed to transcribe audio: unexpected response format");case 35:e.next=42;break;case 37:throw e.prev=37,e.t0=e.catch(0),console.error("Audio processing error:",e.t0),e.t0.response&&console.error("API error response:",e.t0.response.data),Error("Audio processing failed: ".concat(e.t0.message));case 42:case"end":return e.stop()}},e,null,[[0,37]])}));return function(t,r,n){return e.apply(this,arguments)}}(),j=function(){var e=(0,a.A)(s().mark(function e(t,r,n){var a,o,i,c,u,l,p,d,m,f,x,h,g,v,y;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,console.log("Processing video with frame extraction..."),e.next=4,fetch(r).then(function(e){return e.blob()});case 4:return a=e.sent,o=URL.createObjectURL(a),(i=document.createElement("video")).muted=!0,i.playsInline=!0,i.crossOrigin="anonymous",i.src=o,e.next=13,new Promise(function(e,t){i.onloadedmetadata=e,i.onerror=t,i.load()});case 13:console.log("Video loaded: Duration ".concat(i.duration,"s, Dimensions: ").concat(i.videoWidth,"x").concat(i.videoHeight)),c=Math.min(3,Math.max(1,Math.floor(i.duration/5))),u=[],(l=document.createElement("canvas")).width=i.videoWidth,l.height=i.videoHeight,p=l.getContext("2d"),d=0;case 21:if(!(d<c)){e.next=33;break}return m=d*(i.duration/(c+1)),i.currentTime=m,e.next=26,new Promise(function(e){i.onseeked=e});case 26:p.drawImage(i,0,0,l.width,l.height),f=l.toDataURL("image/jpeg",.8),u.push({timestamp:m,dataUrl:f}),console.log("Extracted frame at ".concat(m.toFixed(2),"s"));case 30:d++,e.next=21;break;case 33:URL.revokeObjectURL(o),console.log("Analyzing video frames with Vision API..."),x=[],h=0;case 37:if(!(h<u.length)){e.next=46;break}return g=u[h],e.next=41,b(t,g.dataUrl,"Frame at ".concat(g.timestamp.toFixed(2),"s from ").concat(n));case 41:v=e.sent,x.push({timestamp:g.timestamp,analysis:v});case 43:h++,e.next=37;break;case 46:return y=x.map(function(e){return"### Frame at ".concat(e.timestamp.toFixed(2),"s:\n").concat(e.analysis)}).join("\n\n"),e.abrupt("return","# Video Analysis for: ".concat(n,"\n\n## Technical Details\n- Duration: ").concat(Math.round(i.duration)," seconds\n- Dimensions: ").concat(i.videoWidth,"x").concat(i.videoHeight,"\n- Format: ").concat(a.type,"\n- File Size: ").concat((a.size/1048576).toFixed(2)," MB\n\n## Content Analysis\n").concat(y,"\n\nThis analysis is based on ").concat(c," key frames extracted from the video."));case 50:throw e.prev=50,e.t0=e.catch(0),console.error("Video processing error:",e.t0),Error("Video processing failed: ".concat(e.t0.message));case 54:case"end":return e.stop()}},e,null,[[0,50]])}));return function(t,r,n){return e.apply(this,arguments)}}(),I=function(){var e=(0,a.A)(s().mark(function e(t,r){var n,a,o,i;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,a=(n=t.startsWith("sk-or-"))?"https://openrouter.ai/api/v1/chat/completions":"https://api.openai.com/v1/chat/completions",o={model:n?"openai/gpt-3.5-turbo":"gpt-3.5-turbo",messages:[{role:"user",content:r}],max_tokens:1e3},e.next=7,l.A.post(a,o,{headers:{"Content-Type":"application/json",Authorization:"Bearer ".concat(t)}});case 7:if(!((i=e.sent).data&&i.data.choices&&i.data.choices.length>0)){e.next=12;break}return e.abrupt("return",i.data.choices[0].message.content);case 12:throw console.error("Unexpected API response format:",i.data),Error("Failed to process text with AI model");case 14:e.next=20;break;case 16:throw e.prev=16,e.t0=e.catch(0),console.error("Text processing error:",e.t0),Error("Text processing failed: ".concat(e.t0.message));case 20:case"end":return e.stop()}},e,null,[[0,16]])}));return function(t,r){return e.apply(this,arguments)}}(),E=r(5290),P=r(4578),S=r(2882),O=r(5325),D=r(779),C=r(6778),F=r(7214),T=r(6058),U=r(3664),z=r(3875),_=r(6881),R=r(5638),W=r(5225),N=r(2280),B=r(2617),V=r(7876);function L(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)}return r}function q(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?L(Object(r),!0).forEach(function(t){(0,n.A)(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):L(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}var J=null;function K(e,t){return e?e.length>t?e.substring(0,t)+"...":e:""}(J=r(3553))&&(J.GlobalWorkerOptions.workerSrc="//unpkg.com/pdfjs-dist@".concat(J.version,"/build/pdf.worker.min.mjs"));let G=function(){var e,t,r,n,o,c,l,d,m=(0,i.useState)(""),x=m[0],y=m[1],b=(0,i.useState)(""),w=b[0],A=b[1],k=(0,i.useState)([]),j=k[0],I=k[1],L=(0,i.useState)(!1),G=L[0],H=L[1],M=(0,i.useState)(""),Y=M[0],X=M[1],Q=(0,i.useState)(""),Z=Q[0],$=Q[1],ee=(0,i.useState)(""),et=ee[0],er=ee[1],en=(0,i.useState)(!1),ea=en[0],eo=en[1],es=(0,i.useState)(!1),ei=es[0],ec=es[1];(0,i.useEffect)(function(){var e,t=(e=(0,a.A)(s().mark(function e(){return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,(0,p.WP)();case 3:I(e.sent||[]),e.next=11;break;case 7:e.prev=7,e.t0=e.catch(0),console.error("Error loading data:",e.t0),X("Failed to load existing data");case 11:case"end":return e.stop()}},e,null,[[0,7]])})),function(){return e.apply(this,arguments)}),r=localStorage.getItem("openai_api_key"),n=localStorage.getItem("openrouter_api_key");r||n?($(r||""),er(n||""),eo(!0)):ec(!0),t()},[]),(0,i.useEffect)(function(){},[]);var eu=(e=(0,a.A)(s().mark(function e(){return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(x){e.next=3;break}return alert("Please enter text to process"),e.abrupt("return");case 3:return H(!0),X(""),e.prev=5,e.next=8,v(x);case 8:return e.sent,A('Successfully processed text: "'.concat(x.substring(0,30)).concat(x.length>30?"...":"",'"')),e.next=12,(0,p.WP)();case 12:I(e.sent||[]),e.next=21;break;case 16:e.prev=16,e.t0=e.catch(5),console.error("Error processing text:",e.t0),X("Failed to process text: ".concat(e.t0.message||"Unknown error")),A("");case 21:return e.prev=21,H(!1),e.finish(21);case 24:case"end":return e.stop()}},e,null,[[5,16,21,24]])})),function(){return e.apply(this,arguments)}),el=(t=(0,a.A)(s().mark(function e(t){var r,n,a,o;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(r=t.target.files[0]){e.next=3;break}return e.abrupt("return");case 3:if(H(!0),X(""),e.prev=5,n="",!r.name.toLowerCase().endsWith(".txt")){e.next=13;break}return e.next=10,ep(r);case 10:case 18:n=e.sent,e.next=28;break;case 13:if(!r.name.toLowerCase().endsWith(".pdf")){e.next=21;break}if(J){e.next=16;break}throw Error("PDF processing is only available in browser environment");case 16:return e.next=18,ed(r);case 21:if(!r.name.toLowerCase().endsWith(".epub")){e.next=27;break}a=r.name,o=(r.size/1024).toFixed(2),n="EPUB file metadata:\nFilename: ".concat(a,"\nSize: ").concat(o," KB\n\n")+"This is an EPUB document. Due to its format, only metadata can be processed. Please extract the content using an EPUB reader before processing the full text.",e.next=28;break;case 27:throw Error("Unsupported file format. Please upload .txt, .pdf, or .epub files.");case 28:if(!(!n||0===n.trim().length)){e.next=30;break}throw Error("Could not extract text from the file. The file might be empty or corrupted.");case 30:return e.next=32,v(n);case 32:return A("Successfully processed text from: ".concat(r.name)),e.next=35,(0,p.WP)();case 35:I(e.sent||[]),e.next=44;break;case 39:e.prev=39,e.t0=e.catch(5),console.error("Error processing text file:",e.t0),X("Failed to process text file: ".concat(e.t0.message||"Unknown error")),A("");case 44:return e.prev=44,H(!1),e.finish(44);case 47:case"end":return e.stop()}},e,null,[[5,39,44,47]])})),function(e){return t.apply(this,arguments)}),ep=function(e){return new Promise(function(t,r){var n=new FileReader;n.onload=function(e){return t(e.target.result)},n.onerror=function(e){return r(Error("Error reading text file"))},n.readAsText(e)})},ed=(r=(0,a.A)(s().mark(function e(t){var r,n,a,o,i,c,u;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(J){e.next=2;break}throw Error("PDF processing is only available in browser environment");case 2:return e.prev=2,e.next=5,t.arrayBuffer();case 5:return r=e.sent,J.GlobalWorkerOptions.workerSrc="//unpkg.com/pdfjs-dist@".concat(J.version,"/build/pdf.worker.min.mjs"),n=J.getDocument({data:r}),e.next=10,n.promise;case 10:a=e.sent,o="",i=1;case 13:if(!(i<=a.numPages)){e.next=26;break}return e.next=16,a.getPage(i);case 16:return c=e.sent,e.next=19,c.getTextContent();case 19:u=e.sent.items.map(function(e){return e.str}).join(" "),o+=u+"\n\n";case 23:i++,e.next=13;break;case 26:return e.abrupt("return",o);case 29:throw e.prev=29,e.t0=e.catch(2),console.error("Error reading PDF:",e.t0),Error("Failed to extract text from PDF");case 33:case"end":return e.stop()}},e,null,[[2,29]])})),function(e){return r.apply(this,arguments)}),em=(n=(0,a.A)(s().mark(function e(){var t;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:H(!0),X(""),(t=document.createElement("input")).type="file",t.accept="audio/*",t.onchange=function(){var e=(0,a.A)(s().mark(function e(t){var r;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!(r=t.target.files[0])){e.next=22;break}return e.prev=2,e.next=5,g(r);case 5:return A("Successfully processed audio: ".concat(r.name)),e.next=8,(0,p.WP)();case 8:I(e.sent||[]),e.next=17;break;case 12:e.prev=12,e.t0=e.catch(2),console.error("Error processing audio:",e.t0),X("Failed to process audio: ".concat(e.t0.message||"Unknown error")),A("");case 17:return e.prev=17,H(!1),e.finish(17);case 20:e.next=23;break;case 22:H(!1);case 23:case"end":return e.stop()}},e,null,[[2,12,17,20]])}));return function(t){return e.apply(this,arguments)}}(),t.click();case 7:case"end":return e.stop()}},e)})),function(){return n.apply(this,arguments)}),ef=(o=(0,a.A)(s().mark(function e(){var t;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:H(!0),X(""),(t=document.createElement("input")).type="file",t.accept="video/*",t.onchange=function(){var e=(0,a.A)(s().mark(function e(t){var r;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!(r=t.target.files[0])){e.next=22;break}return e.prev=2,e.next=5,h(r);case 5:return A("Successfully processed video: ".concat(r.name)),e.next=8,(0,p.WP)();case 8:I(e.sent||[]),e.next=17;break;case 12:e.prev=12,e.t0=e.catch(2),console.error("Error processing video:",e.t0),X("Failed to process video: ".concat(e.t0.message||"Unknown error")),A("");case 17:return e.prev=17,H(!1),e.finish(17);case 20:e.next=23;break;case 22:H(!1);case 23:case"end":return e.stop()}},e,null,[[2,12,17,20]])}));return function(t){return e.apply(this,arguments)}}(),t.click();case 7:case"end":return e.stop()}},e)})),function(){return o.apply(this,arguments)}),ex=(c=(0,a.A)(s().mark(function e(){var t;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:H(!0),X(""),(t=document.createElement("input")).type="file",t.accept="image/*",t.onchange=function(){var e=(0,a.A)(s().mark(function e(t){var r;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!(r=t.target.files[0])){e.next=22;break}return e.prev=2,e.next=5,f(r);case 5:return A("Successfully processed image: ".concat(r.name)),e.next=8,(0,p.WP)();case 8:I(e.sent||[]),e.next=17;break;case 12:e.prev=12,e.t0=e.catch(2),console.error("Error processing image:",e.t0),X("Failed to process image: ".concat(e.t0.message||"Unknown error")),A("");case 17:return e.prev=17,H(!1),e.finish(17);case 20:e.next=23;break;case 22:H(!1);case 23:case"end":return e.stop()}},e,null,[[2,12,17,20]])}));return function(t){return e.apply(this,arguments)}}(),t.click();case 7:case"end":return e.stop()}},e)})),function(){return c.apply(this,arguments)}),eh=(l=(0,a.A)(s().mark(function e(){var t,r,n;return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,(0,p.GF)();case 3:t=new Blob([e.sent],{type:"text/csv"}),r=URL.createObjectURL(t),(n=document.createElement("a")).setAttribute("hidden",""),n.setAttribute("href",r),n.setAttribute("download","precek_data.csv"),document.body.appendChild(n),n.click(),document.body.removeChild(n),A("Data exported to CSV successfully"),e.next=20;break;case 16:e.prev=16,e.t0=e.catch(0),console.error("Error exporting to CSV:",e.t0),X("Failed to export data to CSV");case 20:case"end":return e.stop()}},e,null,[[0,16]])})),function(){return l.apply(this,arguments)}),eg=(d=(0,a.A)(s().mark(function e(){return s().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!window.confirm("Are you sure you want to clear all processed data? This action cannot be undone.")){e.next=12;break}return e.prev=1,e.next=4,(0,p.Bq)();case 4:I([]),A("All data has been cleared"),e.next=12;break;case 8:e.prev=8,e.t0=e.catch(1),console.error("Error clearing data:",e.t0),X("Failed to clear data");case 12:case"end":return e.stop()}},e,null,[[1,8]])})),function(){return d.apply(this,arguments)});return(0,V.jsxs)(z.A,{maxWidth:"lg",sx:{py:4,px:2},children:[(0,V.jsxs)(F.A,{component:"header",sx:{mb:4},children:[(0,V.jsx)(C.A,{variant:"h3",component:"h1",sx:{fontWeight:"bold"},children:"Precek"}),(0,V.jsx)(C.A,{variant:"body1",color:"text.secondary",children:"Text, Image, Audio, and Video Processing with AI"})]}),ei&&(0,V.jsxs)(P.A,{variant:"outlined",sx:{mb:3},children:[(0,V.jsx)(O.A,{title:(0,V.jsx)(C.A,{variant:"h5",children:"API Configuration"}),subheader:(0,V.jsx)(C.A,{color:"text.secondary",children:"Enter your API keys to use this application"})}),(0,V.jsx)(S.A,{children:(0,V.jsxs)(F.A,{sx:{display:"flex",flexDirection:"column",gap:2},children:[(0,V.jsx)(C.A,{children:"To use Precek, you need to provide at least one of the following API keys:"}),(0,V.jsx)(D.A,{label:"OpenAI API Key",value:Z,onChange:function(e){return $(e.target.value)},fullWidth:!0,placeholder:"sk-...",helperText:"Get your API key from https://platform.openai.com/account/api-keys",type:"password"}),(0,V.jsx)(C.A,{variant:"body2",color:"text.secondary",sx:{my:1},children:"OR"}),(0,V.jsx)(D.A,{label:"OpenRouter API Key",value:et,onChange:function(e){return er(e.target.value)},fullWidth:!0,placeholder:"sk-or-...",helperText:"Get your API key from https://openrouter.ai/keys",type:"password"}),(0,V.jsx)(E.A,{variant:"contained",onClick:function(){var e,t;if(!Z&&!et||Z&&!Z.startsWith("sk-")||et&&!et.startsWith("sk-or-"))return void X('Please enter valid API keys. OpenAI keys start with "sk-" and OpenRouter keys start with "sk-or-"');Z&&localStorage.setItem("openai_api_key",Z),et&&localStorage.setItem("openrouter_api_key",et),Z&&(window.process=q(q({},window.process),{},{env:q(q({},null==(e=window.process)?void 0:e.env),{},{NEXT_PUBLIC_OPENAI_API_KEY:Z})})),et&&(window.process=q(q({},window.process),{},{env:q(q({},null==(t=window.process)?void 0:t.env),{},{OPENROUTER_API_KEY:et})})),eo(!0),ec(!1),X(""),A("API keys configured successfully!")},sx:{mt:1},children:"Save API Keys"})]})})]}),(0,V.jsxs)(F.A,{sx:{display:"flex",flexDirection:"column",gap:3},children:["        ",(0,V.jsxs)(F.A,{sx:{mb:3,display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,V.jsx)(u(),{href:"/visualization",passHref:!0,style:{textDecoration:"none"},children:(0,V.jsx)(E.A,{variant:"contained",color:"primary",size:"medium",endIcon:(0,V.jsx)(F.A,{component:"span",sx:{fontSize:"1.2rem",ml:.5},children:"→"}),sx:{borderRadius:2,boxShadow:2,"&:hover":{transform:"translateY(-2px)",boxShadow:3,transition:"all 0.2s ease-in-out"}},children:"View Data Visualizations"})}),ea&&(0,V.jsx)(E.A,{variant:"outlined",size:"small",onClick:function(){ec(!0)},sx:{ml:2},children:"Change API Keys"})]}),(0,V.jsxs)(P.A,{variant:"outlined",sx:{mb:3},children:[(0,V.jsx)(O.A,{title:(0,V.jsx)(C.A,{variant:"h5",children:"Process Content"}),subheader:(0,V.jsx)(C.A,{color:"text.secondary",children:"Use AI models to process text, images, audio, and video"})}),(0,V.jsx)(S.A,{children:(0,V.jsxs)(F.A,{sx:{display:"flex",flexDirection:"column",gap:2},children:[(0,V.jsxs)(F.A,{children:[(0,V.jsx)(C.A,{variant:"subtitle2",sx:{mb:1},children:"Text Input"}),(0,V.jsxs)(F.A,{sx:{display:"flex",gap:2,alignItems:"center"},children:[(0,V.jsx)(D.A,{id:"text-input",fullWidth:!0,size:"small",value:x,onChange:function(e){return y(e.target.value)},placeholder:"Enter text to process",variant:"outlined"}),(0,V.jsx)(E.A,{variant:"contained",onClick:eu,disabled:G,startIcon:(0,V.jsx)(B.A,{}),children:"Process Text"})]})]}),(0,V.jsxs)(F.A,{children:[(0,V.jsx)(C.A,{variant:"subtitle2",sx:{mb:1},children:"Or Upload Text Files"}),(0,V.jsx)(E.A,{variant:"outlined",component:"span",disabled:G,startIcon:(0,V.jsx)(_.A,{}),onClick:function(){var e=document.createElement("input");e.type="file",e.accept=".txt,.pdf,.epub",e.onchange=el,e.click()},children:"Upload Text File (.txt, .pdf, .epub)"})]}),"              ",(0,V.jsx)(U.A,{sx:{my:1}}),(0,V.jsxs)(F.A,{sx:{display:"flex",flexWrap:"wrap",gap:1},children:[(0,V.jsx)(E.A,{onClick:ex,variant:"outlined",disabled:G,startIcon:(0,V.jsx)(N.A,{}),sx:{mr:1,mb:1},children:"Process Image"}),(0,V.jsx)(E.A,{onClick:em,variant:"outlined",disabled:G,startIcon:(0,V.jsx)(R.A,{}),sx:{mr:1,mb:1},children:"Process Audio"}),(0,V.jsx)(E.A,{onClick:ef,variant:"outlined",disabled:G,startIcon:(0,V.jsx)(W.A,{}),sx:{mr:1,mb:1},children:"Process Video"}),(0,V.jsx)(E.A,{onClick:eh,variant:"contained",color:"secondary",disabled:G||0===j.length,sx:{mr:1,mb:1},children:"Export to CSV"}),(0,V.jsx)(E.A,{onClick:eg,variant:"contained",color:"error",disabled:G||0===j.length,sx:{mb:1},children:"Clear Data"})]})]})})]}),"        ",Y&&(0,V.jsx)(Alert,{severity:"error",sx:{mb:3},children:Y}),w&&(0,V.jsx)(P.A,{sx:{mb:3},children:(0,V.jsxs)(S.A,{sx:{pt:3},children:[(0,V.jsx)(C.A,{variant:"h6",sx:{mb:1},children:"Processing Result:"}),(0,V.jsx)(C.A,{variant:"body1",children:w}),G&&(0,V.jsx)(C.A,{variant:"body2",color:"text.secondary",sx:{mt:2},children:"Processing..."})]})}),"        ",j.length>0&&(0,V.jsxs)(P.A,{children:[(0,V.jsx)(O.A,{title:(0,V.jsx)(C.A,{variant:"h6",children:"Processed Data"}),subheader:(0,V.jsxs)(C.A,{variant:"body2",color:"text.secondary",children:["Results from AI processing (",j.length," items)"]})}),"            ",(0,V.jsxs)(S.A,{children:[(0,V.jsx)(T.Ay,{container:!0,spacing:2,children:j.slice(0,10).map(function(e,t){return(0,V.jsx)(T.Ay,{item:!0,xs:12,md:6,children:(0,V.jsx)(P.A,{sx:{overflow:"hidden"},children:(0,V.jsxs)(S.A,{sx:{p:0},children:["image"===e.type&&e.data&&(0,V.jsx)(F.A,{sx:{height:"10rem",bgcolor:"action.hover",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,V.jsx)(F.A,{component:"img",src:e.data,alt:"Processed",sx:{maxHeight:"100%",objectFit:"contain"}})}),"audio"===e.type&&e.data&&(0,V.jsx)(F.A,{sx:{p:2},children:(0,V.jsx)(F.A,{component:"audio",controls:!0,src:e.data,sx:{width:"100%"}})}),"video"===e.type&&e.data&&(0,V.jsx)(F.A,{sx:{p:2},children:(0,V.jsx)(F.A,{component:"video",controls:!0,src:e.data,sx:{width:"100%",height:"10rem",objectFit:"contain"}})}),(0,V.jsxs)(F.A,{sx:{p:2},children:[(0,V.jsxs)(F.A,{sx:{display:"flex",alignItems:"center",gap:1,mb:1},children:[(0,V.jsx)(F.A,{sx:{width:"0.75rem",height:"0.75rem",borderRadius:"50%",bgcolor:function(e){switch(e){case"text":return"primary.main";case"image":return"success.main";case"audio":return"warning.main";case"video":return"secondary.main";default:return"grey.500"}}(e.type)}}),(0,V.jsx)(C.A,{variant:"body2",fontWeight:"medium",children:e.type.toUpperCase()}),(0,V.jsx)(C.A,{variant:"caption",color:"text.secondary",sx:{ml:"auto"},children:new Date(e.timestamp).toLocaleString()})]}),("text"===e.type||e.processingResult)&&(0,V.jsx)(C.A,{variant:"body2",sx:{overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"},children:"text"===e.type?K(e.content||"",150):K(e.processingResult||"",150)})]})]})})},t)})}),j.length>10&&(0,V.jsx)(F.A,{sx:{mt:3,textAlign:"center"},children:(0,V.jsx)(u(),{href:"/visualization",style:{textDecoration:"none"},children:(0,V.jsxs)(C.A,{color:"primary",sx:{"&:hover":{textDecoration:"underline"},cursor:"pointer"},children:["View all ",j.length," items in visualizations →"]})})})]})]}),"      "]})]})}}},e=>{var t=t=>e(e.s=t);e.O(0,[233,275,83,636,593,792],()=>t(2936)),_N_E=e.O()}]);