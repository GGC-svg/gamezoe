import React, { useState, useEffect } from 'react';
import { X, User, Mail, Calendar, Gamepad2, CreditCard, Clock, Shield, Gift, Ban, ChevronRight, Loader2 } from 'lucide-react';

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    adminId: string;
    adminName: string;
}

interface UserInfo {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    gold_balance: number;
    silver_balance: number;
    created_at: string;
    suspended_until: string | null;
}

interface GameRecord {
    game_id: string;
    game_title: string;
    total_playtime: number;
    last_played: string;
    play_count: number;
}

interface TransactionRecord {
    id: number;
    order_id?: string;
    amount: number;
    currency: string;
    type: string;
    description: string;
    created_at: string;
    p99_rrn?: string;
    amount_usd?: number;
    balance_after?: number;
}

interface LoginLog {
    id: number;
    login_time: string;
    ip_address: string;
}

interface AwardRecord {
    id: number;
    amount: number;
    currency: string;
    reason: string;
    admin_id: string;
    admin_name: string;
    created_at: string;
}

const SUSPENSION_OPTIONS = [
    { label: '1 小時', value: 1 },
    { label: '6 小時', value: 6 },
    { label: '1 天', value: 24 },
    { label: '3 天', value: 72 },
    { label: '7 天', value: 168 },
    { label: '1 個月', value: 720 },
    { label: '1 年', value: 8760 },
    { label: '10 年', value: 87600 },
];

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, userId, adminId, adminName }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'games' | 'transactions' | 'logins' | 'awards'>('info');
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
    const [awardRecords, setAwardRecords] = useState<AwardRecord[]>([]);

    // Award Form
    const [awardAmount, setAwardAmount] = useState('');
    const [awardCurrency, setAwardCurrency] = useState<'gold' | 'silver'>('gold');
    const [awardReason, setAwardReason] = useState('');
    const [awarding, setAwarding] = useState(false);

    // Suspension
    const [suspending, setSuspending] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserDetails();
        }
    }, [isOpen, userId]);

    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            const [infoRes, gamesRes, txRes, loginsRes, awardsRes] = await Promise.all([
                fetch(`/api/admin/users/${userId}/info`),
                fetch(`/api/admin/users/${userId}/games`),
                fetch(`/api/admin/users/${userId}/transactions`),
                fetch(`/api/admin/users/${userId}/logins`),
                fetch(`/api/admin/users/${userId}/awards`)
            ]);

            if (infoRes.ok) setUserInfo(await infoRes.json());
            if (gamesRes.ok) setGameRecords(await gamesRes.json());
            if (txRes.ok) setTransactions(await txRes.json());
            if (loginsRes.ok) setLoginLogs(await loginsRes.json());
            if (awardsRes.ok) setAwardRecords(await awardsRes.json());
        } catch (err) {
            console.error('Failed to fetch user details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async () => {
        if (!userInfo) return;
        const newRole = userInfo.role === 'admin' ? 'user' : 'admin';
        const action = newRole === 'admin' ? '升級為管理員' : '移除管理員權限';

        if (!confirm(`確認要將 ${userInfo.name} ${action}？`)) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole, adminId })
            });

            if (res.ok) {
                setUserInfo({ ...userInfo, role: newRole });
                alert(`已成功${action}`);
            } else {
                alert('操作失敗');
            }
        } catch (err) {
            alert('操作失敗');
        }
    };

    const handleAward = async () => {
        if (!awardAmount || !awardReason) {
            alert('請填寫金額和原因');
            return;
        }

        setAwarding(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}/award`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(awardAmount),
                    currency: awardCurrency,
                    reason: awardReason,
                    adminId,
                    adminName
                })
            });

            if (res.ok) {
                alert('發贈成功！');
                setAwardAmount('');
                setAwardReason('');
                fetchUserDetails();
            } else {
                alert('發贈失敗');
            }
        } catch (err) {
            alert('發贈失敗');
        } finally {
            setAwarding(false);
        }
    };

    const handleSuspend = async (hours: number) => {
        if (!confirm(`確認要停權 ${userInfo?.name} ${hours} 小時？`)) return;

        setSuspending(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}/suspend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hours, adminId, adminName })
            });

            if (res.ok) {
                alert('停權成功');
                fetchUserDetails();
            } else {
                alert('停權失敗');
            }
        } catch (err) {
            alert('停權失敗');
        } finally {
            setSuspending(false);
        }
    };

    const handleUnsuspend = async () => {
        if (!confirm(`確認要解除 ${userInfo?.name} 的停權？`)) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}/unsuspend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId, adminName })
            });

            if (res.ok) {
                alert('已解除停權');
                fetchUserDetails();
            } else {
                alert('操作失敗');
            }
        } catch (err) {
            alert('操作失敗');
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('zh-TW');
    };

    const formatPlaytime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-nexus-accent" />
                        用戶詳情
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-nexus-accent" />
                    </div>
                ) : (
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar */}
                        <div className="w-64 border-r border-slate-700 bg-slate-800/50 p-4 space-y-2">
                            {/* User Quick Info */}
                            {userInfo && (
                                <div className="mb-6 text-center">
                                    <img src={userInfo.avatar || 'https://via.placeholder.com/80'} alt="" className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-slate-600" />
                                    <p className="font-bold text-white">{userInfo.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{userInfo.email}</p>
                                    <div className="mt-2 flex justify-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded ${userInfo.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                            {userInfo.role === 'admin' ? '管理員' : '一般用戶'}
                                        </span>
                                        {userInfo.suspended_until && new Date(userInfo.suspended_until) > new Date() && (
                                            <span className="text-xs px-2 py-1 rounded bg-red-600 text-white">停權中</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tabs */}
                            <button onClick={() => setActiveTab('info')} className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${activeTab === 'info' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                                <User className="h-4 w-4" /> 基本資料
                            </button>
                            <button onClick={() => setActiveTab('games')} className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${activeTab === 'games' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                                <Gamepad2 className="h-4 w-4" /> 遊戲紀錄
                            </button>
                            <button onClick={() => setActiveTab('transactions')} className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${activeTab === 'transactions' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                                <CreditCard className="h-4 w-4" /> 交易紀錄
                            </button>
                            <button onClick={() => setActiveTab('logins')} className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${activeTab === 'logins' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                                <Clock className="h-4 w-4" /> 登入日誌
                            </button>
                            <button onClick={() => setActiveTab('awards')} className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${activeTab === 'awards' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                                <Gift className="h-4 w-4" /> 發贈紀錄
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Info Tab */}
                            {activeTab === 'info' && userInfo && (
                                <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-bold text-white mb-4">基本資料</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">用戶 ID</p>
                                                <p className="text-white font-mono text-sm break-all">{userInfo.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">姓名</p>
                                                <p className="text-white">{userInfo.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Email</p>
                                                <p className="text-white">{userInfo.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">註冊日期</p>
                                                <p className="text-white">{formatDate(userInfo.created_at)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">金幣餘額</p>
                                                <p className="text-yellow-400 font-bold">{userInfo.gold_balance} G</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">銀幣餘額</p>
                                                <p className="text-slate-300 font-bold">{userInfo.silver_balance} S</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role Management */}
                                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-purple-400" />
                                            權限管理
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white">目前權限: <span className={userInfo.role === 'admin' ? 'text-purple-400 font-bold' : 'text-slate-400'}>{userInfo.role === 'admin' ? '管理員' : '一般用戶'}</span></p>
                                            </div>
                                            <button
                                                onClick={handleToggleAdmin}
                                                className={`px-4 py-2 rounded-lg font-bold transition-colors ${userInfo.role === 'admin' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                                            >
                                                {userInfo.role === 'admin' ? '移除管理員' : '設為管理員'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Award Points */}
                                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Gift className="h-5 w-5 text-green-400" />
                                            發贈點數
                                        </h3>
                                        <div className="flex gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="text-xs text-slate-500 block mb-1">金額</label>
                                                <input
                                                    type="number"
                                                    value={awardAmount}
                                                    onChange={e => setAwardAmount(e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
                                                    placeholder="輸入金額"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <label className="text-xs text-slate-500 block mb-1">幣種</label>
                                                <select
                                                    value={awardCurrency}
                                                    onChange={e => setAwardCurrency(e.target.value as 'gold' | 'silver')}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
                                                >
                                                    <option value="gold">金幣</option>
                                                    <option value="silver">銀幣</option>
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-slate-500 block mb-1">原因</label>
                                                <input
                                                    type="text"
                                                    value={awardReason}
                                                    onChange={e => setAwardReason(e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
                                                    placeholder="發贈原因"
                                                />
                                            </div>
                                            <button
                                                onClick={handleAward}
                                                disabled={awarding}
                                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                                            >
                                                {awarding ? '處理中...' : '發贈'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Suspension */}
                                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Ban className="h-5 w-5 text-red-400" />
                                            帳號停權
                                        </h3>

                                        {userInfo.suspended_until && new Date(userInfo.suspended_until) > new Date() ? (
                                            <div className="space-y-4">
                                                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                                                    <p className="text-red-400 font-bold">此帳號目前處於停權狀態</p>
                                                    <p className="text-sm text-slate-400">停權至: {formatDate(userInfo.suspended_until)}</p>
                                                </div>
                                                <button
                                                    onClick={handleUnsuspend}
                                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold"
                                                >
                                                    解除停權
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-4 gap-2">
                                                {SUSPENSION_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => handleSuspend(opt.value)}
                                                        disabled={suspending}
                                                        className="bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Games Tab */}
                            {activeTab === 'games' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white mb-4">遊戲紀錄</h3>
                                    {gameRecords.length === 0 ? (
                                        <p className="text-slate-500 text-center py-8">尚無遊戲紀錄</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {gameRecords.map((record, i) => (
                                                <div key={i} className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-white">{record.game_title}</p>
                                                        <p className="text-sm text-slate-400">遊玩次數: {record.play_count}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-nexus-accent font-mono">{formatPlaytime(record.total_playtime)}</p>
                                                        <p className="text-xs text-slate-500">最後遊玩: {formatDate(record.last_played)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Transactions Tab */}
                            {activeTab === 'transactions' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white mb-4">交易紀錄</h3>
                                    {transactions.length === 0 ? (
                                        <p className="text-slate-500 text-center py-8">尚無交易紀錄</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {transactions.map((tx) => (
                                                <div key={tx.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="font-bold text-white">{tx.description || tx.type}</p>
                                                            <p className="text-xs text-slate-500">{formatDate(tx.created_at)}</p>
                                                            {/* Order IDs */}
                                                            {tx.order_id && (
                                                                <div className="mt-2 space-y-1">
                                                                    <p className="text-xs font-mono text-yellow-400">
                                                                        單號: {tx.order_id}
                                                                    </p>
                                                                    {tx.p99_rrn && (
                                                                        <p className="text-xs font-mono text-blue-400">
                                                                            P99: {tx.p99_rrn}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`font-mono font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.currency === 'gold' ? 'G' : 'S'}
                                                            </p>
                                                            {tx.amount_usd && (
                                                                <p className="text-xs text-slate-400">${tx.amount_usd} USD</p>
                                                            )}
                                                            {tx.balance_after !== undefined && tx.currency === 'gold' && (
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    餘額: {tx.balance_after} G
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Logins Tab */}
                            {activeTab === 'logins' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white mb-4">登入日誌 (最近 50 筆)</h3>
                                    {loginLogs.length === 0 ? (
                                        <p className="text-slate-500 text-center py-8">尚無登入紀錄</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {loginLogs.map((log) => (
                                                <div key={log.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex items-center justify-between">
                                                    <p className="text-white">{formatDate(log.login_time)}</p>
                                                    <p className="text-slate-400 font-mono text-sm">{log.ip_address}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Awards Tab */}
                            {activeTab === 'awards' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white mb-4">發贈紀錄</h3>
                                    {awardRecords.length === 0 ? (
                                        <p className="text-slate-500 text-center py-8">尚無發贈紀錄</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {awardRecords.map((award) => (
                                                <div key={award.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className={`font-mono font-bold ${award.currency === 'gold' ? 'text-yellow-400' : 'text-slate-300'}`}>
                                                            +{award.amount} {award.currency === 'gold' ? 'G' : 'S'}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{formatDate(award.created_at)}</p>
                                                    </div>
                                                    <p className="text-white text-sm">{award.reason}</p>
                                                    <p className="text-xs text-slate-500 mt-1">發贈者: {award.admin_name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDetailModal;
