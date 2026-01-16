import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit, Save, Link as LinkIcon, FileText, CreditCard, Activity, BarChart, GripVertical, Users, ChevronRight, Download, Search, Filter } from 'lucide-react';
import { Game, GameCategory, User } from '../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { gameService } from '../services/gameService';
import UserDetailModal from './UserDetailModal';

interface AdminDashboardProps {
   isOpen: boolean;
   onClose: () => void;
   games: Game[];
   onAddGame: (game: Game) => void;
   onUpdateGame: (game: Game) => void;
   onDeleteGame: (id: string) => void;
   currentUser?: User;
}

interface PricingTier {
   id: number;
   label: string;
   price_gold: number;
   duration_minutes: number;
}

interface LoginLog {
   id: number;
   login_time: string;
   ip_address: string;
   name: string;
   email: string;
   user_id: string;
}

interface PurchaseRecord {
   purchase_date: string;
   order_id?: string;
   user_name: string;
   user_id: string;
   email: string;
   game_title: string;
   price: number;
   type: string;
   description: string;
}

interface WalletTransaction {
   id: number;
   order_id: string;
   user_id: string;
   amount: number;
   currency: string;
   type: string;
   description: string;
   status: string;
   created_at: string;
   p99_rrn?: string;
   amount_usd?: number;
   game_id?: string;
   game_title?: string;
}

interface GameOption {
   game_id: string;
   game_title: string;
}

// Transaction type mapping to Chinese
const TRANSACTION_TYPE_MAP: Record<string, string> = {
   'deposit': '儲值',
   'transfer': '轉點',
   'service': '服務消費',
   'purchase': '購買',
   'refund': '退款'
};

interface GameActivity {
   id: number;
   user_name: string;
   user_id: string;
   game_title: string;
   start_time: string;
   last_heartbeat: string;
   ip_address: string;
   duration_seconds: number;
}

interface AnalyticsData {
   gameStats: {
      title: string;
      total_seconds: number;
      play_count: number;
   }[];
   platformStats: {
      total_users: number;
      total_purchases: number;
   };
}

interface SortableRowProps {
   game: Game;
   onEdit: (game: Game) => void;
   onDelete: (id: string) => void;
}

