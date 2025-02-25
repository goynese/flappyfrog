const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run the build
execSync('next build', { stdio: 'inherit' });

// Check if .next/standalone exists
const nextDir = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextDir)) {
  // Create out directory if it doesn't exist
  const outDir = path.join(__dirname, '..', 'out');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  // Copy the static files
  execSync('cp -R .next/static out/', { stdio: 'inherit' });
  execSync('cp -R public/* out/', { stdio: 'inherit' });
  
  console.log('Export completed successfully!');
} else {
  console.error('Build directory not found');
  process.exit(1);
} 