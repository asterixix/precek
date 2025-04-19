# Precek

Precek is a cross-platform application that processes text, image, audio, and video files using AI models to create interactive visualizations, summaries, trends, and contextual analyses. The app leverages OpenRouter's AI models  or OpenAI Platform for processing different types of media and builds a temporary database for data visualization.

## Core Functionality

- **AI-Powered Media Processing:** Process images, audio, video, and text files using OpenRouter's AI models or OpenAI Platform
- **Database Management:** Build temporary database for data visualization
- **CSV Export:** Download database as a .csv file for external analysis and processing
- **Data Visualization:** Generate summaries, trends, contexts, and word clouds for comprehensive data analysis
- **Cross-Platform Support:** Run as a web application or native mobile application

## Tech Stack

- **Frontend Framework:** [Next.js](https://nextjs.org/) (v15.2.5), [React](https://reactjs.org/) (v19.1.0), [React Native](https://reactnative.dev/) (v0.79.0)
- **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/) (v4.1.3), [MUI](https://mui.com/) (v5.15.12), [NativeWind](https://www.nativewind.dev/) (v4.1.23)
- **Visualization Libraries:** [D3](https://d3js.org/) (v7.9.0), [React Force Graph](https://github.com/vasturiano/react-force-graph) (v1.47.6), [React WordCloud](https://www.npmjs.com/package/react-wordcloud) (v1.2.7)
- **Document Processing:** [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist) (v5.1.91), [epub.js](https://github.com/futurepress/epub.js/) (v0.2.8)
- **Data Storage:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (browser-based database)
- **AI Integration:** [OpenRouter API](https://openrouter.ai/docs/quickstart) (connection to free AI models) or [ApenAI API](https://platform.openai.com/docs)

## Project Structure

```
precek/
├── pages/               # Next.js pages
├── src/
│   ├── components/      # React components
│   ├── lib/             # Utility functions and providers
│   ├── services/        # Services for API and data handling
│   └── styles/          # Global styles
```

## Known Issues (as of April 10, 2025)

- **Image Processing Errors:** Issues when processing certain image formats and sizes
- **Video Processing Errors:** Stability problems with video file processing
- **Document Upload Issues:** Errors when uploading PDF and EPUB files
- **Visualization Improvements Needed:** Some data visualizations are not appropriate for certain data types

## Getting Started

### Prerequisites

- Node.js 18 or higher

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/precek.git
   cd precek
   ```

2. Install dependencies
   ```bash
   npm install
   ```

### Running the App

```bash
npm run dev
```

Access the application at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run web
```
