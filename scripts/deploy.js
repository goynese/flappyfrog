const fs = require('fs');
const path = require('path');
const ghpages = require('gh-pages');

// Create .nojekyll file to prevent GitHub Pages from ignoring files that begin with an underscore
fs.writeFileSync('out/.nojekyll', '');

// Copy the .nojekyll file to the root of the out directory
fs.copyFileSync(
  path.join(__dirname, '../.nojekyll'),
  path.join(__dirname, '../out/.nojekyll')
);

// Deploy to GitHub Pages
ghpages.publish(
  'out',
  {
    branch: 'gh-pages',
    dotfiles: true, // Ensure dotfiles like .nojekyll are included
    message: 'Auto-deploy from Next.js build',
  },
  (err) => {
    if (err) {
      console.error('Deployment error:', err);
      return;
    }
    console.log('Deployment complete!');
  }
); 