// src/types/api.ts

// ユーザーデータの型
export interface UserData {
  id: number;
  name: string;
  company_name: string;
}

// ユーザーの残高データの型
export interface UserBalance {
  user_id: number;
  current_points: number;
  expiring_points: number;
}

// ポイント履歴アイテムの型
export interface PointHistoryItem {
  id: number;
  date: string;
  description: string;
  points: number;
  remarks?: string;
}

// 交換可能アイテムの型
export interface ExchangeItem {
  id: number;
  name: string;
  cost: number;
  description?: string;
  type: 'normal' | 'limited' | 'special';
  imageUrl?: string | null;
}

// ポイントタイプの基本型
export interface BasePointType {
  type: "normal" | "limited";
  amount: number;
}

// 通常ポイントの型
export interface PointType extends BasePointType {
  name: string;
  expires: string;
}

// 期限切れ予定ポイントの型
export interface ExpiringPointType extends BasePointType {
  date: string;
}

// 付与予定ポイントの型
export interface UpcomingPointType extends BasePointType {
  date: string;
}

// APIエラーレスポンスの型
export interface ApiError {
  detail: string;
}

// ポイント交換の成功レスポンスの型
export interface ExchangeResponse {
  success: boolean;
  message: string;
  remaining_points: number;
}

// 既存の types/api.ts に追加

// HistoryListコンポーネントで使用される型
export interface HistoryItem {
  id: number;
  type: 'gain' | 'use';
  title: string;
  date: string;
  points: number;
  remarks?: string;
}

// PointHistoryItem型からHistoryItem型への変換関数
export function convertToHistoryItem(item: PointHistoryItem): HistoryItem {
  return {
    id: item.id,
    type: item.points > 0 ? 'gain' : 'use',
    title: item.description,
    date: new Date(item.date).toLocaleDateString(),
    points: item.points,
    remarks: item.remarks
  };
}