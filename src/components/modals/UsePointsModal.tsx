'use client'

import { useState } from 'react';
import { ExchangeItem } from '../../types/api';
import { useExchangePoints } from '../../hooks/useApiData';

interface PointItem {
  type: string;
  name: string;
  amount: number;
  expires: string;
}

interface UsePointsModalProps {
  title: string;
  points: PointItem[];
  items: ExchangeItem[];
  totalPoints: number;
  company: string;
  userName: string;
  onClose: () => void;
  onExchange: (item: ExchangeItem, newBalance: number) => void;
}

const UsePointsModal: React.FC<UsePointsModalProps> = ({
  title,
  points,
  items,
  totalPoints,
  company,
  userName,
  onClose,
  onExchange
}) => {
  const [selectedItem, setSelectedItem] = useState<ExchangeItem | null>(null);
  const { exchangePoints, exchanging, error, success, setError } = useExchangePoints();

  const handleItemSelect = (item: ExchangeItem) => {
    setError(null);
    setSelectedItem(item);
  };

  const handleExchange = async () => {
    if (!selectedItem) return;
    
    try {
      const result = await exchangePoints(selectedItem.id, selectedItem.cost);
      if (result.success) {
        onExchange(selectedItem, result.remaining_points);
      }
    } catch (err) {
      console.error('交換エラー:', err);
    }
  };

  // アイコンを取得する関数
  const getItemIcon = (item: ExchangeItem) => {
    if (!item || typeof item.name !== 'string') return '商';
    
    try {
      if (item.name.includes('商品')) return '商';
      if (item.name.includes('食事') || item.name.includes('カフェ')) return 'お';
      if (item.name.includes('映画')) return '映';
      if (item.name.includes('ギフト')) return 'ギ';
    } catch (err) {
      console.error('アイコン取得エラー:', err);
    }
    
    return '商';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        
        <div className="modal-content">
          <div className="user-info-section">
            <div className="user-company">{company}</div>
            <div className="user-name">担当者: {userName}</div>
            <div className="available-points">
              現在のポイント: <span className="total-points">{totalPoints} pt</span>
            </div>
          </div>
          
          <div className="points-balance">
            {points.map((point, index) => (
              <div key={index} className="point-item">
                <div className={`point-icon ${point.type === 'limited' ? 'limited' : ''}`}>
                  {point.type === 'normal' ? 'N' : 'L'}
                </div>
                <div className="point-details">
                  <div className="point-name">{point.name}</div>
                  <div className="point-expiry">有効期限: {point.expires}</div>
                </div>
                <div className="point-amount">{point.amount}</div>
              </div>
            ))}
          </div>
          
          <h3 className="section-title">交換可能なアイテム</h3>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">交換が完了しました！</div>}
          
          <div className="exchange-grid">
            {items.map((item) => {
              const isDisabled = item.cost > totalPoints;
              const isSelected = selectedItem?.id === item.id;
              
              return (
                <div 
                  key={item.id} 
                  className={`exchange-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => !isDisabled && handleItemSelect(item)}
                >
                  <div className="item-image-container">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <div className="item-image-placeholder">
                        {getItemIcon(item)}
                      </div>
                    )}
                  </div>
                  <div className="item-details">
                    <div className="item-title">{item.name}</div>
                    <div className="item-cost">{item.cost} pt</div>
                    <button 
                      className="exchange-button"
                      disabled={isDisabled || exchanging}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExchange();
                      }}
                    >
                      {exchanging && selectedItem?.id === item.id ? '交換中...' : '交換する'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="action-button secondary" onClick={onClose}>
            戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsePointsModal;