// src/hooks/useApiData.ts
import { useState, useEffect, useMemo } from 'react';
import { 
  fetchUser, 
  fetchUserBalance, 
  fetchPointHistory, 
  fetchRedeemableItems, 
  usePoints,
  convertToPointTypes
} from '../services/api';
import { 
  PointHistoryItem, 
  UserData, 
  UserBalance, 
  ExchangeItem, 
  PointType,
  ExpiringPointType,
  UpcomingPointType
} from '../types/api';

// ローカルストレージからユーザーIDを取得する関数
export const getUserIdFromStorage = (): number | null => {
  // クライアント側でのみ実行
  if (typeof window !== 'undefined') {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      return parseInt(storedUserId, 10);
    }
  }
  return null;
};

// ユーザーデータを取得するフック
export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const userId = getUserIdFromStorage();
        if (userId === null) {
          setError('ユーザーIDが見つかりません');
          return;
        }
        const data = await fetchUser(userId);
        setUserData(data);
        setError(null);
      } catch (err) {
        console.error('ユーザーデータの取得エラー:', err);
        setError('ユーザー情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  return { userData, loading, error };
};

// ユーザーの残高データを取得するフック
export const useBalanceData = () => {
  const [balanceData, setBalanceData] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBalanceData = async () => {
      try {
        setLoading(true);
        const userId = getUserIdFromStorage();
        if (userId === null) {
          setError('ユーザーIDが見つかりません');
          return;
        }
        const data = await fetchUserBalance(userId);
        setBalanceData(data);
        setError(null);
      } catch (err) {
        console.error('残高データの取得エラー:', err);
        setError('ポイント残高の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadBalanceData();
  }, []);

  // 残高を更新する関数
  const updateBalance = (newBalance: UserBalance) => {
    setBalanceData(newBalance);
  };

  // ポイントデータを既存コンポーネント用の型に変換する関数
  const getPoints = (): PointType[] => {
    if (!balanceData) return [];
    return [
      { 
        type: "normal" as const,
        name: '通常ポイント', 
        amount: balanceData.current_points, 
        expires: '2025年12月31日' 
      }
    ];
  };

  // 期限切れポイント情報を取得
  const getExpiringPoints = (): ExpiringPointType[] => {
    if (!balanceData) return [];
    return [
      { 
        type: "normal" as const,
        amount: balanceData.expiring_points, 
        date: '2025/04/01' 
      }
    ];
  };

  // 付与予定ポイント情報を取得
  const getUpcomingPoints = (): UpcomingPointType[] => {
    return [
      { 
        type: "normal" as const,
        amount: 200,
        date: '2025/03/20' 
      }
    ];
  };

  // 合計ポイント計算
  const getTotalPoints = (): number => {
    if (!balanceData) return 0;
    return balanceData.current_points;
  };

  return { 
    balanceData, 
    updateBalance, 
    loading, 
    error,
    getPoints,
    getExpiringPoints,
    getUpcomingPoints,
    getTotalPoints
  };
};

// ポイント履歴アイテムの型定義（コンポーネントで使用）
export interface HistoryItem {
  id: number;
  type: 'gain' | 'use';
  title: string;
  date: string;
  points: number;
  remarks?: string;
}

// ポイント履歴を取得するフック（HistoryItem型に変換）
export const usePointHistory = (limit: number = 5, initialFilterType: string = 'all') => {
  const [historyData, setHistoryData] = useState<PointHistoryItem[]>([]);
  const [filterType, setFilterType] = useState<string>(initialFilterType);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistoryData = async () => {
      try {
        setLoading(true);
        const userId = getUserIdFromStorage();
        if (userId === null) {
          setError('ユーザーIDが見つかりません');
          return;
        }
        const data = await fetchPointHistory(userId, limit, filterType);
        setHistoryData(data);
        setError(null);
      } catch (err) {
        console.error('履歴データの取得エラー:', err);
        setError('ポイント履歴の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadHistoryData();
  }, [limit, filterType]);

  // APIからのデータをHistoryItem形式に変換
  const formattedHistory = useMemo(() => {
    return historyData.map((item: PointHistoryItem): HistoryItem => {
      // 日付処理を安全に行う
      let formattedDate = '';
      
      try {
        // item.dateが存在する場合のみ処理
        if (item.date) {
          // 文字列の場合はDateに変換
          if (typeof item.date === 'string') {
            const date = new Date(item.date);
            formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD形式
          }
          // Dateオブジェクトの場合は直接フォーマット
          else if (Object.prototype.toString.call(item.date) === '[object Date]') {
            formattedDate = (item.date as Date).toISOString().split('T')[0];
          }
          // その他の場合は文字列に変換
          else {
            formattedDate = String(item.date);
          }
        } else {
          formattedDate = '日付不明';
        }
      } catch (error) {
        console.error('日付フォーマットエラー:', error);
        formattedDate = '日付エラー';
      }
      
      return {
        id: item.id,
        type: item.points > 0 ? 'gain' : 'use',
        title: item.description,
        date: formattedDate,
        points: Math.abs(item.points),
        remarks: item.remarks
      };
    });
  }, [historyData]);

  return { 
    historyData: formattedHistory, // 変換したデータを返す
    originalData: historyData, // 元のデータも保持
    filterType, 
    setFilterType, 
    loading, 
    error 
  };
};

// 交換可能アイテムを取得するフック
export const useRedeemableItems = () => {
  const [items, setItems] = useState<ExchangeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const data = await fetchRedeemableItems();
        setItems(data);
        setError(null);
      } catch (err) {
        console.error('アイテムデータの取得エラー:', err);
        setError('交換可能アイテムの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  return { items, loading, error };
};

// ポイント交換を行うフック
export const useExchangePoints = (onSuccess?: (remaining: number) => void) => {
  const [exchanging, setExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const exchangePoints = async (itemId: number, points: number) => {
    setExchanging(true);
    setError(null);
    setSuccess(false);

    try {
      // ストレージからユーザーIDを取得
      const userId = getUserIdFromStorage();
      if (userId === null) {
        setError('ユーザーIDが見つかりません');
        return { success: false, message: 'ユーザーIDが見つかりません', remaining_points: 0 };
      }
      const result = await usePoints(userId, itemId, points);
      
      if (result.success) {
        setSuccess(true);
        if (onSuccess) {
          onSuccess(result.remaining_points);
        }
      } else {
        setError('ポイント交換に失敗しました');
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || 'ポイント交換に失敗しました');
      throw err;
    } finally {
      setExchanging(false);
    }
  };

  return { exchangePoints, exchanging, error, success, setError, setSuccess };
};