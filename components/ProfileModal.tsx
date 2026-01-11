import React from 'react';
import { X, Mail, Calendar, Hash, Coins } from 'lucide-react';
import { User } from '../types';

interface ProfileModalProps {
   isOpen: boolean;
   onClose: () => void;
   user: User;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user }) => {
   if (!isOpen) return null;

   const formatDate = (dateStr?: string) => {
      if (!dateStr) return '未知';
      try {
         const date = new Date(dateStr);
         return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
         });
      } catch {
         return dateStr;
      }
   };

   const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert('已複製到剪貼簿！');
   };

   return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
         {/* Backdrop */}
         <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
         />

         {/* Modal */}
         <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md animate-fade-in">
            {/* Header */}
            <div className="relative p-6 pb-0">
               <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
               >
                  <X className="h-5 w-5" />
               </button>

               {/* Avatar & Name */}
               <div className="flex flex-col items-center text-center">
                  <img
                     src={user.avatar}
                     alt={user.name}
                     className="h-24 w-24 rounded-full border-4 border-nexus-accent shadow-lg"
                  />
                  <h2 className="text-2xl font-bold text-white mt-4">{user.name}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full mt-2 ${user.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>
                     {user.role === 'admin' ? '管理員' : '一般會員'}
                  </span>
               </div>
            </div>

            {/* Info List */}
            <div className="p-6 space-y-4">
               {/* User ID */}
               <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-800 rounded-lg">
                        <Hash className="h-4 w-4 text-nexus-accent" />
                     </div>
                     <div>
                        <p className="text-xs text-slate-500">帳號 ID</p>
                        <p className="text-sm text-white font-mono">{user.id}</p>
                     </div>
                  </div>
                  <button
                     onClick={() => copyToClipboard(user.id)}
                     className="text-xs text-nexus-accent hover:text-nexus-accentHover px-2 py-1 hover:bg-slate-800 rounded transition-colors"
                  >
                     複製
                  </button>
               </div>

               {/* Email */}
               <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                  <div className="p-2 bg-slate-800 rounded-lg">
                     <Mail className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                     <p className="text-xs text-slate-500">電子郵件</p>
                     <p className="text-sm text-white">{user.email}</p>
                  </div>
               </div>

               {/* Registration Date */}
               <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                  <div className="p-2 bg-slate-800 rounded-lg">
                     <Calendar className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                     <p className="text-xs text-slate-500">註冊時間</p>
                     <p className="text-sm text-white">{formatDate(user.created_at)}</p>
                  </div>
               </div>

               {/* Platform Balance */}
               <div className="flex items-center justify-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-yellow-500/30">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                     <Coins className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                     <p className="text-xs text-slate-500">平台 G 幣</p>
                     <p className="text-2xl text-yellow-500 font-bold">{user.gold_balance?.toLocaleString() || 0}</p>
                  </div>
               </div>
               <p className="text-xs text-slate-500 text-center">
                  遊戲點數已改為各遊戲獨立儲存，請在遊戲中查看
               </p>

               {/* Library Count */}
               {user.library && user.library.length > 0 && (
                  <div className="text-center text-sm text-slate-500 pt-2">
                     已擁有 <span className="text-nexus-accent font-bold">{user.library.length}</span> 款遊戲
                  </div>
               )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700">
               <button
                  onClick={onClose}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
               >
                  關閉
               </button>
            </div>
         </div>
      </div>
   );
};

export default ProfileModal;
