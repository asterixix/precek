/** @type {import('next').NextConfig} */

const nextConfig = {
  // Use standalone output for optimized deployments
  output: 'standalone',
  // Set the base path for GitHub Pages (only when using export)
  // basePath: process.env.NODE_ENV === 'production' ? '/precek' : '',
  // Image optimization settings
  images: {
    // We can now use image optimization with standalone output
    unoptimized: false,
  },
  // Enable React Native Web
  reactStrictMode: true,
  transpilePackages: [
    'react-native',
    'react-native-web',
    '@expo/vector-icons',
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];
    return config;
  },
};

module.exports = nextConfig;
