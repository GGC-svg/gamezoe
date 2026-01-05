import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Coins, History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onTopUpSuccess: (newBalance: { gold_balance: number; silver_balance: number }) => void;
}

interface Transaction {
    id: number;
    amount: number;
    currency: 'gold' | 'silver' | 'mixed';
    type: string;
    description: string;
    created_at: string;
}

const TOPUP_TIERS = [
    { price: 0.99, gold: 99, label: '$0.99' },
    { price: 3, gold: 300, label: '$3.00' },
    { price: 5, gold: 500, label: '$5.00' },
    { price: 10, gold: 1000, label: '$10.00' },
    { price: 20, gold: 2000, label: '$20.00' },
    { price: 30, gold: 3000, label: '$30.00' },
    { price: 40, gold: 4000, label: '$40.00' },
    { price: 50, gold: 5000, label: '$50.00' },
    { price: 60, gold: 6000, label: '$60.00' },
    { price: 70, gold: 7000, label: '$70.00' },
    { price: 100, gold: 10000, label: '$100.00' },
    { price: 150, gold: 15000, label: '$150.00' },
    { price: 200, gold: 20000, label: '$200.00' },
    { price: 300, gold: 30000, label: '$300.00' },
    { price: 500, gold: 50000, label: '$500.00' },
    { price: 1000, gold: 100000, label: '$1000.00' },
    { price: 2000, gold: 200000, label: '$2000.00' },
    { price: 3000, gold: 300000, label: '$3000.00' },
    { price: 5000, gold: 500000, label: '$5000.00' },
];

const API_BASE = '/api'; // Use relative path for proxy

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, userId, onTopUpSuccess }) => {
    const [activeTab, setActiveTab] = useState<'topup' | 'history'>('topup');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (isOpen && activeTab === 'history') {
            fetchHistory();
        }
    }, [isOpen, activeTab]);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_BASE}/wallet/transactions/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (e) {
            console.error("Failed to fetch transactions");
        }
    };

    if (!isOpen) return null;

    const handleTopUp = async (tier: typeof TOPUP_TIERS[0]) => {
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const response = await fetch(`${API_BASE}/wallet/topup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amountUSD: tier.price }),
            });

            if (!response.ok) {
                throw new Error('Top-up failed');
            }

            const data = await response.json();
            if (data.success) {
                setSuccessMsg(`Successfully added ${data.addedGold} Gold!`);
                onTopUpSuccess(data.newBalance);
                setTimeout(() => {
                    setSuccessMsg(null);
                    // Don't close, user might want to check history or add more
                }, 1500);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (err: any) {
            setError(err.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white">我的錢包</h2>

                        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                            <button
                                onClick={() => setActiveTab('topup')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'topup'
                                    ? 'bg-nexus-accent text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Coins className="h-4 w-4" />
                                    儲值
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'history'
                                    ? 'bg-nexus-accent text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <History className="h-4 w-4" />
                                    交易紀錄
                                </div>
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent relative">

                    {activeTab === 'topup' ? (
                        <>
                            {/* Top Up View */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-yellow-500/20 rounded-lg">
                                    <Coins className="h-6 w-6 text-yellow-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">選擇儲值金額</h3>
                                    <p className="text-sm text-slate-400">匯率: 1 USD = 100 Gold</p>
                                </div>
                            </div>

                            {/* Messages Toast Overlay */}
                            {(error || successMsg) && (
                                <div className="absolute top-4 left-0 right-0 z-50 flex justify-center px-4 animate-fade-in pointer-events-none">
                                    <div className={`p-3 rounded-xl shadow-xl flex items-center gap-3 border backdrop-blur-md pointer-events-auto ${error
                                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                        : 'bg-green-500/10 border-green-500/20 text-green-400'
                                        }`}>
                                        {error ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                                        <span className="font-medium">{error || successMsg}</span>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {TOPUP_TIERS.map((tier) => (
                                    <button
                                        key={tier.price}
                                        disabled={loading}
                                        onClick={() => handleTopUp(tier)}
                                        className="group relative flex flex-col items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 border-2 border-slate-700 hover:border-nexus-accent rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="text-center mb-3">
                                            <span className="block text-2xl font-bold text-yellow-500 group-hover:scale-110 transition-transform">{tier.gold.toLocaleString()}</span>
                                            <span className="text-xs text-yellow-500/60 font-medium">GOLD</span>
                                        </div>

                                        <div className="w-full py-2 bg-slate-700 group-hover:bg-nexus-accent rounded-lg text-center transition-colors">
                                            <span className="text-white font-bold">{tier.label}</span>
                                        </div>

                                        {tier.price === 100 && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                                                熱銷
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* History View */}
                            <div className="space-y-4">
                                {transactions.length === 0 ? (
                                    <div className="text-center text-slate-500 py-12">
                                        <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>尚無交易紀錄</p>
                                    </div>
                                ) : (
                                    transactions.map(tx => (
                                        <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                    {tx.amount > 0 ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{tx.description}</p>
                                                    <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                </p>
                                                <p className="text-xs uppercase text-slate-500 font-medium">{tx.currency}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-800/30 text-center text-xs text-slate-500">
                    安全支付保護。所有交易皆無法退款。
                </div>
            </div>
        </div>
    );
};

export default WalletModal;
