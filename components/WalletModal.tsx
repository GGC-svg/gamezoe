import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Coins, History, ArrowUpRight, ArrowDownLeft, CreditCard, Loader2 } from 'lucide-react';

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onTopUpSuccess: (newBalance: { gold_balance: number; silver_balance: number }) => void;
}

interface Transaction {
    id: number;
    order_id?: string;
    amount: number;
    currency: 'gold' | 'silver' | 'mixed' | 'game_point';
    type: string;
    description: string;
    created_at: string;
    p99_rrn?: string;
    balance_after?: number;
    game_id?: string;
    game_title?: string;
    amount_usd?: number;
}

// Transaction type mapping to Chinese
const TX_TYPE_LABELS: Record<string, string> = {
    'deposit': '儲值',
    'transfer': '轉點',
    'transfer_out': '轉點',
    'service': '服務消費',
    'purchase': '購買',
    'refund': '退款',
    'game_deposit': '轉點',
    'game_withdraw': '從遊戲提出',
    'game_rental': '遊戲消費',
    'game_win': '遊戲獲勝',
    'casino_deposit': '轉點',
    'top_up': '管理員加值',
    'admin_award': '管理員獎勵',
    'WITHDRAW': '從遊戲提出'
};

const TOPUP_TIERS = [
    { price: 1, gold: 100, label: '$1.00' },
    { price: 3, gold: 300, label: '$3.00' },
    { price: 5, gold: 500, label: '$5.00' },
    { price: 10, gold: 1000, label: '$10.00' },
    { price: 20, gold: 2000, label: '$20.00' },
    { price: 30, gold: 3000, label: '$30.00' },
    { price: 50, gold: 5000, label: '$50.00' },
    { price: 100, gold: 10000, label: '$100.00' },
    { price: 200, gold: 20000, label: '$200.00' },
    { price: 500, gold: 50000, label: '$500.00' },
    { price: 1000, gold: 100000, label: '$1000.00' },
    { price: 3000, gold: 300000, label: '$3000.00' },
    { price: 5000, gold: 500000, label: '$5000.00' },
    { price: 10000, gold: 1000000, label: '$10000.00' },
];

