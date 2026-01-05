import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, RefreshCw, ExternalLink } from 'lucide-react';
import { Game } from '../types';

import { User } from '../types';

interface GamePlayerProps {
    game: Game;
    onClose: () => void;
    currentUser: User | null;
    expiresAt?: string | null;
}

const GamePlayer: React.FC<GamePlayerProps> = ({ game, onClose, currentUser, expiresAt }) => {
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [iframeError, setIframeError] = useState(false);

    // Tracking Logic
    useEffect(() => {
        let activityId: number | null = null;
        let heartbeatInterval: NodeJS.Timeout;

        if (currentUser) {
            // 1. Start Activity
            const startActivity = async () => {
                try {
                    const res = await fetch('/api/activity/start', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: currentUser.id, gameId: game.id })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data.activityId) {
                            activityId = data.activityId;
                            // 2. Start Heartbeat (every 60s)
                            heartbeatInterval = setInterval(() => {
                                fetch('/api/activity/heartbeat', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ activityId })
                                }).catch(err => console.warn("Heartbeat failed", err));
                            }, 60000);
                        }
                    }
                } catch (err) {
                    console.error("Failed to start activity tracking", err);
                    // Do NOT close the window, just log error.
                }
            };
            startActivity();
        }

        // Basic loading simulation for iframe
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        return () => {
            clearTimeout(timer);
            if (heartbeatInterval) clearInterval(heartbeatInterval);
        };
    }, [game.id, currentUser]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
        }
    };

    const handleOpenExternal = () => {
        if (game.gameUrl) {
            window.open(game.gameUrl, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
            {/* Top Bar */}
            <div className="h-12 bg-nexus-900 border-b border-slate-800 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300 tracking-wider text-xs md:text-base">正在遊玩:</span>
                        <span className="font-bold text-nexus-accent text-xs md:text-base truncate max-w-[150px] md:max-w-xs">{game.title.toUpperCase()}</span>
                    </div>

                    {/* Expiration Timer */}
                    {(() => {
                        // Use explicit prop first, fallback to finding in library (redundant but safe)
                        const expiration = expiresAt || currentUser?.library?.find(l => l.gameId === game.id)?.expiresAt;

                        if (expiration) {
                            const expires = new Date(expiration).getTime();
                            // Initial calc
                            const [timeLeft, setTimeLeft] = useState(expires - Date.now());

                            useEffect(() => {
                                // Update immediately
                                setTimeLeft(expires - Date.now());

                                const timer = setInterval(() => {
                                    const diff = expires - Date.now();
                                    setTimeLeft(diff);
                                    if (diff <= 0) clearInterval(timer);
                                }, 1000);
                                return () => clearInterval(timer);
                            }, [expires]);

                            if (timeLeft <= 0) return <span className="text-red-500 font-bold text-xs md:text-sm">遊戲時數已結束</span>;

                            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                            return (
                                <div className="hidden md:flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                    <span className="text-slate-400 text-xs">剩餘遊戲時間:</span>
                                    <span className="text-yellow-400 font-mono font-bold text-sm">
                                        {days > 0 ? `${days}天 ` : ''}
                                        {hours.toString().padStart(2, '0')}:
                                        {minutes.toString().padStart(2, '0')}:
                                        {seconds.toString().padStart(2, '0')}
                                    </span>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={handleOpenExternal} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs md:text-sm px-2 py-1 rounded hover:bg-slate-800 transition-colors" title="在新視窗開啟">
                        <ExternalLink className="h-4 w-4" />
                        <span className="hidden md:inline">新視窗開啟</span>
                    </button>
                    <button onClick={() => { setLoading(true); setIframeError(false); setTimeout(() => setLoading(false), 1000); }} className="text-slate-400 hover:text-white p-1" title="重新載入">
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white p-1" title="全螢幕">
                        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </button>
                    <button onClick={onClose} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm font-bold ml-2">
                        離開遊戲
                    </button>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-grow relative bg-slate-900 flex items-center justify-center overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 z-20 bg-nexus-900 flex flex-col items-center justify-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-nexus-accent mb-4"></div>
                        <h2 className="text-xl font-bold text-white animate-pulse">載入遊戲資源中...</h2>
                        <p className="text-slate-500 mt-2">正在連線至 {game.developer} 遊戲伺服器...</p>
                    </div>
                )}

                {game.gameUrl ? (
                    <iframe
                        src={`${game.gameUrl}${game.gameUrl.includes('?') ? '&' : '?'}userId=${currentUser?.id || ''}&gameId=${game.id}`}
                        title={game.title}
                        className="w-full h-full border-0 bg-white"
                        allow="autoplay; fullscreen; gamepad; acceleration; gyroscope"
                        onError={() => setIframeError(true)}
                    />
                ) : (
                    <div className="text-center p-8">
                        <h3 className="text-xl text-red-400 font-bold mb-2">無效的遊戲連結</h3>
                        <p className="text-slate-400">此遊戲尚未設定啟動連結，請聯繫管理員。</p>
                    </div>
                )}

                {/* Fallback overlay if iframe might fail or for better UX */}
                {iframeError && (
                    <div className="absolute inset-0 z-10 bg-slate-900/90 flex flex-col items-center justify-center p-4">
                        <h3 className="text-xl text-white font-bold mb-2">無法在視窗中載入遊戲</h3>
                        <p className="text-slate-400 mb-4">部分遊戲可能不支援嵌入式遊玩。</p>
                        <button
                            onClick={handleOpenExternal}
                            className="bg-nexus-accent hover:bg-nexus-accentHover text-white px-6 py-3 rounded-lg font-bold"
                        >
                            在新視窗中開啟遊戲
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamePlayer;