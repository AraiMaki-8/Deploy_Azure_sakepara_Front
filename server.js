const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'out')));

// サーバー起動前にビルドを試行
const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Checking if static export exists...');
  if (!fs.existsSync('./out')) {
    console.log('Static export not found. Running build and export...');
    execSync('npm run build-export', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Error during build process:', error);
  console.log('Proceeding with server start anyway...');
}

// すべてのリクエストをindex.htmlにルーティング
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 