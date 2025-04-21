import React from 'react';

interface HeaderProps {
  title: string;
  onLogout?: () => void;  // オプショナルプロパティとして定義
}

const Header: React.FC<HeaderProps> = ({ title, onLogout }) => {
  return (
    <header className="bg-blue-500 p-4 flex justify-between items-center">
      <h1 className="text-white text-xl font-bold">{title}</h1>
      {onLogout && (
        <button 
          onClick={onLogout}
          className="text-white text-sm bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full transition-colors"
        >
          ログアウト
        </button>
      )}
    </header>
  );
};

export default Header;