const SortableRow = ({ game, onEdit, onDelete }: SortableRowProps) => {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({ id: game.id });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 100 : 'auto',
      position: isDragging ? 'relative' as const : 'static' as const,
   };

   return (
      <tr
         ref={setNodeRef}
         style={style}
         className={`hover:bg-slate-700/50 transition-colors ${isDragging ? 'bg-slate-700 shadow-xl' : ''}`}
      >
         <td className="p-4 w-10 text-slate-500 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5" />
         </td>
         <td className="p-4">
            <img src={game.thumbnailUrl} alt={game.title} className="w-12 h-16 object-cover rounded bg-slate-900" />
         </td>
         <td className="p-4 text-white font-medium">{game.title}</td>
         <td className="p-4 text-slate-300">
            <span className="px-2 py-1 rounded bg-slate-900 text-xs">{game.category}</span>
         </td>
         <td className="p-4 text-slate-300">
            {game.isFree ? <span className="text-green-400 font-bold">免費</span> : `$${game.price}`}
         </td>
         <td className="p-4 text-right">
            <div className="flex items-center justify-end gap-2">
               <button
                  onClick={() => onEdit(game)}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 p-2 rounded transition-colors"
                  title="編輯"
               >
                  <Edit className="h-5 w-5" />
               </button>
               <button
                  onClick={() => {
                     if (window.confirm(`確定要刪除 "${game.title}" 嗎?`)) {
                        onDelete(game.id);
                     }
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded transition-colors"
                  title="刪除"
               >
                  <Trash2 className="h-5 w-5" />
               </button>
            </div>
         </td>
      </tr>
   );
};

const AdminDashboard = ({ isOpen, onClose, games, onAddGame, onUpdateGame, onDeleteGame, currentUser }: AdminDashboardProps) => {
   const [activeTab, setActiveTab] = useState<'list' | 'form' | 'logs' | 'purchases' | 'activities' | 'analytics' | 'users'>('list');
   const [editingId, setEditingId] = useState<string | null>(null);
   const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
   const [isSavingOrder, setIsSavingOrder] = useState<boolean>(false);

   // User Detail Modal State
   const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
   const [showUserDetail, setShowUserDetail] = useState(false);

   // Prevent body scroll when modal is open
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }
      return () => {
         document.body.style.overflow = 'unset';
      };
   }, [isOpen]);


   // Data State
   const [logs, setLogs] = useState<LoginLog[]>([]);
   const [purchases, setPurchases] = useState<WalletTransaction[]>([]);
   const [activities, setActivities] = useState<GameActivity[]>([]);
   const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
   const [localGames, setLocalGames] = useState<Game[]>([]);

   // Transaction Filter State
   const [txGameOptions, setTxGameOptions] = useState<GameOption[]>([]);
   const [txFilterGameId, setTxFilterGameId] = useState<string>('all');
   const [txFilterType, setTxFilterType] = useState<string>('all');
   const [txFilterStartDate, setTxFilterStartDate] = useState<string>('');
   const [txFilterEndDate, setTxFilterEndDate] = useState<string>('');
   const [txIsLoading, setTxIsLoading] = useState(false);

   // Pricing Tiers State
   const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
   const [newTier, setNewTier] = useState({ label: '', price_gold: 0, duration_minutes: 60 });

   // Form State
   const [formData, setFormData] = useState<Omit<Game, 'id' | 'releaseDate'>>({
      title: '',
      description: '',
      fullDescription: '',
      thumbnailUrl: '',
      coverUrl: '',
      gameUrl: '',
      developer: '',
      price: 0,
      category: GameCategory.ACTION,
      isFree: false
   });

   const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates,
      })
   );

   useEffect(() => {
      // Don't reset local order when in reorder mode
      if (!isReorderMode) {
         setLocalGames(games);
      }
   }, [games, isReorderMode]);

   // Fetch tiers when editing a game
   useEffect(() => {
      if (editingId && activeTab === 'form') {
         fetch(`/api/admin/games/${editingId}/tiers`)
            .then(res => res.json())
            .then(data => setPricingTiers(data))
            .catch(err => console.error(err));
      } else {
         setPricingTiers([]); // Reset
      }
   }, [editingId, activeTab]);

   // Fetch transaction with filters
   const fetchTransactions = async () => {
      setTxIsLoading(true);
      try {
         const params = new URLSearchParams();
         if (txFilterGameId !== 'all') params.set('gameId', txFilterGameId);
         if (txFilterType !== 'all') params.set('type', txFilterType);
         if (txFilterStartDate) params.set('startDate', txFilterStartDate);
         if (txFilterEndDate) params.set('endDate', txFilterEndDate);

         const res = await fetch(`/api/admin/transactions?${params}`);
         const data = await res.json();
         setPurchases(data);
      } catch (e) {
         console.error('Failed to fetch transactions', e);
      } finally {
         setTxIsLoading(false);
      }
   };

   // Export transactions to CSV
   const exportTransactions = () => {
      const params = new URLSearchParams();
      if (txFilterGameId !== 'all') params.set('gameId', txFilterGameId);
      if (txFilterType !== 'all') params.set('type', txFilterType);
      if (txFilterStartDate) params.set('startDate', txFilterStartDate);
      if (txFilterEndDate) params.set('endDate', txFilterEndDate);

      window.open(`/api/admin/transactions/export?${params}`, '_blank');
   };

   // Fetch Data based on active tab
   useEffect(() => {
      if (activeTab === 'logs') {
         fetch('/api/admin/logs').then(res => res.json()).then(setLogs).catch(console.error);
      } else if (activeTab === 'purchases') {
         // Fetch game options for filter dropdown
         fetch('/api/admin/transactions/games').then(res => res.json()).then(setTxGameOptions).catch(console.error);
         fetchTransactions();
      } else if (activeTab === 'activities') {
         fetch('/api/admin/activities').then(res => res.json()).then(setActivities).catch(console.error);
      } else if (activeTab === 'analytics') {
         fetch('/api/admin/analytics').then(res => res.json()).then(setAnalytics).catch(console.error);
      }
   }, [activeTab]);

   if (!isOpen) return null;

   const handleAddTier = async () => {
      // Validate inputs
      if (!newTier.label || newTier.price_gold < 0 || newTier.duration_minutes === 0) {
         alert("請輸入有效的方案名稱、價格與時長");
         return;
      }

      // If Editing existing game, call API immediately
      if (editingId) {
         try {
            const res = await fetch(`/api/admin/games/${editingId}/tiers`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(newTier)
            });
            if (res.ok) {
               const savedTier = await res.json();
               setPricingTiers([...pricingTiers, savedTier]);
               setNewTier({ label: '', price_gold: 0, duration_minutes: 60 });
               alert("方案新增成功！");
            } else {
               alert("新增失敗，請檢查伺服器連線");
            }
         } catch (err) {
            console.error("Failed to add tier", err);
            alert("發生錯誤");
         }
      } else {
         // If New Game, add to local state
         const tempId = Date.now(); // Temp ID for UI key
         setPricingTiers([...pricingTiers, { ...newTier, id: tempId }]);
         setNewTier({ label: '', price_gold: 0, duration_minutes: 60 });
      }
   };

   const handleDeleteTier = async (id: number) => {
      if (!confirm("確定要刪除此方案嗎？")) return;

      if (editingId) {
         // Call API
         try {
            await fetch(`/api/admin/tiers/${id}`, { method: 'DELETE' });
            setPricingTiers(pricingTiers.filter(t => t.id !== id));
         } catch (err) {
            console.error("Failed to delete tier");
            alert("刪除失敗");
         }
      } else {
         // Remove from local state
         setPricingTiers(pricingTiers.filter(t => t.id !== id));
      }
   };

   const resetForm = () => {
      setFormData({
         title: '',
         description: '',
         fullDescription: '',
         thumbnailUrl: '',
         coverUrl: '',
         gameUrl: '',
         developer: '',
         price: 0,
         category: GameCategory.ACTION,
         isFree: false
      });
      setEditingId(null);
      setNewTier({ label: '', price_gold: 0, duration_minutes: 60 });
      setPricingTiers([]);
   };

   const handleTabChange = (tab: typeof activeTab) => {
      setActiveTab(tab);
      if (tab !== 'form') {
         resetForm();
      }
   };

   const handleEditClick = (game: Game) => {
      setEditingId(game.id);
      setFormData(game);
      setPricingTiers([]); // Will be populated by useEffect
      setActiveTab('form');
   };

   function handleDragEnd(event: DragEndEvent) {
      if (!isReorderMode) return;
      const { active, over } = event;
      if (active.id !== over?.id) {
         const oldIndex = localGames.findIndex((item) => item.id === active.id);
         const newIndex = localGames.findIndex((item) => item.id === over?.id);
         const newOrder = arrayMove(localGames, oldIndex, newIndex);
         setLocalGames(newOrder);
      }
   }

   async function handleSaveOrder() {
      setIsSavingOrder(true);
      try {
         const orderedIds = localGames.map(g => g.id);
         const res = await fetch('/api/games/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderedIds })
         });
         if (res.ok) {
            alert('排序已儲存！');
            setIsReorderMode(false);
            // Refresh games list from parent
            window.location.reload();
         } else {
            alert('儲存失敗，請重試');
         }
      } catch (err) {
         console.error('Error saving order:', err);
         alert('儲存失敗，請重試');
      } finally {
         setIsSavingOrder(false);
      }
   }

   function handleCancelReorder() {
      setLocalGames(games); // Reset to original order
      setIsReorderMode(false);
   }

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.gameUrl) {
         alert('請輸入遊戲連結 (Game URL)');
         return;
      }

      if (editingId) {
         const updatedGame: Game = {
            id: editingId,
            ...formData,
            isFree: formData.price === 0,
            releaseDate: games.find(g => g.id === editingId)?.releaseDate || new Date().toISOString().split('T')[0],
            pricingTiers: pricingTiers // Include tiers in update payload
         };
         onUpdateGame(updatedGame);
         alert('遊戲更新成功！');
      } else {
         const newGame = {
            id: Date.now().toString(),
            ...formData,
            isFree: formData.price === 0,
            releaseDate: new Date().toISOString().split('T')[0],
            pricingTiers: pricingTiers // Include tiers in payload
         };

         // Custom onAddGame to handle the payload with tiers? 
         // Assuming onAddGame eventually calls POST /api/games which we updated.
         // Let's call API directly here if onAddGame is just a wrapper, or pass it.
         // Looking at AdminDashboardProps, onAddGame(game: Game). Game type might not include pricingTiers.
         // We should hack it or fetch directly.
         // Let's use fetch directly for New Game to support the atomic transaction we just built.

         fetch('/api/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newGame)
         }).then(res => {
            if (res.ok) {
               res.json().then(savedGame => {
                  // Convert isFreeInt back to boolean if needed, or rely on reload.
                  // Simply reload page or trigger callback
                  onAddGame({ ...savedGame, isFree: savedGame.isFree === 1 });
                  alert('遊戲新增成功（含計費方案）！');
                  setActiveTab('list');
                  resetForm();
               });
            } else {
               alert('新增失敗');
            }
         });
         return; // Skip default onAddGame call logic
      }

      setActiveTab('list');
      resetForm();
   };

   return (
      <div className="fixed inset-0 z-[9999] bg-nexus-900/95 backdrop-blur-sm overflow-y-auto animate-fade-in">
         <div className="max-w-6xl mx-auto p-6 min-h-screen">

            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700">
               <div>
                  <h1 className="text-3xl font-bold text-white">後台管理系統</h1>
                  <p className="text-slate-400">管理遊戲列表與上架新遊戲</p>
               </div>
               <button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors text-white cursor-pointer z-50 relative"
               >
                  <X className="h-8 w-8" />
               </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
               <button
                  onClick={() => handleTabChange('list')}
                  className={`px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'list' ? 'bg-nexus-accent text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
               >
                  遊戲列表 ({games.length})
               </button>
               <button
                  onClick={() => handleTabChange('form')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'form' ? 'bg-nexus-accent text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
               >
                  {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {editingId ? '編輯遊戲' : '上架新遊戲'}
               </button>
               <button
                  onClick={() => handleTabChange('logs')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'logs' ? 'bg-nexus-accent text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
               >
                  <FileText className="h-5 w-5" />
                  登入日誌
               </button>
               <button
                  onClick={() => handleTabChange('purchases')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'purchases' ? 'bg-nexus-accent text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
               >
                  <CreditCard className="h-5 w-5" />
                  交易紀錄
               </button>
               <button
                  onClick={() => handleTabChange('activities')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'activities' ? 'bg-nexus-accent text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
               >
                  <Activity className="h-5 w-5" />
                  遊玩紀錄
               </button>
               <button
                  onClick={() => handleTabChange('analytics')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'analytics' ? 'bg-nexus-accent text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
               >
                  <BarChart className="h-5 w-5" />
                  數據統計
               </button>
               <button
                  onClick={() => handleTabChange('users')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'users' ? 'bg-nexus-accent text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
               >
                  <Users className="h-5 w-5" />
                  用戶管理
               </button>
            </div>

            {/* Content - Logs */}
            {activeTab === 'logs' && (
               <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                           <th className="p-4 border-b border-slate-700">時間</th>
                           <th className="p-4 border-b border-slate-700">帳號 ID (User ID)</th>
                           <th className="p-4 border-b border-slate-700">使用者</th>
                           <th className="p-4 border-b border-slate-700">IP 位址</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-700">
                        {logs.map((log: LoginLog) => (
                           <tr key={log.id} className="hover:bg-slate-700/50 transition-colors">
                              <td className="p-4 text-slate-300">{new Date(log.login_time).toLocaleString()}</td>
                              <td className="p-4 text-nexus-accent font-mono text-xs">{log.user_id}</td>
                              <td className="p-4 text-white font-medium">{log.name}<div className="text-xs text-slate-500">{log.email}</div></td>
                              <td className="p-4 text-slate-300 font-mono text-sm">{log.ip_address}</td>
                           </tr>
                        ))}
                        {logs.length === 0 && (
                           <tr><td colSpan={4} className="p-8 text-center text-slate-500">尚無登入紀錄</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            )}

            {/* Content - Purchases */}
            {activeTab === 'purchases' && (
               <div className="space-y-4">
                  {/* Filter Bar */}
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                     <div className="flex flex-wrap items-end gap-4">
                        {/* Game/Service Filter */}
                        <div className="flex-1 min-w-[200px]">
                           <label className="block text-xs text-slate-400 mb-1">項目篩選</label>
                           <select
                              value={txFilterGameId}
                              onChange={(e) => setTxFilterGameId(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm"
                           >
                              {txGameOptions.map(opt => (
                                 <option key={opt.game_id} value={opt.game_id}>{opt.game_title}</option>
                              ))}
                           </select>
                        </div>

                        {/* Type Filter */}
                        <div className="min-w-[120px]">
                           <label className="block text-xs text-slate-400 mb-1">交易類型</label>
                           <select
                              value={txFilterType}
                              onChange={(e) => setTxFilterType(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm"
                           >
                              <option value="all">全部</option>
                              <option value="deposit">儲值</option>
                              <option value="transfer">轉點</option>
                              <option value="service">服務消費</option>
                              <option value="purchase">購買</option>
                              <option value="refund">退款</option>
                           </select>
                        </div>

                        {/* Start Date */}
                        <div className="min-w-[150px]">
                           <label className="block text-xs text-slate-400 mb-1">開始日期</label>
                           <input
                              type="date"
                              value={txFilterStartDate}
                              onChange={(e) => setTxFilterStartDate(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm"
                           />
                        </div>

                        {/* End Date */}
                        <div className="min-w-[150px]">
                           <label className="block text-xs text-slate-400 mb-1">結束日期</label>
                           <input
                              type="date"
                              value={txFilterEndDate}
                              onChange={(e) => setTxFilterEndDate(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm"
                           />
                        </div>

                        {/* Search Button */}
                        <button
                           onClick={fetchTransactions}
                           disabled={txIsLoading}
                           className="flex items-center gap-2 bg-nexus-accent hover:bg-nexus-accentHover text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                        >
                           <Search className="h-4 w-4" />
                           {txIsLoading ? '查詢中...' : '查詢'}
                        </button>

                        {/* Export Button */}
                        <button
                           onClick={exportTransactions}
                           className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                        >
                           <Download className="h-4 w-4" />
                           匯出 Excel
                        </button>
                     </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                              <th className="p-4 border-b border-slate-700">時間 / 單號</th>
                              <th className="p-4 border-b border-slate-700">用戶 ID</th>
                              <th className="p-4 border-b border-slate-700">類型</th>
                              <th className="p-4 border-b border-slate-700">項目</th>
                              <th className="p-4 border-b border-slate-700">描述</th>
                              <th className="p-4 border-b border-slate-700 text-right">變動金額</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                           {purchases.map((record: WalletTransaction) => (
                              <tr key={record.id} className="hover:bg-slate-700/50 transition-colors">
                                 <td className="p-4 text-slate-300">
                                    <div className="text-sm">{new Date(record.created_at).toLocaleString()}</div>
                                    <div className="text-xs text-slate-500 font-mono mt-1">{record.order_id}</div>
                                    {record.p99_rrn && (
                                       <div className="text-xs text-blue-400 font-mono">P99: {record.p99_rrn}</div>
                                    )}
                                 </td>
                                 <td className="p-4 text-nexus-accent font-mono text-xs">
                                    {record.user_id}
                                 </td>
                                 <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                       record.type === 'deposit' ? 'bg-green-900/50 text-green-400' :
                                       record.type === 'transfer' ? 'bg-blue-900/50 text-blue-400' :
                                       record.type === 'service' ? 'bg-purple-900/50 text-purple-400' :
                                       record.type === 'purchase' ? 'bg-yellow-900/50 text-yellow-400' :
                                       record.type === 'refund' ? 'bg-red-900/50 text-red-400' :
                                       'bg-slate-700 text-slate-300'
                                    }`}>
                                       {TRANSACTION_TYPE_MAP[record.type] || record.type}
                                    </span>
                                    <div className={`text-xs mt-1 ${record.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                                       {record.status === 'completed' ? '已完成' : record.status}
                                    </div>
                                 </td>
                                 <td className="p-4 text-slate-300 text-sm">
                                    {record.game_title || record.game_id || '平台'}
                                 </td>
                                 <td className="p-4 text-slate-400 text-sm max-w-[200px] truncate" title={record.description}>
                                    {record.description}
                                 </td>
                                 <td className={`p-4 font-mono font-bold text-right ${record.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {record.amount > 0 ? '+' : ''}{record.amount}
                                    {record.amount_usd && (
                                       <div className="text-xs text-slate-500">${Number(record.amount_usd).toFixed(2)} USD</div>
                                    )}
                                 </td>
                              </tr>
                           ))}
                           {purchases.length === 0 && (
                              <tr><td colSpan={6} className="p-8 text-center text-slate-500">
                                 {txIsLoading ? '載入中...' : '尚無交易紀錄，請調整篩選條件'}
                              </td></tr>
                           )}
                        </tbody>
                     </table>
                     {purchases.length > 0 && (
                        <div className="p-4 border-t border-slate-700 text-sm text-slate-400 flex justify-between">
                           <span>共 {purchases.length} 筆紀錄</span>
                           <span>顯示最近 500 筆</span>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {/* Content - Activities */}
            {activeTab === 'activities' && (
               <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                           <th className="p-4 border-b border-slate-700">遊戲</th>
                           <th className="p-4 border-b border-slate-700">帳號 ID</th>
                           <th className="p-4 border-b border-slate-700">啟動時間</th>
                           <th className="p-4 border-b border-slate-700">遊玩時長</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-700">
                        {activities.map((act: GameActivity) => (
                           <tr key={act.id} className="hover:bg-slate-700/50 transition-colors">
                              <td className="p-4 text-nexus-accent font-bold">{act.game_title}</td>
                              <td className="p-4 text-white font-mono text-xs">
                                 <div>{act.user_id}</div>
                                 <div className="text-slate-500">{act.user_name}</div>
                              </td>
                              <td className="p-4 text-slate-300">{new Date(act.start_time).toLocaleString()}</td>
                              <td className="p-4 text-slate-300">
                                 {Math.floor(act.duration_seconds / 60)} 分 {act.duration_seconds % 60} 秒
                              </td>
                           </tr>
                        ))}
                        {activities.length === 0 && (
                           <tr><td colSpan={5} className="p-8 text-center text-slate-500">尚無遊玩紀錄</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            )}

            {/* Content - Analytics */}
            {activeTab === 'analytics' && analytics && (
               <div className="space-y-8 animate-fade-in">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">總註冊用戶</h3>
                        <p className="text-4xl font-black text-white">{analytics.platformStats.total_users}</p>
                     </div>
                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">總交易筆數</h3>
                        <p className="text-4xl font-black text-nexus-accent">{analytics.platformStats.total_purchases}</p>
                     </div>
                  </div>

                  {/* Game Stats Table */}
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                     <div className="p-6 border-b border-slate-700">
                        <h3 className="text-xl font-bold text-white">熱門遊戲排行</h3>
                     </div>
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                              <th className="p-4 border-b border-slate-700">排行</th>
                              <th className="p-4 border-b border-slate-700">遊戲名稱</th>
                              <th className="p-4 border-b border-slate-700">啟動次數</th>
                              <th className="p-4 border-b border-slate-700 text-right">總遊玩時間 (分)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                           {analytics.gameStats.map((stat: AnalyticsData['gameStats'][0], idx: number) => (
                              <tr key={stat.title} className="hover:bg-slate-700/50 transition-colors">
                                 <td className="p-4 text-slate-500 font-bold">#{idx + 1}</td>
                                 <td className="p-4 text-white font-bold">{stat.title}</td>
                                 <td className="p-4 text-slate-300">{stat.play_count}</td>
                                 <td className="p-4 text-right text-nexus-accent font-mono">
                                    {(stat.total_seconds / 60).toFixed(1)} min
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {/* Content - Users (Top-up) */}
            {activeTab === 'users' && (
               <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                     <Users className="h-6 w-6 text-nexus-accent" />
                     用戶管理與補點
                  </h2>

                  {/* Search */}
                  <div className="flex gap-4 mb-8">
                     <input
                        type="text"
                        placeholder="搜尋用戶 (ID / 姓名 / Email)"
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-nexus-accent"
                        onKeyDown={e => {
                           if (e.key === 'Enter') {
                              fetch(`/api/admin/users/search?q=${e.currentTarget.value}`)
                                 .then(res => res.json())
                                 .then(setLogs) // Re-using logs state for user list (hacky but saves space)
                                 .catch(console.error);
                           }
                        }}
                     />
                     <button
                        className="bg-slate-700 hover:bg-slate-600 px-6 rounded-lg text-white font-bold"
                        onClick={(e) => {
                           const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                           fetch(`/api/admin/users/search?q=${input.value}`)
                              .then(res => res.json())
                              .then(setLogs)
                              .catch(console.error);
                        }}
                     >
                        搜尋
                     </button>
                  </div>

                  {/* Results */}
                  <div className="space-y-4">
                     {logs.map((user: any) => (
                        <div key={user.id} className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 flex items-center justify-between hover:border-nexus-accent transition-colors group">
                           <div
                              className="flex-1 cursor-pointer"
                              onClick={() => {
                                 setSelectedUserId(user.id);
                                 setShowUserDetail(true);
                              }}
                           >
                              <div className="flex items-center gap-2 mb-1">
                                 <span className="text-lg font-bold text-white group-hover:text-nexus-accent transition-colors">{user.name}</span>
                                 <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{user.id}</span>
                                 {user.role === 'admin' && (
                                    <span className="text-xs bg-purple-600 px-2 py-1 rounded text-white">管理員</span>
                                 )}
                              </div>
                              <div className="text-sm text-slate-400 mb-2">{user.email}</div>
                              <div className="text-2xl font-mono text-nexus-accent">{user.gold_balance} Gold</div>
                           </div>

                           <div className="flex items-center gap-2">
                              <input
                                 type="number"
                                 placeholder="金額"
                                 className="w-32 bg-slate-800 border border-slate-600 rounded p-2 text-white text-right"
                                 onClick={e => e.stopPropagation()}
                              />
                              <button
                                 className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold"
                                 onClick={async (e) => {
                                    e.stopPropagation();
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    const amount = parseFloat(input.value);
                                    if (!amount) return alert("請輸入金額");

                                    if (confirm(`確認要發送 ${amount} Gold 給 ${user.name} 嗎？`)) {
                                       const res = await fetch('/api/admin/users/topup', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ userId: user.id, amount })
                                       });
                                       if (res.ok) {
                                          alert("補點成功！");
                                          input.value = '';
                                          // Refresh search
                                          const q = (document.querySelector('input[placeholder="搜尋用戶 (ID / 姓名 / Email)"]') as HTMLInputElement).value;
                                          fetch(`/api/admin/users/search?q=${q}`).then(r => r.json()).then(setLogs);
                                       }
                                    }
                                 }}
                              >
                                 補點
                              </button>
                              <button
                                 className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded"
                                 onClick={() => {
                                    setSelectedUserId(user.id);
                                    setShowUserDetail(true);
                                 }}
                                 title="查看詳情"
                              >
                                 <ChevronRight className="h-5 w-5" />
                              </button>
                           </div>
                        </div>
                     ))}
                     {logs.length === 0 && (
                        <p className="text-center text-slate-500 py-8">請輸入關鍵字搜尋用戶</p>
                     )}
                  </div>
               </div>
            )}

            {/* Content - List */}
            {activeTab === 'list' && (
               <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                  {/* Reorder Mode Toolbar */}
                  <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                     <span className="text-slate-400 text-sm">
                        {isReorderMode ? '拖曳遊戲調整排序，完成後點擊儲存' : `共 ${localGames.length} 款遊戲`}
                     </span>
                     <div className="flex gap-2">
                        {isReorderMode ? (
                           <>
                              <button
                                 onClick={handleCancelReorder}
                                 className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-colors"
                              >
                                 取消
                              </button>
                              <button
                                 onClick={handleSaveOrder}
                                 disabled={isSavingOrder}
                                 className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                              >
                                 {isSavingOrder ? '儲存中...' : '儲存排序'}
                              </button>
                           </>
                        ) : (
                           <button
                              onClick={() => setIsReorderMode(true)}
                              className="px-4 py-2 bg-nexus-accent hover:bg-nexus-accentHover text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                           >
                              <GripVertical className="h-4 w-4" />
                              調整排序
                           </button>
                        )}
                     </div>
                  </div>
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                           <th className="p-4 border-b border-slate-700 w-10"></th>
                           <th className="p-4 border-b border-slate-700">遊戲圖片</th>
                           <th className="p-4 border-b border-slate-700">名稱</th>
                           <th className="p-4 border-b border-slate-700">分類</th>
                           <th className="p-4 border-b border-slate-700">價格</th>
                           <th className="p-4 border-b border-slate-700 text-right">操作</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-700">
                        <DndContext
                           sensors={sensors}
                           collisionDetection={closestCenter}
                           onDragEnd={handleDragEnd}
                        >
                           <SortableContext
                              items={localGames.map((g: Game) => g.id)}
                              strategy={verticalListSortingStrategy}
                           >
                              {localGames.map((game: Game) => (
                                 <SortableRow
                                    key={game.id}
                                    game={game}
                                    onEdit={handleEditClick}
                                    onDelete={onDeleteGame}
                                 />
                              ))}
                           </SortableContext>
                        </DndContext>
                     </tbody>
                  </table>
               </div>
            )}

            {/* Content - Form (Add / Edit) */}
            {activeTab === 'form' && (
               <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl max-w-3xl">
                  <h2 className="text-2xl font-bold text-white mb-6">
                     {editingId ? '編輯遊戲資訊' : '填寫新遊戲資訊'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-bold text-slate-400 mb-2">遊戲名稱</label>
                           <input
                              type="text"
                              required
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-nexus-accent"
                              value={formData.title}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-400 mb-2">開發商</label>
                           <input
                              type="text"
                              required
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-nexus-accent"
                              value={formData.developer}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, developer: e.target.value })}
                           />
                        </div>
                     </div>

                     {/* Game URL Input */}
                     <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 border-l-4 border-l-nexus-accent">
                        <label className="block text-sm font-bold text-nexus-accent mb-2 flex items-center gap-2">
                           <LinkIcon className="h-4 w-4" />
                           遊戲連結 (Game URL) - 必填
                        </label>
                        <p className="text-xs text-slate-500 mb-2">請輸入遊戲的啟動網址，支援絕對路徑 (https://...) 或相對路徑 (例如: /games/2048/index.html)。</p>
                        <input
                           type="text"
                           required
                           placeholder="/games/game-name/index.html 或 https://example.com"
                           className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-nexus-accent"
                           value={formData.gameUrl}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, gameUrl: e.target.value })}
                        />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-bold text-slate-400 mb-2">分類</label>
                           <select
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-nexus-accent"
                              value={formData.category}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, category: e.target.value as GameCategory })}
                           >
                              {Object.values(GameCategory).map(cat => (
                                 <option key={cat} value={cat}>{cat}</option>
                              ))}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-400 mb-2">價格 (輸入 0 為免費)</label>
                           <input
                              type="number"
                              min="0"
                              step="0.01"
                              required
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-nexus-accent"
                              value={formData.price}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                              onWheel={(e) => e.currentTarget.blur()}
                           />
                           <p className="text-xs text-yellow-500 mt-2">
                              ⚠ 注意：若設為 0，玩家將可直接免費遊玩，忽略下方的計費方案。<br />
                              若希望採「純計時制」，請設定價格為 990000 (或更高)。
                           </p>
                        </div>
                     </div>

                     {/* Pricing Tiers Section - Always Visible */}
                     <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 mt-2 mb-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                           <CreditCard className="h-5 w-5 text-yellow-500" />
                           計費方案設定 (Pricing Tiers)
                        </h3>

                        {/* Add Tier Form */}
                        <div className="flex flex-col md:flex-row gap-4 items-end mb-6 bg-slate-800 p-4 rounded-lg">
                           <div className="flex-1">
                              <label className="text-xs text-slate-400 block mb-1">方案名稱 (如: 1小時)</label>
                              <input
                                 type="text"
                                 className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                                 placeholder="1小時暢玩"
                                 value={newTier.label}
                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTier({ ...newTier, label: e.target.value })}
                              />
                           </div>
                           <div className="w-24">
                              <label className="text-xs text-slate-400 block mb-1">價格 (Gold)</label>
                              <input
                                 type="number"
                                 className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                                 placeholder="100"
                                 value={newTier.price_gold}
                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTier({ ...newTier, price_gold: parseInt(e.target.value) })}
                              />
                           </div>
                           <div className="w-32">
                              <label className="text-xs text-slate-400 block mb-1">時長 (分, -1永久)</label>
                              <input
                                 type="number"
                                 className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                                 placeholder="60"
                                 value={newTier.duration_minutes}
                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTier({ ...newTier, duration_minutes: parseInt(e.target.value) })}
                              />
                           </div>
                           <button
                              type="button"
                              onClick={handleAddTier}
                              className="bg-nexus-accent hover:bg-nexus-accentHover text-white px-4 py-2 rounded font-bold text-sm h-10"
                           >
                              新增
                           </button>
                        </div>

                        {/* Tiers List */}
                        <div className="space-y-2">
                           {pricingTiers.map((tier: PricingTier) => (
                              <div key={tier.id} className="flex items-center justify-between p-3 bg-slate-800 rounded border border-slate-700">
                                 <div className="flex items-center gap-4">
                                    <span className="font-bold text-white">{tier.label}</span>
                                    <span className="text-yellow-500 font-mono">{tier.price_gold} Gold</span>
                                    <span className="text-slate-400 text-sm">
                                       {tier.duration_minutes === -1 ? '永久買斷' : `${tier.duration_minutes} 分鐘`}
                                    </span>
                                 </div>
                                 <button
                                    type="button"
                                    onClick={() => handleDeleteTier(tier.id)}
                                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded"
                                 >
                                    <Trash2 className="h-4 w-4" />
                                 </button>
                              </div>
                           ))}
                           {pricingTiers.length === 0 && (
                              <p className="text-slate-500 text-sm text-center py-2">尚未設定任何計費方案</p>
                           )}
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">短描述 (列表顯示)</label>
                        <input
                           type="text"
                           required
                           maxLength={100}
                           className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-nexus-accent"
                           value={formData.description}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">完整介紹 (詳細頁面)</label>
                        <textarea
                           required
                           rows={4}
                           className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-nexus-accent"
                           value={formData.fullDescription}
                           onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, fullDescription: e.target.value })}
                        />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-bold text-slate-400 mb-2">縮圖 (300x400)</label>
                           <div className="flex flex-col gap-2">
                              {/* File Input */}
                              <input
                                 type="file"
                                 accept="image/*"
                                 className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-nexus-accent file:text-white hover:file:bg-nexus-accentHover"
                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                       const reader = new FileReader();
                                       reader.onloadend = () => {
                                          setFormData({ ...formData, thumbnailUrl: reader.result as string });
                                       };
                                       reader.readAsDataURL(file);
                                    }
                                 }}
                              />
                              {/* URL Input (Optional Backup) */}
                              <input
                                 type="text"
                                 placeholder="或貼上圖片網址"
                                 className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-nexus-accent"
                                 value={formData.thumbnailUrl}
                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                              />
                              <div className="w-20 h-28 bg-slate-700 rounded overflow-hidden flex-shrink-0 border border-slate-600">
                                 {formData.thumbnailUrl ? (
                                    <img src={formData.thumbnailUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} />
                                 ) : (
                                    <div className="flex items-center justify-center h-full text-xs text-slate-500">預覽</div>
                                 )}
                              </div>
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-400 mb-2">封面 (800x400)</label>
                           <div className="flex flex-col gap-2">
                              {/* File Input */}
                              <input
                                 type="file"
                                 accept="image/*"
                                 className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-nexus-accent file:text-white hover:file:bg-nexus-accentHover"
                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                       const reader = new FileReader();
                                       reader.onloadend = () => {
                                          setFormData({ ...formData, coverUrl: reader.result as string });
                                       };
                                       reader.readAsDataURL(file);
                                    }
                                 }}
                              />
                              {/* URL Input */}
                              <input
                                 type="text"
                                 placeholder="或貼上圖片網址"
                                 className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-nexus-accent"
                                 value={formData.coverUrl}
                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, coverUrl: e.target.value })}
                              />
                              <div className="w-full h-32 bg-slate-700 rounded overflow-hidden flex-shrink-0 border border-slate-600">
                                 {formData.coverUrl ? (
                                    <img src={formData.coverUrl} alt="Cover Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} />
                                 ) : (
                                    <div className="flex items-center justify-center h-full text-xs text-slate-500">預覽</div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="pt-4 border-t border-slate-700 flex gap-4">
                        {editingId && (
                           <button
                              type="button"
                              onClick={() => {
                                 resetForm();
                                 setActiveTab('list');
                              }}
                              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
                           >
                              取消
                           </button>
                        )}
                        <button
                           type="submit"
                           className="flex-1 bg-nexus-accent hover:bg-nexus-accentHover text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                           {editingId ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                           {editingId ? '儲存更新' : '確認上架遊戲'}
                        </button>
                     </div>
                  </form>
               </div>
            )}
         </div>

         {/* User Detail Modal */}
         {selectedUserId && currentUser && (
            <UserDetailModal
               isOpen={showUserDetail}
               onClose={() => {
                  setShowUserDetail(false);
                  setSelectedUserId(null);
               }}
               userId={selectedUserId}
               adminId={currentUser.id}
               adminName={currentUser.name}
            />
         )}
      </div>
   );
};

export default AdminDashboard;