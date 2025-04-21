'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import TrainerInfo from '../components/TrainerInfo';
import EventBanner from '../components/EventBanner';
import PointsCard from '../components/PointsCard';
import HistoryList from '../components/HistoryList';
import BottomNav from '../components/BottomNav';
import UsePointsModal from '../components/modals/UsePointsModal';
import HistoryModal from '../components/modals/HistoryModal';
import { useUserData, useBalanceData, usePointHistory, useRedeemableItems } from '../hooks/useApiData';

export default function Home() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // ユーザーIDチェック - 現在のシンプルなバージョンから保持
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [router]);
  
  // APIからデータを取得
  const { userData } = useUserData();
  const { 
    balanceData, 
    updateBalance, 
    getPoints, 
    getExpiringPoints, 
    getUpcomingPoints, 
    getTotalPoints 
  } = useBalanceData();
  const { historyData } = usePointHistory(5);
  const { items } = useRedeemableItems();
  
  const openModal = (modalType: string) => {
    setActiveModal(modalType);
  };
  
  const closeModal = () => {
    setActiveModal(null);
  };
  
  // ポイント交換後の成功処理
  const handleExchangeSuccess = (newBalance: number) => {
    // ユーザー残高の更新
    if (balanceData) {
      updateBalance({
        ...balanceData,
        current_points: newBalance
      });
    }
    closeModal();
  };

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('userId');
    router.push('/login');
  };
  
  if (isLoading) {
    return <div className="container flex items-center justify-center min-h-screen">読み込み中...</div>;
  }
  
  return (
    <div className="container">
      <Header 
        title="ポイントマスター" 
        onLogout={handleLogout}
      />
      
      <main>
        <TrainerInfo 
          name={userData?.name || "トレーナー"} 
          level={25} 
          progress={75} 
        />
        
        <EventBanner 
          title="ダブルポイントイベント!"
          description="期間中、獲得ポイントが2倍になります！"
          timeRemaining="残り時間: 2日 5時間 30分"
          icon="🎉"
        />
        
        <PointsCard 
          points={getPoints()}
          upcoming={getUpcomingPoints()}
          expiring={getExpiringPoints()}
          onUsePoints={() => openModal('use')}
          onViewHistory={() => openModal('history')}
        />
        
        <HistoryList history={historyData} />
      </main>
      
      <BottomNav active="points" />
      
      {activeModal === 'use' && (
        <UsePointsModal
          title="ポイントを使う"
          points={getPoints()}
          items={items}
          totalPoints={getTotalPoints()}
          company={userData?.company_name || "会社名"}
          userName={userData?.name || "ユーザー名"}
          onClose={closeModal}
          onExchange={(item) => {
            // APIを使ったポイント交換処理
            handleExchangeSuccess(getTotalPoints() - item.cost);
          }}
        />
      )}
      
      <HistoryList history={historyData as any} />

{activeModal === 'history' && (
  <HistoryModal
    title="ポイント履歴"
    history={historyData as any}
    onClose={closeModal}
  />
)}
    </div>
  );
}