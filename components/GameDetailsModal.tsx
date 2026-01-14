import React from 'react';
import { X, Play, ShoppingCart, Star, Calendar, User as UserIcon, Download, RefreshCw, FileText, Clock } from 'lucide-react';
import { Game } from '../types';

interface GameDetailsModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (game: Game, forcePurchase?: boolean) => void;
  isOwned: boolean;
  isLoggedIn: boolean;
  userId?: string; // Added userId
  expiresAt?: string | null;
}

const GameDetailsModal: React.FC<GameDetailsModalProps> = ({ game, isOpen, onClose, onPlay, isOwned, isLoggedIn, userId, expiresAt }) => {
  if (!isOpen) return null;

  // Timer Logic
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (expiresAt) {
      const target = new Date(expiresAt).getTime();
      const update = () => {
        const diff = target - Date.now();
        setTimeLeft(diff > 0 ? diff : 0);
      };
      update();
      const timer = setInterval(update, 1000);
      return () => clearInterval(timer);
    } else {
      setTimeLeft(null);
    }
  }, [expiresAt]);

  const formatTime = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const [activeTab, setActiveTab] = React.useState<'overview' | 'leaderboard' | 'history'>('overview');
  const [leaderboard, setLeaderboard] = React.useState<any[]>([]);
  const [myHistory, setMyHistory] = React.useState<any[]>([]);
  const [loadingStats, setLoadingStats] = React.useState(false);

  // Reset tab when modal opens
  React.useEffect(() => {
    if (isOpen) setActiveTab('overview');
  }, [isOpen]);

  // Fetch stats when tab changes
  React.useEffect(() => {
    if (isOpen && (activeTab === 'leaderboard' || (activeTab === 'history' && userId))) {
      fetchStats();
    }
  }, [isOpen, activeTab, game.id, userId]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      if (activeTab === 'leaderboard') {
        const res = await fetch(`/api/games/${game.id}/leaderboard`);
        if (res.ok) setLeaderboard(await res.json());
      } else if (activeTab === 'history' && userId) {
        // Use different endpoint for service-type games
        const endpoint = game.game_type === 'service'
          ? `/api/games/${game.id}/service-orders/${userId}`
          : `/api/games/${game.id}/scores/${userId}`;
        const res = await fetch(endpoint);
        if (res.ok) setMyHistory(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  // Tiers State
  const [tiers, setTiers] = React.useState<any[]>([]);
  const [selectedTier, setSelectedTier] = React.useState<any | null>(null);

  // Fetch Pricing Tiers
  React.useEffect(() => {
    if (isOpen && game.id) {
      fetch(`/api/admin/games/${game.id}/tiers`)
        .then(res => res.json())
        .then(data => {
          setTiers(data);
          if (data.length > 0) setSelectedTier(data[0]);
        })
        .catch(err => console.error("Failed to fetch tiers", err));
    }
  }, [isOpen, game.id]);

  const handleRentalPurchase = () => {
    if (!selectedTier) return;
    const gameWithTier = {
      ...game,
      selectedTier: selectedTier,
      paymentPrice: selectedTier.price_gold
    };
    onPlay(gameWithTier, true); // Force purchase
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isRentalOnly = game.price >= 990000;
  const actionButtonText = game.isFree || isOwned ? '立即遊玩' : `購買 ${game.price} 金幣`;
  const actionButtonIcon = game.isFree || isOwned ? <Play className="h-5 w-5 fill-current" /> : <ShoppingCart className="h-5 w-5" />;
  const actionButtonColor = game.isFree || isOwned ? 'bg-green-600 hover:bg-green-500' : 'bg-nexus-accent hover:bg-nexus-accentHover';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in text-white"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl relative animate-slide-up flex flex-col md:flex-row">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Tab Navigation (Mobile: Top, Desktop: Left Sidebar or Top) */}
        {/* Let's keep the split layout but put tabs on the Content side */}

        {/* Left/Top: Image Banner (Visible only in Overview or reduced size?) */}
        {/* Let's keep the image always visible on the left for aesthetics */}
        <div className="hidden md:block w-2/5 relative">
          <img
            src={game.coverUrl}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900 opacity-90" />
        </div>

        {/* Mobile Banner */}
        <div className="md:hidden h-48 w-full relative shrink-0">
          <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>

        {/* Right/Bottom: Content */}
        <div className="flex-1 flex flex-col bg-slate-900 h-full overflow-hidden">

          {/* Tabs Header */}
          <div className="flex border-b border-slate-800 px-6 pt-4 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-nexus-accent text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'leaderboard' ? 'border-nexus-accent text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'history' ? 'border-nexus-accent text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              My History
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">

            {activeTab === 'overview' && (
              <div className="flex flex-col h-full animate-fade-in">
                <div className="mb-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-300">
                    {game.category}
                  </span>
                  {game.isFree && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-green-900 text-green-300">
                      免費遊玩
                    </span>
                  )}
                  {isRentalOnly && !game.isFree && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-900 text-blue-300">
                      僅限計時
                    </span>
                  )}
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{game.title}</h2>

                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-white">4.8</span>
                    <span>(1.2k 評論)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4" />
                    <span>{game.developer}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{game.releaseDate}</span>
                  </div>
                </div>

                <p className="text-slate-300 text-lg leading-relaxed mb-8 flex-grow">
                  {game.fullDescription}
                </p>

                {/* Pricing Tiers Selection (For Non-Rental / Standard Paid Games with Options) */}
                {!game.isFree && !isOwned && tiers.length > 0 && !isRentalOnly && (
                  <div className="mb-6 bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                    <h4 className="text-sm font-bold text-slate-300 mb-3 block">選擇方案</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tiers.map((tier) => (
                        <button
                          key={tier.id}
                          onClick={() => setSelectedTier(tier)}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left ${selectedTier?.id === tier.id
                            ? 'bg-nexus-accent/20 border-nexus-accent ring-1 ring-nexus-accent'
                            : 'bg-slate-900 border-slate-600 hover:border-slate-500'
                            }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{tier.label}</span>
                            <span className="text-xs text-slate-400">
                              {tier.duration_minutes === -1 ? '永久買斷' : `計時: ${tier.duration_minutes} 分鐘`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 ml-4 whitespace-nowrap">
                            <span className="text-nexus-accent font-bold">{tier.price_gold}</span>
                            <span className="text-yellow-500 font-bold">G</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6 border-t border-slate-800">
                  {!isRentalOnly && (
                    <>
                      <button
                        onClick={() => !game.isFree && !isLoggedIn ? null : onPlay(game)}
                        disabled={!game.isFree && !isLoggedIn}
                        className={`w-full md:w-auto flex items-center justify-center gap-2 ${!game.isFree && !isLoggedIn
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                          : actionButtonColor
                          } text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${!game.isFree && !isLoggedIn ? '' : 'hover:shadow-xl transform hover:-translate-y-0.5'
                          }`}
                      >
                        {actionButtonIcon}
                        {game.isFree || isOwned ? '立即遊玩' : (
                          <div className="flex items-center gap-1">
                            <span>購買 {game.price}</span>
                            <span className="text-yellow-300">G</span>
                          </div>
                        )}
                      </button>
                      {!game.isFree && !isLoggedIn && (
                        <p className="mt-3 text-center md:text-left text-sm text-amber-500 font-bold">
                          ⚠️ 請先登入才能遊玩
                        </p>
                      )}
                    </>
                  )}

                  {isRentalOnly && (
                    <div className="flex flex-col gap-6">
                      {/* 1. Status & Play Button (If Active) */}
                      {isOwned && timeLeft !== null && timeLeft > 0 && (
                        <div className="bg-slate-800/60 p-4 rounded-xl border border-green-900/50">
                          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-500/20 rounded-full text-green-400">
                                <Play className="h-6 w-6 fill-current" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-green-400 font-bold text-lg">目前可遊玩</span>
                                <span className="text-yellow-400 font-mono text-sm">
                                  剩餘: {(() => {
                                    const t = formatTime(timeLeft);
                                    return `${t.days > 0 ? t.days + '天 ' : ''}${t.hours.toString().padStart(2, '0')}時${t.minutes.toString().padStart(2, '0')}分${t.seconds.toString().padStart(2, '0')}秒`;
                                  })()}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => isLoggedIn ? onPlay(game) : null}
                              disabled={!isLoggedIn}
                              className={`w-full md:w-auto ${!isLoggedIn
                                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                                  : 'bg-green-600 hover:bg-green-500'
                                } text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition-all`}
                            >
                              {!isLoggedIn ? '請先登入' : '立即遊玩'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. Expired Message (If Owned but Expired) */}
                      {isOwned && (!timeLeft || timeLeft <= 0) && (
                        <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg flex items-center gap-2 text-red-400">
                          <span className="font-bold">⚠ 時數已用盡</span>
                          <span className="text-sm opacity-80">- 請購買續時以繼續遊玩</span>
                        </div>
                      )}

                      {/* 3. Purchase / Extension Area (Always Visible) */}
                      <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                        <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center justify-between">
                          <span>{isOwned && timeLeft && timeLeft > 0 ? '購買續時 (疊加時間)' : '選擇方案'}</span>
                          {selectedTier && (
                            <span className="text-nexus-accent">{selectedTier.label}</span>
                          )}
                        </h4>

                        {tiers.length === 0 ? (
                          <div className="text-center text-slate-500 py-4">暫無可用方案</div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {/* Tiers Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {tiers.map((tier) => (
                                <button
                                  key={tier.id}
                                  onClick={() => setSelectedTier(tier)}
                                  className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left ${selectedTier?.id === tier.id
                                    ? 'bg-nexus-accent/20 border-nexus-accent ring-1 ring-nexus-accent'
                                    : 'bg-slate-900 border-slate-600 hover:border-slate-500 hover:bg-slate-800'
                                    }`}
                                >
                                  <div className="flex flex-col">
                                    <span className={`font-bold ${selectedTier?.id === tier.id ? 'text-white' : 'text-slate-300'}`}>
                                      {tier.duration_minutes} 分鐘
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded">
                                    <span className="text-nexus-accent font-mono font-bold">{tier.price_gold}</span>
                                    <span className="text-yellow-500 text-xs font-bold">G</span>
                                  </div>
                                </button>
                              ))}
                            </div>

                            {/* Purchase Action */}
                            <button
                              onClick={handleRentalPurchase}
                              disabled={!selectedTier}
                              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${!selectedTier
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                                : 'bg-nexus-accent hover:bg-nexus-accentHover text-white hover:shadow-nexus-accent/20 transform hover:-translate-y-0.5'
                                }`}
                            >
                              <ShoppingCart className="h-5 w-5" />
                              {selectedTier ? (
                                <div className="flex items-center gap-1">
                                  <span>{isOwned && timeLeft && timeLeft > 0 ? '購買續時' : '購買'}</span>
                                  <span className="mx-1 opacity-50">|</span>
                                  <span>{selectedTier.price_gold}</span>
                                  <span className="text-yellow-300">G</span>
                                </div>
                              ) : '請先選擇時間方案'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!game.isFree && !isOwned && !isRentalOnly && (
                    <div className="mt-3">
                      {!isLoggedIn ? (
                        <p className="text-center md:text-left text-sm text-amber-500 font-bold mb-1">
                          ⚠ 請先登入會員以進行購買
                        </p>
                      ) : (
                        <p className="text-center md:text-left text-xs text-slate-500">
                          一次性購買，永久遊玩。
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="h-full flex flex-col animate-fade-in">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  🏆 Global Top 100
                </h3>
                {loadingStats ? (
                  <div className="text-center py-12 text-slate-500">Loading rankings...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 bg-slate-800/20 rounded-xl">No records yet. Be the first!</div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${idx < 3 ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-slate-800 border border-slate-700'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${idx === 0 ? 'bg-yellow-500 text-black' :
                            idx === 1 ? 'bg-slate-300 text-black' :
                              idx === 2 ? 'bg-amber-700 text-white' :
                                'text-slate-500'
                            }`}>
                            {idx + 1}
                          </div>
                          <div className="flex items-center gap-3">
                            <img src={entry.avatar || 'https://via.placeholder.com/32'} alt={entry.name} className="w-8 h-8 rounded-full bg-slate-700" />
                            <span className={`font-medium ${idx < 3 ? 'text-yellow-100' : 'text-slate-300'}`}>{entry.name}</span>
                          </div>
                        </div>
                        <span className="text-xl font-mono font-bold text-nexus-accent">{entry.score.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="h-full flex flex-col animate-fade-in">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  📜 {game.game_type === 'service' ? '訂單紀錄' : 'Your Performance'}
                </h3>
                {!isLoggedIn || !userId ? (
                  <div className="flex-1 flex items-center justify-center flex-col text-slate-500">
                    <p>Please login to view your history.</p>
                  </div>
                ) : loadingStats ? (
                  <div className="text-center py-12 text-slate-500">Loading history...</div>
                ) : myHistory.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 bg-slate-800/20 rounded-xl">
                    {game.game_type === 'service' ? '尚無訂單紀錄' : 'No games played yet.'}
                  </div>
                ) : game.game_type === 'service' ? (
                  /* Service Orders Display */
                  <div className="space-y-3">
                    {myHistory.map((order, idx) => {
                      const serviceData = typeof order.service_data === 'string'
                        ? JSON.parse(order.service_data)
                        : order.service_data;
                      const isExpired = order.daysLeft !== undefined && order.daysLeft <= 0;
                      const canDownload = order.status === 'completed' && !isExpired;
                      const canResume = order.status === 'fulfilled' && order.file_path;

                      return (
                        <div key={order.order_id || idx} className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                          {/* Header: Order ID & Status */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-400" />
                              <span className="text-xs text-slate-500 font-mono">
                                {order.order_id?.slice(0, 16) || 'N/A'}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                              order.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                              order.status === 'fulfilled' ? 'bg-blue-900/50 text-blue-400' :
                              'bg-yellow-900/50 text-yellow-400'
                            }`}>
                              {order.status === 'completed' ? '已完成' :
                               order.status === 'fulfilled' ? '已付款' : '待付款'}
                            </span>
                          </div>

                          {/* File Info */}
                          <div className="mb-3">
                            <p className="text-white font-medium truncate" title={serviceData?.fileName}>
                              {serviceData?.fileName || '未知檔案'}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                              <span>{serviceData?.charCount?.toLocaleString() || 0} 字</span>
                              <span>${order.amount_usd?.toFixed(2) || '0.00'} USD</span>
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Expiry & Actions */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                            {/* Days Left */}
                            {order.status === 'completed' && (
                              <div className="flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                {isExpired ? (
                                  <span className="text-red-400">已過期</span>
                                ) : (
                                  <span className="text-green-400">剩餘 {order.daysLeft} 天可下載</span>
                                )}
                              </div>
                            )}
                            {order.status !== 'completed' && <div />}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {canResume && (
                                <button
                                  onClick={() => {
                                    // Open game with resume params
                                    const resumeUrl = `${game.gameUrl}?resume=${order.order_id}`;
                                    window.open(resumeUrl, '_blank');
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  繼續翻譯
                                </button>
                              )}
                              {canDownload && (
                                <button
                                  onClick={() => {
                                    window.open(`/api/service/${order.order_id}/download`, '_blank');
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors"
                                >
                                  <Download className="h-3 w-3" />
                                  下載結果
                                </button>
                              )}
                              {order.status === 'pending' && (
                                <span className="text-xs text-yellow-400">等待付款完成</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Game Scores Display */
                  <div className="space-y-2">
                    {myHistory.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700">
                        <div className="text-slate-400 text-sm">
                          {new Date(entry.created_at).toLocaleString()}
                        </div>
                        <span className="text-xl font-mono font-bold text-nexus-accent">{entry.score.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default GameDetailsModal;
