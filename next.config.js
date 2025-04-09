/** @type {import('next').NextConfig} */

const nextConfig = {
  // Enable static exports for GitHub Pages
  output: 'export',
  // Set the base path for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/precek' : '',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
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
