const express = require('express');
const path = require('path');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();

  // カスタムサーバーの初期化ログ
  console.log('Next.jsカスタムサーバー起動中...');
  console.log('環境:', dev ? '開発' : '本番');
  console.log('ポート:', port);

  // 静的ファイルを提供
  server.use(express.static(path.join(__dirname, '.next/static')));

  // Next.jsにすべてのリクエストを処理させる
  server.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true);
    return handle(req, res, parsedUrl);
  });

  // サーバー起動
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Next.js起動エラー:', err);
  process.exit(1);
}); 