const API_BASE = '/api';

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, userId, onTopUpSuccess }) => {
    const [activeTab, setActiveTab] = useState<'topup' | 'history'>('topup');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [addedGold, setAddedGold] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // P99PAY payment state
    const [selectedTier, setSelectedTier] = useState<typeof TOPUP_TIERS[0] | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Hidden form for P99PAY redirect
    const p99FormRef = useRef<HTMLFormElement>(null);
    const [p99FormData, setP99FormData] = useState<{ apiUrl: string; data: string } | null>(null);

    // Check URL params for payment callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const gold = urlParams.get('gold');
        const orderId = urlParams.get('orderId');
        const pending = urlParams.get('pending');
        const errorParam = urlParams.get('error');

        if (success === 'true' && gold) {
            setAddedGold(parseInt(gold));
            setShowSuccessPopup(true);
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
            // Refresh balance
            refreshBalance();
        } else if (pending === 'true' && orderId) {
            setSuccessMsg(`訂單 ${orderId} 處理中，請稍後查看交易紀錄`);
            window.history.replaceState({}, '', window.location.pathname);
        } else if (errorParam) {
            const rcode = urlParams.get('rcode');
            setError(getErrorMessage(errorParam, rcode || undefined));
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    // Auto-submit P99 form when data is ready
    useEffect(() => {
        if (p99FormData && p99FormRef.current) {
            p99FormRef.current.submit();
        }
    }, [p99FormData]);

    useEffect(() => {
        if (isOpen && activeTab === 'history') {
            fetchHistory();
        }
    }, [isOpen, activeTab]);

    const getErrorMessage = (errorCode: string, rcode?: string): string => {
        // P99 official RCODE error codes (from P99 API doc v1.2.3)
        const p99ErrorCodes: Record<string, string> = {
            // 系統錯誤
            '1001': '驗證碼錯誤，請重試',
            '1101': '訊息格式錯誤',
            '1102': '幣別代碼錯誤',
            '1103': '金額格式錯誤',
            '1109': '不支援的幣別',
            '1110': '不支援小數金額',
            '1205': '不合法的網路位址',
            '1301': '不支援的付款方式',
            '1401': '找不到訂單編號',
            '1402': '交易內容與原始交易不一致',
            '1501': '超過交易限額',
            '1505': '不允許使用此幣別',
            '1601': '商家代碼未啟用',
            // 交易狀態
            '2001': '訂單編號重複，請重新操作',
            '3004': '付款待確認中，請稍候',
            '3005': '交易逾時，請重新操作',
            // PIN 卡相關錯誤
            '3901': 'PIN 面額與交易金額不符',
            '3902': 'PIN 碼已被鎖定，請聯繫 KIWI 客服',
            '3903': 'PIN 碼已被使用',
            '3904': 'PIN 碼錯誤',
            '3905': 'PIN 碼尚未啟用，請聯繫 KIWI 客服',
            '3906': 'PIN 碼為專用卡，無法使用',
            '3907': '不允許使用此通路的 PIN 卡',
            '3908': '不允許使用此地區的 PIN 卡',
            '3909': 'PIN 卡幣別與交易幣別不一致',
            '3910': 'PIN 卡剩餘點數不足',
            // 系統異常
            '9998': '系統繁忙，請稍後再試',
            '9999': '系統異常，請聯繫客服',
        };

        // 我方內部錯誤訊息
        const errorMessages: Record<string, string> = {
            'no_data': '支付回傳資料異常，請聯繫客服',
            'parse_failed': '支付資料解析失敗，請聯繫客服',
            'payment_failed': rcode && p99ErrorCodes[rcode]
                ? p99ErrorCodes[rcode]
                : '支付失敗，請重試',
            'order_not_found': '訂單不存在，請聯繫客服並提供訂單編號',
            'credit_failed': 'G幣入帳失敗，請聯繫客服',
            'db_error': '系統資料庫錯誤，請聯繫客服',
        };

        // If rcode exists and we have a mapping, show it
        if (rcode && p99ErrorCodes[rcode]) {
            return p99ErrorCodes[rcode];
        }

        return errorMessages[errorCode] || `支付錯誤 (${errorCode}${rcode ? `, 代碼: ${rcode}` : ''})`;
    };

    const refreshBalance = async () => {
        try {
            const res = await fetch(`${API_BASE}/wallet/balance/${userId}`);
            if (res.ok) {
                const balance = await res.json();
                onTopUpSuccess(balance);
            }
        } catch (e) {
            console.error("Failed to refresh balance");
        }
    };

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

    const handleTierSelect = (tier: typeof TOPUP_TIERS[0]) => {
        setSelectedTier(tier);
        setShowConfirmModal(true);
        setError(null);
    };

    const handleP99Payment = async () => {
        if (!selectedTier) return;

        setLoading(true);
        setError(null);

        try {
            // paymentMethod 為空，讓 P99PAY 顯示支付選項頁面
            const response = await fetch(`${API_BASE}/payment/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    amountUSD: selectedTier.price,
                    paymentMethod: '', // 空值讓 P99 顯示選擇頁
                    productName: `GameZoe Gold x${selectedTier.gold}`
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to create order');
            }

            const data = await response.json();
            if (data.success) {
                // Set form data and trigger redirect
                setP99FormData({
                    apiUrl: data.apiUrl,
                    data: data.formData
                });
            } else {
                throw new Error(data.error || 'Order creation failed');
            }
        } catch (err: any) {
            setError(err.message || '建立訂單失敗');
            setLoading(false);
        }
    };

    const handleCancelPayment = () => {
        setSelectedTier(null);
        setShowConfirmModal(false);
        setError(null);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            {/* Hidden P99PAY Form for redirect */}
            {p99FormData && (
                <form
                    ref={p99FormRef}
                    action={p99FormData.apiUrl}
                    method="POST"
                    style={{ display: 'none' }}
                >
                    <input type="hidden" name="data" value={p99FormData.data} />
                </form>
            )}

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-800 border border-green-500/50 rounded-2xl p-8 max-w-md text-center shadow-2xl animate-slide-up">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-12 w-12 text-green-500 animate-bounce" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">儲值成功！</h3>
                        <p className="text-slate-400 mb-4">您的金幣已成功儲值</p>
                        <div className="flex items-center justify-center gap-2 text-4xl font-black text-yellow-500 mb-6">
                            <Coins className="h-10 w-10" />
                            <span>+{addedGold.toLocaleString()}</span>
                            <span className="text-yellow-400 text-2xl">G</span>
                        </div>
                        <button
                            onClick={() => {
                                setShowSuccessPopup(false);
                                refreshBalance();
                            }}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                            確認
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Payment Modal */}
            {showConfirmModal && selectedTier && (
                <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">確認儲值</h3>
                            <button
                                onClick={handleCancelPayment}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-700">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">儲值金額</span>
                                <span className="text-white font-bold">{selectedTier.label} USD</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-slate-400">獲得金幣</span>
                                <span className="text-yellow-500 font-bold flex items-center gap-1">
                                    <Coins className="h-4 w-4" />
                                    {selectedTier.gold.toLocaleString()} G
                                </span>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <p className="text-sm text-blue-300">
                                點擊「前往付款」後將跳轉至 P99PAY 安全支付頁面，您可在該頁面選擇付款方式（KIWI 點數卡或 KIWI 錢包）。
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelPayment}
                                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleP99Payment}
                                disabled={loading}
                                className="flex-1 py-3 bg-nexus-accent hover:bg-nexus-accent/80 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        處理中...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-5 w-5" />
                                        前往付款
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                    <p className="text-sm text-slate-400">匯率: 1 USD = 100 Gold | 支援 KIWI 點數卡 / 錢包</p>
                                </div>
                            </div>

                            {/* Messages Toast Overlay */}
                            {(error || successMsg) && !showConfirmModal && (
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

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {TOPUP_TIERS.map((tier) => (
                                    <button
                                        key={tier.price}
                                        disabled={loading}
                                        onClick={() => handleTierSelect(tier)}
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

                            {/* Payment Provider Info */}
                            <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <CreditCard className="h-5 w-5" />
                                    <span className="text-sm">支付服務由 <span className="text-white font-medium">P99PAY</span> 提供 | 支援 KIWI 點數卡 & KIWI 錢包</span>
                                </div>
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
                                                    {/* Type Badge + Project */}
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                            tx.type === 'deposit' ? 'bg-green-900/50 text-green-400' :
                                                            tx.type === 'transfer' ? 'bg-blue-900/50 text-blue-400' :
                                                            tx.type === 'service' ? 'bg-purple-900/50 text-purple-400' :
                                                            tx.type === 'purchase' ? 'bg-yellow-900/50 text-yellow-400' :
                                                            tx.type === 'refund' ? 'bg-red-900/50 text-red-400' :
                                                            'bg-slate-700 text-slate-300'
                                                        }`}>
                                                            {TX_TYPE_LABELS[tx.type] || tx.type}
                                                        </span>
                                                        {(tx.game_title || tx.game_id) && (
                                                            <span className="text-xs text-slate-400">{tx.game_title || tx.game_id}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-white">{tx.description}</p>
                                                    <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleString()}</p>
                                                    {tx.order_id && (
                                                        <p className="text-xs text-slate-600 font-mono mt-1">
                                                            單號: {tx.order_id}
                                                            {tx.p99_rrn && <span className="ml-2 text-blue-400">P99: {tx.p99_rrn}</span>}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                </p>
                                                <p className="text-xs uppercase text-slate-500 font-medium">
                                                    {tx.currency === 'game_point' ? '遊戲點' : tx.currency === 'gold' ? 'G' : 'S'}
                                                </p>
                                                {tx.amount_usd && (
                                                    <p className="text-xs text-slate-400">${Number(tx.amount_usd).toFixed(2)} USD</p>
                                                )}
                                                {tx.balance_after !== undefined && (
                                                    <p className="text-xs text-yellow-500/70 mt-1">
                                                        餘額: {tx.balance_after.toLocaleString()} {tx.currency === 'game_point' ? '點' : 'G'}
                                                    </p>
                                                )}
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
                    安全支付保護 | 交易由 P99PAY 處理 | 所有交易皆無法退款
                </div>
            </div>
        </div>
    );
};

export default WalletModal;
