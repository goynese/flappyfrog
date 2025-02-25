/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // This setting is required if you're deploying to GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/flappyfrog' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 