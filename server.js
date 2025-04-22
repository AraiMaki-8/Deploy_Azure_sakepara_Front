const express = require('express');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || 3000;
const server = express();

// 詳細なログ出力
console.log('サーバー初期化中...');
console.log('現在の作業ディレクトリ:', process.cwd());
console.log('環境変数 PORT:', process.env.PORT);
console.log('環境変数 NODE_ENV:', process.env.NODE_ENV);

try {
  console.log('.nextディレクトリの内容を確認します...');
  const nextPath = path.join(__dirname, '.next');
  if (fs.existsSync(nextPath)) {
    console.log('.nextディレクトリが存在します');
    const items = fs.readdirSync(nextPath);
    console.log('.nextディレクトリの内容:', items);
  } else {
    console.log('.nextディレクトリが見つかりません！');
  }
} catch (error) {
  console.error('.nextディレクトリ確認中にエラーが発生しました:', error);
}

// 静的ファイルの提供
server.use('/public', express.static(path.join(__dirname, 'public')));
server.use('/_next', express.static(path.join(__dirname, '.next')));
server.use('/_next/static', express.static(path.join(__dirname, '.next/static')));

// デバッグ用エンドポイント
server.get('/debug', (req, res) => {
  res.send({
    message: 'デバッグエンドポイントが正常に動作しています',
    environment: process.env.NODE_ENV,
    workingDirectory: process.cwd(),
    directories: {
      next: fs.existsSync(path.join(__dirname, '.next')),
      public: fs.existsSync(path.join(__dirname, 'public')),
    }
  });
});

// すべてのリクエストに対するデフォルトの処理
server.get('*', (req, res) => {
  // デバッグページを返す
  res.sendFile(path.join(__dirname, 'public', 'debug-index.html'));
});

// サーバー起動
server.listen(port, (err) => {
  if (err) {
    console.error('サーバー起動エラー:', err);
    return;
  }
  console.log(`サーバーが起動しました: http://localhost:${port}`);
}); 