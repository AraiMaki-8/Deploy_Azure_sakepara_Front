const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// ログ出力を追加
console.log('Server starting...');
console.log('Current directory:', __dirname);
console.log('Files in public directory:');
try {
  const fs = require('fs');
  const files = fs.readdirSync(path.join(__dirname, 'public'));
  console.log(files);
} catch (error) {
  console.error('Error reading public directory:', error.message);
}

// 静的ファイルを提供
app.use(express.static(path.join(__dirname, 'public')));

// すべてのリクエストをindex.htmlにルーティング
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 