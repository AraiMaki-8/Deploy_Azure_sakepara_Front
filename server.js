const express = require('express');
const path = require('path');
const fs = require('fs');
const { parse } = require('url');

// 詳細なログ出力
console.log('サーバー初期化中...');
console.log('現在の作業ディレクトリ:', process.cwd());
console.log('環境変数 PORT:', process.env.PORT);
console.log('環境変数 NODE_ENV:', process.env.NODE_ENV);
console.log('ディレクトリ内容:', fs.readdirSync('.').join(', '));

// 絶対パスを設定
const ROOT_DIR = process.cwd();
const NEXT_DIR = path.join(ROOT_DIR, '.next');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SRC_DIR = path.join(ROOT_DIR, 'src');

console.log('ROOT_DIR:', ROOT_DIR);
console.log('NEXT_DIR:', NEXT_DIR);
console.log('PUBLIC_DIR:', PUBLIC_DIR);
console.log('SRC_DIR:', SRC_DIR);

// .nextディレクトリが存在するか確認
const hasNextDir = fs.existsSync(NEXT_DIR);
console.log('.nextディレクトリの存在確認:', hasNextDir);
if (hasNextDir) {
  console.log('.next内のファイル:', fs.readdirSync(NEXT_DIR).join(', '));
}

// Next.jsの起動を試みる
let next;
let nextApp;
let handle;
try {
  next = require('next');
  
  // 環境変数の設定
  const dev = process.env.NODE_ENV !== 'production';
  const dir = ROOT_DIR;
  const conf = {
    dev,
    dir,
    conf: {
      distDir: '.next',
      reactStrictMode: true,
    }
  };

  console.log('Next.js初期化設定:', JSON.stringify(conf, null, 2));
  
  nextApp = next(conf);
  handle = nextApp.getRequestHandler();
  console.log('Next.jsモジュールが正常に読み込まれました');
} catch (error) {
  console.error('Next.jsモジュールの読み込みに失敗しました:', error.message);
  console.error('エラースタック:', error.stack);
}

const port = process.env.PORT || 3000;
const server = express();

// 静的ファイルの提供
console.log('静的ファイルのパスを設定します...');
server.use('/public', express.static(PUBLIC_DIR));

// APIエンドポイントのプロキシ設定
const API_BASE_URL = process.env.API_BASE_URL || 'https://tech0-gen-8-step4-sakepara-backend-a9e9e5gedfevbtfa.australiasoutheast-01.azurewebsites.net';
console.log('API ベースURL:', API_BASE_URL);

// .nextディレクトリが存在する場合のみ設定
if (hasNextDir) {
  console.log('.nextディレクトリが存在します - Next.js静的ファイルを提供します');
  server.use('/_next', express.static(NEXT_DIR));
  
  const staticDir = path.join(NEXT_DIR, 'static');
  if (fs.existsSync(staticDir)) {
    console.log('.next/staticディレクトリが存在します');
    server.use('/_next/static', express.static(staticDir));
  }
}

// デバッグページへのアクセス設定
server.get('/debug.html', (req, res) => {
  const debugFile = path.join(PUBLIC_DIR, 'debug.html');
  if (fs.existsSync(debugFile)) {
    res.sendFile(debugFile);
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
      dirContents.root = fs.readdirSync(ROOT_DIR);
    } catch (e) {
      dirContents.root = `エラー: ${e.message}`;
    }
    
    // publicディレクトリ
    try {
      dirContents.public = fs.existsSync(PUBLIC_DIR) ? fs.readdirSync(PUBLIC_DIR) : 'ディレクトリなし';
    } catch (e) {
      dirContents.public = `エラー: ${e.message}`;
    }
    
    // .nextディレクトリ
    try {
      dirContents.next = fs.existsSync(NEXT_DIR) ? fs.readdirSync(NEXT_DIR) : 'ディレクトリなし';
    } catch (e) {
      dirContents.next = `エラー: ${e.message}`;
    }
    
    // src/appディレクトリ
    try {
      const appDir = path.join(SRC_DIR, 'app');
      dirContents.app = fs.existsSync(appDir) ? fs.readdirSync(appDir) : 'ディレクトリなし';
    } catch (e) {
      dirContents.app = `エラー: ${e.message}`;
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
        public: fs.existsSync(PUBLIC_DIR),
        src: fs.existsSync(SRC_DIR),
      },
      directoryContents: dirContents,
      environmentVariables: {
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV,
        API_BASE_URL: API_BASE_URL
      },
      nextJsError: nextApp ? null : "Next.jsの初期化に失敗しました"
    });
  } catch (error) {
    res.status(500).send({
      error: 'デバッグ情報の取得中にエラーが発生しました',
      message: error.message,
      stack: error.stack
    });
  }
});

// サーバー起動関数
function startServer() {
  server.listen(port, (err) => {
    if (err) {
      console.error('サーバー起動エラー:', err);
      return;
    }
    console.log(`サーバーが起動しました: http://localhost:${port}`);
  });
}

// Next.jsが利用可能な場合はNext.jsでリクエストを処理し、
// そうでない場合はデバッグページにフォールバック
if (nextApp && handle) {
  // Next.jsの準備
  console.log('Next.jsの準備を開始します...');
  nextApp.prepare()
    .then(() => {
      console.log('Next.jsの準備が完了しました - アプリケーションを起動します');
      
      // 他のすべてのリクエストはNext.jsに渡す
      server.all('*', (req, res) => {
        console.log(`リクエスト処理: ${req.url}`);
        const parsedUrl = parse(req.url, true);
        return handle(req, res, parsedUrl);
      });
      
      startServer();
    })
    .catch(err => {
      console.error('Next.js準備中にエラーが発生しました:', err);
      console.error('エラースタック:', err.stack);
      setupFallbackServer();
    });
} else {
  console.log('Next.jsは利用できません - フォールバックサーバーを設定します');
  setupFallbackServer();
}

// フォールバックサーバーの設定
function setupFallbackServer() {
  // サーバーの開始時に.nextディレクトリを作成してみる
  if (!hasNextDir) {
    try {
      fs.mkdirSync(NEXT_DIR, { recursive: true });
      console.log('.nextディレクトリを作成しました');
    } catch (error) {
      console.error('.nextディレクトリの作成に失敗しました:', error.message);
    }
  }
  
  // index.htmlがあれば使用する
  const indexFile = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexFile)) {
    console.log('index.htmlファイルが見つかりました - 静的ファイルとして提供します');
    server.get('/', (req, res) => {
      res.sendFile(indexFile);
    });
  }
  
  // その他のルートへのフォールバック
  server.get('*', (req, res) => {
    try {
      // まずindex.htmlの提供を試みる
      if (fs.existsSync(indexFile) && req.url !== '/') {
        res.sendFile(indexFile);
      } else {
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
  
  startServer();
} 