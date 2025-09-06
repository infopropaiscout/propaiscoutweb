/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
  },
  distDir: '.next',
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
};

module.exports = nextConfig;
