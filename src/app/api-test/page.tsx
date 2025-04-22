'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ApiTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tech0-gen-8-step4-sakepara-backend-a9e9e5gedfevbtfa.australiasoutheast-01.azurewebsites.net';

  const testApi = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      setResult({
        endpoint,
        status: response.status,
        data
      });
    } catch (err: any) {
      setError(`APIリクエスト失敗: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Link href="/" className="text-blue-500 hover:underline mb-6 inline-block">
        ← ホームに戻る
      </Link>

      <h1 className="text-3xl font-bold mb-6">APIテストページ</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">バックエンドAPI接続テスト</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <button 
            onClick={() => testApi('/')}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            APIテスト - ルート(/)
          </button>
          
          <button 
            onClick={() => testApi('/users')}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            APIテスト - ユーザー一覧(/users)
          </button>
          
          <button 
            onClick={() => testApi('/redeemable-items')}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            APIテスト - アイテム一覧(/redeemable-items)
          </button>
          
          <button 
            onClick={() => testApi('/test-db-connection')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded"
          >
            APIテスト - DB接続(/test-db-connection)
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="text-center p-4">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-medium mb-2">APIレスポンス：</h3>
          <p className="mb-1"><span className="font-semibold">エンドポイント:</span> {result.endpoint}</p>
          <p className="mb-1"><span className="font-semibold">ステータス:</span> {result.status}</p>
          <div className="mt-2">
            <p className="font-semibold mb-1">データ:</p>
            <pre className="bg-gray-800 text-green-400 p-3 rounded overflow-auto max-h-96">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </main>
  );
} 