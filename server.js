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
console.log('ディレクトリ内容:', fs.readdirSync('.'));

// 静的ファイルの提供
console.log('静的ファイルのパスを設定します...');
server.use('/public', express.static(path.join(__dirname, 'public')));

// .nextディレクトリが存在する場合のみ設定
try {
  if (fs.existsSync(path.join(__dirname, '.next'))) {
    console.log('.nextディレクトリが存在します');
    server.use('/_next', express.static(path.join(__dirname, '.next')));
    if (fs.existsSync(path.join(__dirname, '.next/static'))) {
      console.log('.next/staticディレクトリが存在します');
      server.use('/_next/static', express.static(path.join(__dirname, '.next/static')));
    }
  } else {
    console.log('.nextディレクトリが見つかりません');
  }
} catch (error) {
  console.error('.nextディレクトリの確認中にエラーが発生しました:', error);
}

// APIエンドポイントのプロキシ設定
const API_BASE_URL = process.env.API_BASE_URL || 'https://tech0-gen-8-step4-sakepara-backend-a9e9e5gedfevbtfa.australiasoutheast-01.azurewebsites.net';
console.log('API ベースURL:', API_BASE_URL);

// デバッグ用エンドポイント
server.get('/debug', (req, res) => {
  try {
    // ファイルシステムの詳細情報を取得
    const dirContents = {};
    
    // ルートディレクトリ
    try {
      dirContents.root = fs.readdirSync('.');
    } catch (e) {
      dirContents.root = `エラー: ${e.message}`;
    }
    
    // publicディレクトリ
    try {
      dirContents.public = fs.existsSync('./public') ? fs.readdirSync('./public') : 'ディレクトリなし';
    } catch (e) {
      dirContents.public = `エラー: ${e.message}`;
    }
    
    // .nextディレクトリ
    try {
      dirContents.next = fs.existsSync('./.next') ? fs.readdirSync('./.next') : 'ディレクトリなし';
    } catch (e) {
      dirContents.next = `エラー: ${e.message}`;
    }
    
    res.send({
      message: 'デバッグエンドポイントが正常に動作しています',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      workingDirectory: process.cwd(),
      nodeVersion: process.version,
      directories: {
        next: fs.existsSync(path.join(__dirname, '.next')),
        public: fs.existsSync(path.join(__dirname, 'public')),
      },
      directoryContents: dirContents,
      environmentVariables: {
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV,
        API_BASE_URL: API_BASE_URL
      }
    });
  } catch (error) {
    res.status(500).send({
      error: 'デバッグ情報の取得中にエラーが発生しました',
      message: error.message,
      stack: error.stack
    });
  }
});

// すべてのリクエストに対するデフォルトの処理
server.get('*', (req, res) => {
  try {
    // デバッグページを返す
    if (fs.existsSync(path.join(__dirname, 'public', 'debug-index.html'))) {
      res.sendFile(path.join(__dirname, 'public', 'debug-index.html'));
    } else {
      res.send(`
        <html>
          <head><title>サーバーステータス</title></head>
          <body>
            <h1>サーバーは動作していますが、表示するコンテンツがありません</h1>
            <p>現在の時刻: ${new Date().toISOString()}</p>
            <p>作業ディレクトリ: ${process.cwd()}</p>
            <p><a href="/debug">デバッグ情報を表示</a></p>
          </body>
        </html>
      `);
    }
  } catch (error) {
    res.status(500).send(`
      <html>
        <head><title>エラー</title></head>
        <body>
          <h1>エラーが発生しました</h1>
          <p>${error.message}</p>
          <p><a href="/debug">デバッグ情報を表示</a></p>
        </body>
      </html>
    `);
  }
});

// サーバー起動
server.listen(port, (err) => {
  if (err) {
    console.error('サーバー起動エラー:', err);
    return;
  }
  console.log(`サーバーが起動しました: http://localhost:${port}`);
}); 