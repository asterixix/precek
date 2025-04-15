/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure basePath for GitHub Pages deployment
  basePath: process.env.NODE_ENV === 'production' ? '/precek' : '',
  // Configure assetPrefix if needed for CSS/JS files on GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '/precek/' : '',

  // Add output export configuration
  output: 'export',

  // Make environment variables available to the server-side build/runtime
  // AND client-side if prefixed with NEXT_PUBLIC_
  env: {
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    // Expose OpenRouter key to the client-side bundle
    NEXT_PUBLIC_OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    // GOOGLE_FACT_CHECK_API_KEY: process.env.GOOGLE_FACT_CHECK_API_KEY, // Remove Google key - not provided via env
  },

  // Optional: If you need the Google key client-side (not recommended for security)
  // Remove this section as well if it exists
  // publicRuntimeConfig: {
  //   NEXT_PUBLIC_GOOGLE_FACT_CHECK_API_KEY: process.env.GOOGLE_FACT_CHECK_API_KEY,
  // },
  // Note: The key is now handled purely client-side via localStorage.

  // If using `next export`, ensure trailingSlash is handled correctly if needed
  // trailingSlash: true, // Usually needed for static exports on GH Pages without custom domain
  // Note: trailingSlash might still be needed with output: 'export' depending on server config

  // Add webpack config if needed for specific loaders or fallbacks
  webpack: (config, { isServer }) => {
    // Add fallback for 'fs' module on the client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback, // Spread existing fallbacks
        fs: false, // Tell webpack to ignore fs module on client-side
        'webworker-threads': false, // Tell webpack to ignore webworker-threads on client-side
      };
    }
    return config;
  },
};

module.exports = nextConfig;
