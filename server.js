const express = require('express');
const path = require('path');
const fs = require('fs');
const { parse } = require('url');

// Next.jsの起動を試みる
let next;
let nextApp;
let handle;
try {
  next = require('next');
  const dev = process.env.NODE_ENV !== 'production';
  nextApp = next({ dev });
  handle = nextApp.getRequestHandler();
  console.log('Next.jsモジュールが正常に読み込まれました');
} catch (error) {
  console.error('Next.jsモジュールの読み込みに失敗しました:', error.message);
}

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

// .nextディレクトリが存在するか確認
const hasNextDir = fs.existsSync(path.join(__dirname, '.next'));
console.log('.nextディレクトリの存在確認:', hasNextDir);

// APIエンドポイントのプロキシ設定
const API_BASE_URL = process.env.API_BASE_URL || 'https://tech0-gen-8-step4-sakepara-backend-a9e9e5gedfevbtfa.australiasoutheast-01.azurewebsites.net';
console.log('API ベースURL:', API_BASE_URL);

// .nextディレクトリが存在する場合のみ設定
if (hasNextDir) {
  console.log('.nextディレクトリが存在します - Next.js静的ファイルを提供します');
  server.use('/_next', express.static(path.join(__dirname, '.next')));
  if (fs.existsSync(path.join(__dirname, '.next/static'))) {
    console.log('.next/staticディレクトリが存在します');
    server.use('/_next/static', express.static(path.join(__dirname, '.next/static')));
  }
}

// デバッグページへのアクセス設定
server.get('/debug.html', (req, res) => {
  if (fs.existsSync(path.join(__dirname, 'public', 'debug.html'))) {
    res.sendFile(path.join(__dirname, 'public', 'debug.html'));
  } else {
    res.status(404).send('Debug page not found');
  }
});

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
      nextJsAvailable: !!nextApp,
      directories: {
        next: hasNextDir,
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

// Next.jsが利用可能な場合はNext.jsでリクエストを処理し、
// そうでない場合はデバッグページにフォールバック
if (nextApp && handle) {
  // Next.jsの準備
  nextApp.prepare().then(() => {
    console.log('Next.jsの準備が完了しました - アプリケーションを起動します');
    
    // 他のすべてのリクエストはNext.jsに渡す
    server.all('*', (req, res) => {
      const parsedUrl = parse(req.url, true);
      return handle(req, res, parsedUrl);
    });
    
    startServer();
  }).catch(err => {
    console.error('Next.js準備中にエラーが発生しました:', err);
    setupFallbackServer();
  });
} else {
  console.log('Next.jsは利用できません - フォールバックサーバーを設定します');
  setupFallbackServer();
}

// フォールバックサーバーの設定
function setupFallbackServer() {
  // デバッグページを返すデフォルトのルート
  server.get('*', (req, res) => {
    try {
      // フォールバックHTMLを生成
      res.send(`
        <html>
          <head>
            <title>サーバーステータス</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
              .container { max-width: 800px; margin: 0 auto; }
              .card { background: #f9f9f9; border-radius: 5px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .btn { display: inline-block; background: #4CAF50; color: white; text-decoration: none; padding: 8px 16px; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Next.jsアプリケーションを読み込めませんでした</h1>
              
              <div class="card">
                <h2>サーバー情報</h2>
                <p>現在の時刻: ${new Date().toISOString()}</p>
                <p>作業ディレクトリ: ${process.cwd()}</p>
                <p>Next.jsディレクトリの存在: ${hasNextDir ? 'はい' : 'いいえ'}</p>
              </div>
              
              <div class="card">
                <h2>トラブルシューティング</h2>
                <p>詳細な情報を確認するには以下のリンクをクリックしてください：</p>
                <p><a href="/debug" class="btn">デバッグ情報を表示</a></p>
                <p><a href="/debug.html" class="btn">デバッグページを表示</a></p>
              </div>
            </div>
          </body>
        </html>
      `);
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
  
  startServer();
}

// サーバー起動
function startServer() {
  server.listen(port, (err) => {
    if (err) {
      console.error('サーバー起動エラー:', err);
      return;
    }
    console.log(`サーバーが起動しました: http://localhost:${port}`);
  });
} 