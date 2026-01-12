import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Coins, Loader2, RefreshCw } from 'lucide-react';

interface GameBalanceModalProps {
   isOpen: boolean;
   onClose: () => void;
   userId: string;
   gameId: string;
   gameTitle: string;
   onBalanceChange?: () => void;
}

interface BalanceData {
   platform: number;
   game: number;
   totalDeposited: number;
   totalConsumed: number;
   totalWithdrawn: number;
}

const GameBalanceModal: React.FC<GameBalanceModalProps> = ({
   isOpen,
   onClose,
   userId,
   gameId,
   gameTitle,
   onBalanceChange
}) => {
   const [balance, setBalance] = useState<BalanceData>({
      platform: 0,
      game: 0,
      totalDeposited: 0,
      totalConsumed: 0,
      totalWithdrawn: 0
   });
   const [amount, setAmount] = useState<string>('');
   const [isLoading, setIsLoading] = useState(false);
   const [isFetching, setIsFetching] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);

   useEffect(() => {
      if (isOpen && userId && gameId) {
         fetchBalances();
      }
   }, [isOpen, userId, gameId]);

   const fetchBalances = async () => {
      setIsFetching(true);
      setError(null);

      try {
         // Fetch platform balance
         const platformRes = await fetch(`/api/wallet/balance/${userId}`);
         const platformData = await platformRes.json();

         // Fetch game balance
         const gameRes = await fetch(`/api/game-balance/${userId}/${gameId}`);
         const gameData = await gameRes.json();

         setBalance({
            platform: platformData.gold_balance || 0,
            game: gameData.balance || 0,
            totalDeposited: gameData.total_deposited || 0,
            totalConsumed: gameData.total_consumed || 0,
            totalWithdrawn: gameData.total_withdrawn || 0
         });
      } catch (err) {
         setError('無法載入餘額資訊');
      } finally {
         setIsFetching(false);
      }
   };

   const handleDeposit = async () => {
      const amountNum = parseInt(amount);
      if (!amountNum || amountNum <= 0) {
         setError('請輸入有效金額');
         return;
      }

      if (amountNum > balance.platform) {
         setError('平台 G 幣餘額不足');
         return;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
         const res = await fetch('/api/game-balance/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, gameId, amount: amountNum })
         });

         const data = await res.json();

         if (data.success) {
            setSuccess(`成功轉入 ${amountNum} G 幣到遊戲！`);
            setBalance(prev => ({
               ...prev,
               platform: data.platform_balance,
               game: data.game_balance,
               totalDeposited: prev.totalDeposited + amountNum
            }));
            setAmount('');
            onBalanceChange?.();
         } else {
            setError(data.error || '轉入失敗');
         }
      } catch (err) {
         setError('網路錯誤，請重試');
      } finally {
         setIsLoading(false);
      }
   };

   const handleWithdraw = async () => {
      const amountNum = parseInt(amount);
      if (!amountNum || amountNum <= 0) {
         setError('請輸入有效金額');
         return;
      }

      if (amountNum > balance.game) {
         setError('遊戲點數餘額不足');
         return;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
         const res = await fetch('/api/game-balance/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, gameId, amount: amountNum })
         });

         const data = await res.json();

         if (data.success) {
            setSuccess(`成功提出 ${amountNum} 點數回平台！`);
            setBalance(prev => ({
               ...prev,
               platform: data.platform_balance,
               game: data.game_balance,
               totalWithdrawn: prev.totalWithdrawn + amountNum
            }));
            setAmount('');
            onBalanceChange?.();
         } else {
            setError(data.error || '提出失敗');
         }
      } catch (err) {
         setError('網路錯誤，請重試');
      } finally {
         setIsLoading(false);
      }
   };

   const quickAmounts = [100, 500, 1000, 5000];

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
         {/* Backdrop */}
         <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

         {/* Modal */}
         <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md animate-fade-in">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
               <div>
                  <h2 className="text-lg font-bold text-white">遊戲點數管理</h2>
                  <p className="text-sm text-slate-400">{gameTitle}</p>
               </div>
               <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
               >
                  <X className="h-5 w-5" />
               </button>
            </div>

            {/* Balance Display */}
            <div className="p-4 space-y-4">
               {isFetching ? (
                  <div className="flex justify-center py-8">
                     <Loader2 className="h-8 w-8 animate-spin text-nexus-accent" />
                  </div>
               ) : (
                  <>
                     {/* Balance Cards */}
                     <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                           <p className="text-xs text-slate-500 mb-1">平台 G 幣</p>
                           <p className="text-2xl font-bold text-yellow-500">{balance.platform.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-nexus-accent/50">
                           <p className="text-xs text-slate-500 mb-1">遊戲點數</p>
                           <p className="text-2xl font-bold text-nexus-accent">{balance.game.toLocaleString()}</p>
                        </div>
                     </div>

                     {/* Hint when game balance is 0 */}
                     {balance.game === 0 && balance.platform > 0 && (
                        <div className="bg-nexus-accent/10 border border-nexus-accent/30 rounded-xl p-3 text-sm">
                           <p className="text-nexus-accent font-medium">💡 開始遊戲前請先轉入點數</p>
                           <p className="text-slate-400 mt-1">在下方輸入金額，點擊「轉入遊戲」將平台 G 幣轉換為遊戲點數即可開始遊玩！</p>
                        </div>
                     )}

                     {balance.game === 0 && balance.platform === 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-sm">
                           <p className="text-yellow-400 font-medium">💰 您的 G 幣餘額不足</p>
                           <p className="text-slate-400 mt-1">請先至「錢包」儲值 G 幣，再回來轉入遊戲點數。</p>
                        </div>
                     )}

                     {/* Stats */}
                     <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-900/30 rounded-lg p-2">
                           <p className="text-xs text-slate-500">總轉入</p>
                           <p className="text-sm text-green-400">{balance.totalDeposited.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-900/30 rounded-lg p-2">
                           <p className="text-xs text-slate-500">總消耗</p>
                           <p className="text-sm text-red-400">{balance.totalConsumed.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-900/30 rounded-lg p-2">
                           <p className="text-xs text-slate-500">總提出</p>
                           <p className="text-sm text-blue-400">{balance.totalWithdrawn.toLocaleString()}</p>
                        </div>
                     </div>

                     {/* Amount Input */}
                     <div>
                        <label className="text-sm text-slate-400 mb-2 block">轉點金額</label>
                        <input
                           type="number"
                           value={amount}
                           onChange={(e) => setAmount(e.target.value)}
                           placeholder="輸入金額"
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                        />

                        {/* Quick Amount Buttons */}
                        <div className="flex gap-2 mt-2">
                           {quickAmounts.map(amt => (
                              <button
                                 key={amt}
                                 onClick={() => setAmount(amt.toString())}
                                 className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                              >
                                 {amt}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Error/Success Messages */}
                     {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm">
                           {error}
                        </div>
                     )}
                     {success && (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3 text-green-400 text-sm">
                           {success}
                        </div>
                     )}

                     {/* Action Buttons */}
                     <div className="grid grid-cols-2 gap-3">
                        <button
                           onClick={handleDeposit}
                           disabled={isLoading || !amount}
                           className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors"
                        >
                           {isLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                           ) : (
                              <>
                                 <ArrowRight className="h-5 w-5" />
                                 轉入遊戲
                              </>
                           )}
                        </button>
                        <button
                           onClick={handleWithdraw}
                           disabled={isLoading || !amount}
                           className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors"
                        >
                           {isLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                           ) : (
                              <>
                                 <ArrowLeft className="h-5 w-5" />
                                 提出到平台
                              </>
                           )}
                        </button>
                     </div>

                     {/* Refresh Button */}
                     <button
                        onClick={fetchBalances}
                        disabled={isFetching}
                        className="w-full py-2 text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors"
                     >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        重新整理餘額
                     </button>
                  </>
               )}
            </div>
         </div>
      </div>
   );
};

export default GameBalanceModal;
