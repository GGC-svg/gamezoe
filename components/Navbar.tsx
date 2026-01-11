import React, { useState, useEffect } from 'react';
import { Gamepad2, User as UserIcon, LogOut, LayoutDashboard, Coins, Plus } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { User } from '../types';
import { APP_NAME } from '../constants';


interface NavbarProps {
  user: User | null;
  onLogin: (provider: 'google' | 'facebook', token?: string) => void;
  onLogout: () => void;
  onOpenAdmin?: () => void;
  onOpenWallet: () => void;
  onOpenProfile?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout, onOpenAdmin, onOpenWallet, onOpenProfile }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [balance, setBalance] = useState({ gold: 0, silver: 0 });

  // Update balance when user changes or implicitly via parent update mechanism
  // For now, let's assume user object might be updated or we fetch it.
  // Actually, let's allow fetching balance if user is present.
  useEffect(() => {
    if (user && user.id) {
      // Ideally fetch fresh balance, but for MVP let's assume user prop has it
      // OR fetch it here.
      fetchWalletBalance(user.id);
    }
  }, [user]);

  const fetchWalletBalance = async (userId: string) => {
    try {
      const res = await fetch(`/api/wallet/balance/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBalance({ gold: data.gold_balance || 0, silver: data.silver_balance || 0 });
      }
    } catch (e) {
      console.error("Failed to fetch balance", e);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: tokenResponse => {
      console.log("Google Login Success:", tokenResponse);
      onLogin('google', tokenResponse.access_token);
      setIsLoginOpen(false);
    },
    onError: () => console.log('Google Login Failed'),
  });

  return (
    <>
      <nav className="sticky top-0 z-50 bg-nexus-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
              <Gamepad2 className="h-8 w-8 text-nexus-accent" />
              <span className="font-bold text-xl tracking-tight">{APP_NAME}</span>
            </div>

            {/* Right Side - User Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">

                  {/* Wallet Display */}
                  <button
                    onClick={onOpenWallet}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-yellow-500/50 rounded-lg transition-all group"
                    title="儲值 / Top Up"
                  >
                    <div className="flex flex-col items-end leading-none">
                      <span className="text-yellow-500 font-bold text-sm group-hover:text-yellow-400">{balance.gold.toLocaleString()} G</span>
                      <span className="text-slate-400 text-[10px]">{balance.silver.toLocaleString()} S</span>
                    </div>
                    <div className="bg-yellow-500/20 p-1 rounded-md group-hover:bg-yellow-500/30 transition-colors">
                      <Plus className="h-3 w-3 text-yellow-500" />
                    </div>
                  </button>

                  {user.role === 'admin' && onOpenAdmin && (
                    <button
                      onClick={onOpenAdmin}
                      className="flex items-center gap-1 text-sm bg-slate-800 hover:bg-slate-700 text-nexus-accent px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden sm:inline">後台</span>
                    </button>
                  )}

                  <button
                    onClick={onOpenProfile}
                    className="hidden md:flex items-center gap-2 text-slate-300 hover:bg-slate-800 rounded-lg p-1 transition-colors"
                    title="查看個人資料"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full border-2 border-slate-600 hover:border-nexus-accent transition-colors"
                    />
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {/* <span className="hidden sm:inline">Logout</span> */}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsLoginOpen(!isLoginOpen)}
                    className="flex items-center gap-2 bg-nexus-accent hover:bg-nexus-accentHover text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    <UserIcon className="h-4 w-4" />
                    登入 / 註冊
                  </button>

                  {/* Dropdown Login Mock */}
                  {isLoginOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 animate-fade-in origin-top-right">
                      <h3 className="text-sm font-semibold text-slate-300 mb-3 text-center">登入 {APP_NAME}</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => googleLogin()}
                          className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 py-2 rounded-lg font-medium text-sm transition-colors"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                          Google 登入
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-3 text-center">
                        登入即代表您同意我們的服務條款。
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overlay to close dropdown if clicking outside */}
        {isLoginOpen && (
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setIsLoginOpen(false)}
          />
        )}
      </nav>
    </>
  );
};

export default Navbar;