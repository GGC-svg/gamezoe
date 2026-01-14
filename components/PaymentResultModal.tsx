import React from 'react';
import { CheckCircle, XCircle, Clock, X } from 'lucide-react';

interface PaymentResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: 'success' | 'error' | 'pending' | null;
    errorCode?: string;
    rcode?: string;
    amount?: number;
}

const PaymentResultModal: React.FC<PaymentResultModalProps> = ({
    isOpen,
    onClose,
    result,
    errorCode,
    rcode,
    amount
}) => {
    if (!isOpen || !result) return null;

    // P99 官方 RCODE 錯誤碼對照表 (API v1.2.3 附件八)
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

    // 內部錯誤訊息
    const internalErrors: Record<string, string> = {
        'no_data': '支付回傳資料異常',
        'parse_failed': '支付資料解析失敗',
        'payment_failed': '支付未完成',
        'order_not_found': '訂單不存在',
        'credit_failed': 'G幣入帳失敗',
        'db_error': '系統資料庫錯誤',
    };

    const getErrorMessage = (): string => {
        // P99 RCODE 優先
        if (rcode && p99ErrorCodes[rcode]) {
            return p99ErrorCodes[rcode];
        }
        // 內部錯誤碼
        if (errorCode && internalErrors[errorCode]) {
            return internalErrors[errorCode];
        }
        // 預設訊息
        return '支付失敗，請重試';
    };

    const getErrorDetail = (): string | null => {
        if (rcode) {
            return `錯誤代碼: ${rcode}`;
        }
        if (errorCode && errorCode !== 'payment_failed') {
            return `錯誤類型: ${errorCode}`;
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md">
            <div className="relative w-full max-w-md mx-4">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-slate-400 hover:text-white p-2 transition-colors"
                >
                    <X className="h-8 w-8" />
                </button>

                {/* Result Card */}
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    {/* Success */}
                    {result === 'success' && (
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                                    <CheckCircle className="h-16 w-16 text-green-400" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">支付成功</h2>
                            {amount && (
                                <p className="text-xl text-green-400 font-bold mb-4">
                                    +{amount} G 幣已入帳
                                </p>
                            )}
                            <p className="text-slate-400 mb-8">
                                感謝您的儲值！金幣已加入您的帳戶。
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
                            >
                                確認
                            </button>
                        </div>
                    )}

                    {/* Error */}
                    {result === 'error' && (
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
                                    <XCircle className="h-16 w-16 text-red-400" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">支付失敗</h2>
                            <p className="text-xl text-red-400 font-medium mb-2">
                                {getErrorMessage()}
                            </p>
                            {getErrorDetail() && (
                                <p className="text-sm text-slate-500 font-mono mb-4">
                                    {getErrorDetail()}
                                </p>
                            )}
                            <p className="text-slate-400 mb-8">
                                請檢查您的支付資訊後重試，或聯繫客服獲得協助。
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
                            >
                                返回
                            </button>
                        </div>
                    )}

                    {/* Pending */}
                    {result === 'pending' && (
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center animate-pulse">
                                    <Clock className="h-16 w-16 text-yellow-400" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">處理中</h2>
                            <p className="text-xl text-yellow-400 font-medium mb-4">
                                支付正在確認中
                            </p>
                            <p className="text-slate-400 mb-8">
                                您的支付正在處理中，請稍候片刻。<br />
                                如果長時間未入帳，請聯繫客服。
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
                            >
                                知道了
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentResultModal;
