/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // This setting is required if you're deploying to GitHub Pages
  // Replace 'your-repo-name' with your actual repository name
  basePath: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 