// src/services/api.ts

import {
  PointHistoryItem,
  UserData,
  UserBalance,
  ExchangeItem,
  PointType
} from '../types/api';

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

// エラーハンドリング関数
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  throw new Error(error.message || 'APIとの通信に失敗しました');
};

// ユーザー情報を取得
export const fetchUser = async (userId: number): Promise<UserData> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// ユーザーの残高情報を取得
export const fetchUserBalance = async (userId: number): Promise<UserBalance> => {
  try {
    const response = await api.get(`/users/${userId}/balance`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// ポイント履歴を取得
export const fetchPointHistory = async (userId: number, limit: number = 5, filterType: string = 'all'): Promise<PointHistoryItem[]> => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (filterType !== 'all') {
      params.append('filter_type', filterType);
    }
    
    const response = await api.get(`/users/${userId}/point-history`, { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 交換可能なアイテム一覧を取得
export const fetchRedeemableItems = async (): Promise<ExchangeItem[]> => {
  try {
    const response = await api.get('/redeemable-items');
    
    // APIからの応答をフロントエンドの型に変換
    return response.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      cost: item.points_required,
      description: item.description || `${item.name}と交換するために必要なポイント: ${item.points_required}`,
      type: 'normal', // デフォルトタイプ
      imageUrl: item.image_url || null
    }));
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// ポイント交換処理
export const usePoints = async (userId: number, itemId: number, points: number) => {
  try {
    const response = await api.post('/use-points', {
      user_id: userId,
      item_id: itemId,
      points: points
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// ポイントタイプをフロントエンド形式に変換
export const convertToPointTypes = (data: any): PointType[] => {
  const points: PointType[] = [];
  
  // 通常ポイント
  if (data.current_points) {
    points.push({
      type: 'normal',
      name: '通常ポイント',
      amount: data.current_points,
      expires: '2025年12月31日'
    });
  }
  
  // APIが期間限定ポイントをサポートする場合
  if (data.limited_points) {
    points.push({
      type: 'limited',
      name: '期間限定ポイント',
      amount: data.limited_points,
      expires: data.limited_points_expiry || '2024年12月31日'
    });
  }
  
  return points;
};