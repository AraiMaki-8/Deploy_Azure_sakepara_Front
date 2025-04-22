const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// 簡単なログだけ出力
console.log('Server starting...');
console.log('Current directory:', __dirname);
console.log('PORT:', process.env.PORT);

// 静的ファイルを提供 - publicディレクトリから
app.use(express.static(path.join(__dirname, 'public')));

// すべてのリクエストをindex.htmlにルーティング
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 