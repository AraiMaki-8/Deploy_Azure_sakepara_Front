import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
        <h1 className="text-4xl font-bold mb-8">酒パラ - ポイント管理システム</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">デプロイ成功！</h2>
          <p className="mb-4">Next.jsアプリケーションが正常に動作しています。</p>
          
          <h3 className="text-xl font-medium mb-2">バックエンド接続テスト</h3>
          <div className="flex flex-col space-y-2">
            <Link 
              href="/api-test" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              APIテストページへ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}