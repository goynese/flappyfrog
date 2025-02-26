/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // This setting is required if you're deploying to GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/flappyfrog' : '',
  // Add this to ensure assets are correctly referenced
  assetPrefix: process.env.NODE_ENV === 'production' ? '/flappyfrog' : '',
  // Disable image optimization since GitHub Pages doesn't support it
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes are handled correctly
  trailingSlash: true,
  // Add this to ensure all static files are copied to the out directory
  distDir: '.next',
}

module.exports = nextConfig 