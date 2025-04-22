const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { execSync } = require('child_process');
const fs = require('fs');

// Check if .next directory exists and has the required build files
try {
  if (!fs.existsSync('./.next/BUILD_ID')) {
    console.log('Build files not found, running build process...');
    execSync('npm run build', { stdio: 'inherit' });
  }
} catch (error) {
  console.log('Error checking build files, running build process...', error);
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (buildError) {
    console.error('Build process failed:', buildError);
    process.exit(1);
  }
}

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 8080;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}); 