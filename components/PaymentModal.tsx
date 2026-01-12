import * as React from 'react';
import { useState, useEffect } from 'react';
import { X, Lock, CheckCircle, AlertCircle, Coins } from 'lucide-react';
import { Game, User } from '../types';

interface PaymentModalProps {
   game: Game;
   isOpen: boolean;
   onClose: () => void;
   onSuccess: (result: { balance: { gold_balance: number; silver_balance: number }, expiresAt?: string | null }) => void;
   currentUser?: User;
   onOpenWallet?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ game, isOpen, onClose, onSuccess, currentUser, onOpenWallet }) => {
   const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
   const [error, setError] = useState<string | null>(null);

   if (!isOpen || !currentUser) return null;

   const handlePurchase = async () => {
      setStep('processing');
      setError(null);

      // Debug log
      console.log('[PaymentModal] Purchase request:', {
         gameId: game.id,
         userId: currentUser.id,
         tierId: game.selectedTier?.id,
         selectedTier: game.selectedTier
      });

      try {
         const res = await fetch(`/api/games/${game.id}/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               userId: currentUser.id,
               tierId: game.selectedTier?.id
            })
         });

         const data = await res.json();
         console.log('[PaymentModal] Purchase response:', { status: res.status, data });

         if (res.ok && data.success) {
            setStep('success');
            setTimeout(() => {
               onSuccess({ balance: data.newBalance, expiresAt: data.expiresAt });
            }, 1500);
         } else {
            console.error('[PaymentModal] Purchase failed:', data.error);
            setError(data.error || "購買失敗");
            setStep('confirm');
         }
      } catch (err) {
         setError("網路連線錯誤");
         setStep('confirm');
      }
   };

   const purchasePrice = (game as any).paymentPrice ?? game.price;
   const isInsufficient = currentUser.gold_balance < purchasePrice;

   return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
         <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl relative animate-slide-up overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  {step === 'success' ? '購買成功' : '確認購買內容'}
               </h3>
               <button onClick={onClose} className="text-slate-400 hover:text-white" disabled={step === 'processing'}>
                  <X className="h-6 w-6" />
               </button>
            </div>

            {/* Content */}
            <div className="p-6">
               {/* Product Summary */}
               <div className="flex items-center gap-4 mb-6 bg-slate-700/30 p-4 rounded-xl border border-slate-600">
                  <img src={game.thumbnailUrl} alt={game.title} className="w-16 h-16 object-cover rounded-md shadow-md" />
                  <div>
                     <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">購買項目</p>
                     <h4 className="font-bold text-white text-lg">{game.title}</h4>
                     {game.selectedTier && (
                        <div className="text-xs text-nexus-accent font-bold mt-1 bg-nexus-accent/10 px-2 py-1 rounded inline-block">
                           方案: {game.selectedTier.label} ({game.selectedTier.duration_minutes === -1 ? '永久' : `${game.selectedTier.duration_minutes} 分`})
                        </div>
                     )}
                     <div className="flex items-center gap-1 text-nexus-accent font-bold text-xl mt-1">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        <span>{purchasePrice}</span>
                        <span className="text-yellow-400">G</span>
                     </div>
                  </div>
               </div>

               {step === 'processing' ? (
                  <div className="text-center py-8">
                     <div className="animate-spin h-10 w-10 border-4 border-nexus-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                     <p className="text-slate-300">正在處理與區塊鏈的交易...</p>
                  </div>
               ) : step === 'success' ? (
                  <div className="text-center py-8">
                     <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce" />
                     <p className="text-white text-xl font-bold">交易完成！</p>
                     <p className="text-slate-400">您現在可以開始遊玩了。</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     <div className="bg-slate-900 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-400">目前持有金幣</span>
                           <div className="flex items-center gap-1 font-mono text-yellow-500 font-bold">
                              <span>{currentUser.gold_balance}</span>
                              <span className="text-yellow-400">G</span>
                           </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-400">扣除金額</span>
                           <div className="flex items-center gap-1 font-mono text-red-400 font-bold">
                              <span>- {purchasePrice}</span>
                              <span className="text-yellow-400">G</span>
                           </div>
                        </div>
                        <div className="h-px bg-slate-700 my-2"></div>
                        <div className="flex justify-between items-center">
                           <span className="text-white font-bold">剩餘金幣</span>
                           <span className={`font-mono font-bold flex items-center gap-1 ${isInsufficient ? 'text-red-500' : 'text-green-400'}`}>
                              <span>{currentUser.gold_balance - purchasePrice}</span>
                              <span className="text-yellow-400">G</span>
                           </span>
                        </div>
                     </div>

                     {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200 text-sm">
                           <AlertCircle className="h-4 w-4 shrink-0" />
                           {error}
                        </div>
                     )}

                     {isInsufficient ? (
                        <button
                           onClick={onOpenWallet}
                           disabled={!onOpenWallet}
                           className="w-full bg-slate-700 hover:bg-slate-600 text-yellow-500 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-600 hover:border-yellow-500"
                        >
                           {onOpenWallet ? (
                              <>
                                 <Coins className="h-4 w-4" />
                                 <span>金幣不足，前往儲值</span>
                              </>
                           ) : (
                              '金幣不足，請先儲值'
                           )}
                        </button>
                     ) : (
                        <button
                           onClick={handlePurchase}
                           className="w-full bg-nexus-accent hover:bg-nexus-accentHover text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                           <Lock className="h-4 w-4" />
                           確認支付
                        </button>
                     )}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default PaymentModal;