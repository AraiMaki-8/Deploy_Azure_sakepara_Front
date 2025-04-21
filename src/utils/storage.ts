// utils/storage.ts

import Cookies from 'js-cookie';

// ユーザーIDをローカルストレージとCookieの両方に保存
export const saveUserId = (userId: string) => {
  if (typeof window !== 'undefined') {
    // ローカルストレージに保存
    localStorage.setItem('userId', userId);
    // Cookieにも保存（HTTPOnly: falseで設定）
    Cookies.set('userId', userId, { path: '/' });
  }
};

// ユーザーIDをローカルストレージとCookieから削除
export const removeUserId = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userId');
    Cookies.remove('userId', { path: '/' });
  }
};

// ユーザーIDを取得（優先順位: ローカルストレージ > Cookie）
export const getUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId') || Cookies.get('userId') || null;
  }
  return null;
};