'use client'

import { useState } from 'react';
import { PointHistoryItem } from '../../types/api';
import { usePointHistory } from '../../hooks/useApiData';

interface HistoryModalProps {
  title: string;
  history: PointHistoryItem[];
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  title,
  history: initialHistory,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // APIを使用した履歴取得（タブ切り替え時に再取得）
  const { historyData, filterType, setFilterType, loading } = usePointHistory(
    20, // より多くの履歴を取得
    activeTab === 'all' ? 'all' : activeTab === 'gained' ? 'earned' : 'used'
  );
  
  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // タブ切り替え処理
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // APIフィルター設定
    const apiFilter = tab === 'all' ? 'all' : tab === 'gained' ? 'earned' : 'used';
    setFilterType(apiFilter);
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            すべて
          </button>
          <button 
            className={`filter-tab ${activeTab === 'gained' ? 'active' : ''}`}
            onClick={() => handleTabChange('gained')}
          >
            獲得
          </button>
          <button 
            className={`filter-tab ${activeTab === 'used' ? 'active' : ''}`}
            onClick={() => handleTabChange('used')}
          >
            使用
          </button>
        </div>
        
        <div className="modal-content">
          {loading ? (
            <div className="loading">データを読み込み中...</div>
          ) : historyData.length === 0 ? (
            <div className="history-empty">履歴がありません</div>
          ) : (
            <ul className="history-list">
              {historyData.map((item) => (
                <li key={item.id} className="history-item">
                  <div className={`history-icon ${item.type === 'use' ? 'history-minus' : ''}`}>
                    {item.type === 'gain' ? '+' : '-'}
                  </div>
                  <div className="history-details">
                    <div className="history-title">{item.title}</div>
                    <div className="history-date">{formatDate(item.date)}</div>
                    {item.remarks && <div className="history-remarks">{item.remarks}</div>}
                  </div>
                  <div className={`history-points ${item.type === 'gain' ? 'points-plus' : 'points-minus'}`}>
                    {item.type === 'gain' ? `+${item.points}` : `-${item.points}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="modal-actions">
          <button className="action-button" onClick={onClose}>
            戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;