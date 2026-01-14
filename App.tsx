import * as React from 'react';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GameCard from './components/GameCard';
import GameDetailsModal from './components/GameDetailsModal';
import PaymentModal from './components/PaymentModal';
import WalletModal from './components/WalletModal';
import GamePlayer from './components/GamePlayer';
import AdminDashboard from './components/AdminDashboard';
import ProfileModal from './components/ProfileModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import PaymentResultModal from './components/PaymentResultModal';
import { gameService } from './services/gameService';
import { authService } from './services/authService';
import { Game, User, GameCategory } from './types';
import { Search, Filter, Trophy, Loader2 } from 'lucide-react';

function App() {
  // User State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Data State
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [purchasedGameIds, setPurchasedGameIds] = useState<string[]>([]);

  // Filter & UI State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  // View Routing
  const [currentView, setCurrentView] = useState<'home' | 'privacy' | 'terms'>('home');

  // Payment Result Modal State
  const [paymentResult, setPaymentResult] = useState<{
    isOpen: boolean;
    result: 'success' | 'error' | 'pending' | null;
    errorCode?: string;
    rcode?: string;
    amount?: number;
    errorMessage?: string;
  }>({ isOpen: false, result: null });

  // Initial Data Fetch
  useEffect(() => {
    const initData = async () => {
      // 1. Fetch Games
      try {
        const gamesData = await gameService.getAllGames();
        setGames(gamesData);
      } catch (error) {
        console.error("Failed to fetch games", error);
      } finally {
        setIsLoading(false);
      }

      // 2. Check User Session
      try {
        const session = await authService.getCurrentSession();
        if (session.user) {
          // Merge library from response into user object
          setUser({ ...session.user, library: session.library });
          setPurchasedGameIds(session.purchasedGames);
        }
      } catch (error) {
        console.error("Failed to restore session", error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initData();
  }, []);

  // Handle P99 payment callback - Show result modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const pending = urlParams.get('pending');
    const rcode = urlParams.get('rcode');
    const amountParam = urlParams.get('amount');
    const errorMsg = urlParams.get('msg'); // P99 RMSG_CHI

    if (success || error || pending) {
      let result: 'success' | 'error' | 'pending' = 'error';
      if (success) result = 'success';
      else if (pending) result = 'pending';

      setPaymentResult({
        isOpen: true,
        result,
        errorCode: error || undefined,
        rcode: rcode || undefined,
        amount: amountParam ? parseInt(amountParam) : undefined,
        errorMessage: errorMsg || undefined
      });

      // Clear URL params without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // [FIX] Expose user to window for iframe games (MyFish, etc.)
  useEffect(() => {
    if (window && user) {
      // CRITICAL: Force ID to string to prevent precision loss with large Google IDs
      const userWithStringId = {
        ...user,
        id: String(user.id)
      };
      (window as any).currentUser = userWithStringId;
      // Also expose via GameZoe namespace for consistency
      (window as any).GameZoe = { currentUser: userWithStringId };

      console.log('[App] Exposed user to window, ID:', String(user.id), '(type: string)');
    } else if (window && !user) {
      // Clear when logged out
      (window as any).currentUser = null;
      (window as any).GameZoe = { currentUser: null };
    }
  }, [user]);


  // Handle Login
  const handleLogin = async (provider: 'google' | 'facebook', token?: string) => {
    setIsAuthLoading(true);
    try {
      const { user, purchasedGames, library } = await authService.login(provider, token);
      setUser({ ...user, library });
      setPurchasedGameIds(purchasedGames);
      // For demo: if admin logs in, show admin dashboard hint or do nothing
    } catch (error) {
      alert("登入失敗，請稍後再試");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setPurchasedGameIds([]);
    setShowAdmin(false);
  };

  // Security: Idle Timeout (30 minutes) - Paused when playing games
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

    const resetTimer = () => {
      clearTimeout(idleTimer);
      // Don't start idle timer if user is playing a game (iframe activity not detectable)
      if (user && !isPlaying) {
        idleTimer = setTimeout(() => {
          handleLogout();
          alert("您已閒置超過 30 分鐘，為保護您的帳號安全，系統已自動登出。");
        }, TIMEOUT_DURATION);
      }
    };

    if (user && !isPlaying) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('click', resetTimer);
      resetTimer(); // Start timer
    }

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [user, isPlaying]);

  // Navigation Handler
  const handleNavigate = (view: string) => {
    if (view === 'home' || view === 'privacy' || view === 'terms') {
      setCurrentView(view as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Admin Actions (Now Async)
  const handleAddGame = async (newGame: Game) => {
    setIsLoading(true);
    try {
      await gameService.createGame(newGame);
      await fetchGames(); // Refresh list
    } catch (error) {
      alert("新增遊戲失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGame = async (updatedGame: Game) => {
    setIsLoading(true);
    try {
      await gameService.updateGame(updatedGame);
      await fetchGames();
    } catch (error) {
      alert("更新遊戲失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGame = async (id: string) => {
    setIsLoading(true);
    try {
      await gameService.deleteGame(id);
      await fetchGames();
    } catch (error) {
      alert("刪除遊戲失敗");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to re-fetch games cleanly
  const fetchGames = async () => {
    const data = await gameService.getAllGames();
    setGames(data);
  };

  // Filtering Logic
  const filteredGames = games.filter(game => {
    const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Flow Handlers
  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
  };

  // Helper to check ownership (Permanent OR Active Rental)
  const checkOwnership = (gameId: string) => {
    if (purchasedGameIds.includes(gameId)) return true;
    const rental = user?.library?.find(l => l.gameId === gameId);
    // Explicitly check if rental exists and is active
    if (rental && (!rental.expiresAt || new Date(rental.expiresAt) > new Date())) {
      return true;
    }
    return false;
  };

  const handlePlayRequest = (game: Game, forcePurchase: boolean = false) => {
    // 1. If Game is Free -> Play (unless forcing purchase?)
    // Actually free games never need purchase, so ignore forcePurchase for pure free games logic if we want,
    // but assuming this is only called for paid games.
    if (game.isFree && !forcePurchase) {
      setIsPlaying(true);
      return;
    }

    // 2. If Game is Owned (Permanent or Active Rental) -> Play (Unless Forced)
    if (!forcePurchase && checkOwnership(game.id)) {
      setIsPlaying(true);
      return;
    }

    // 3. If Game is Paid and Not Owned (or Forced) -> Check Login then Pay
    if (!user) {
      alert("請先登入以購買遊戲。");
      return;
    }

    // Close details, open payment
    setSelectedGame(game);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (result: { balance: { gold_balance: number; silver_balance: number }, expiresAt?: string | null }) => {
    if (selectedGame && user) {
      // Optimistic Update
      const newPurchasedList = [...purchasedGameIds, selectedGame.id];
      setPurchasedGameIds(newPurchasedList);

      let newLibrary = user.library ? [...user.library] : [];
      // Remove existing entry for this game if any
      newLibrary = newLibrary.filter(item => item.gameId !== selectedGame.id);
      // Add new entry
      if (result.expiresAt) {
        newLibrary.push({ gameId: selectedGame.id, expiresAt: result.expiresAt });
      } else {
        // Permanent
        newLibrary.push({ gameId: selectedGame.id, expiresAt: null });
      }

      if (result.balance) {
        setUser({ ...user, ...result.balance, library: newLibrary });
      } else {
        setUser({ ...user, library: newLibrary });
      }

      // Save to DB via Service (Optional: double check if needed, but PaymentModal already did the transactional record)
      // authService.addGameToLibrary(user.id, selectedGame.id); <--- This might be redundant now, but harmless

      setShowPayment(false);
      setIsPlaying(true);
    }
  };

  const closeModals = () => {
    if (isPlaying) return;
    setSelectedGame(null);
    setShowPayment(false);
  };

  // Render loading state for initial load
  if (isAuthLoading && games.length === 0) {
    return (
      <div className="min-h-screen bg-nexus-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-12 w-12 animate-spin text-nexus-accent mb-4" />
        <h2 className="text-xl font-bold">GameZoe</h2>
        <p className="text-slate-400 text-sm">正在初始化平台資料...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nexus-900 text-slate-100 flex flex-col font-sans">
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow">

        {currentView === 'home' && (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative h-[400px] flex items-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img
                  src="https://picsum.photos/id/180/1920/600"
                  alt="Hero"
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-nexus-900/50 to-transparent" />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
                <div className="max-w-2xl animate-slide-up">
                  <div className="flex items-center gap-2 mb-4 text-nexus-accent font-bold tracking-wider uppercase text-sm">
                    <Trophy className="h-4 w-4" />
                    <span>精選遊戲</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                    次世代網頁遊戲 <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-accent to-purple-400">
                      即點即玩
                    </span>
                  </h1>
                  <p className="text-slate-300 text-lg mb-8 max-w-lg">
                    立即遊玩數千款優質與獨立遊戲。免下載、免等待，隨時開啟您的冒險。
                  </p>
                  <button
                    onClick={() => document.getElementById('games-grid')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-nexus-900 hover:bg-slate-200 px-8 py-3.5 rounded-full font-bold transition-all shadow-lg hover:shadow-white/20"
                  >
                    開始探索
                  </button>
                </div>
              </div>
            </section>

            {/* Filter Bar */}
            <div className="sticky top-16 z-30 bg-nexus-900/95 backdrop-blur border-b border-slate-800 py-4 shadow-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  {['All', ...Object.values(GameCategory)].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat
                        ? 'bg-nexus-accent text-white shadow-lg shadow-nexus-accent/25'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                    >
                      {cat === 'All' ? '全部' : cat}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="搜尋遊戲..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                  />
                </div>
              </div>
            </div>

            {/* Game Grid */}
            <section id="games-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Filter className="h-5 w-5 text-nexus-accent" />
                  {activeCategory === 'All' ? '所有遊戲' : `${activeCategory} 遊戲`}
                </h2>
                <span className="text-slate-500 text-sm">
                  {isLoading ? '載入中...' : `找到 ${filteredGames.length} 款遊戲`}
                </span>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-nexus-accent">
                  <Loader2 className="h-12 w-12 animate-spin mb-4" />
                  <p className="text-slate-400">正在從資料庫載入遊戲列表...</p>
                </div>
              ) : filteredGames.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredGames.map(game => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onClick={handleGameClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500">
                  <p className="text-xl">沒有找到符合條件的遊戲。</p>
                </div>
              )}
            </section>
          </div>
        )}

        {currentView === 'terms' && <TermsOfService />}
        {currentView === 'privacy' && <PrivacyPolicy />}

      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Modals */}
      {selectedGame && !showPayment && !isPlaying && (
        <GameDetailsModal
          game={selectedGame}
          isOpen={true}
          onClose={closeModals}
          onPlay={handlePlayRequest}
          isOwned={checkOwnership(selectedGame.id)}
          isLoggedIn={!!user}
          userId={user?.id}
          expiresAt={user?.library?.find(l => l.gameId === selectedGame.id)?.expiresAt || null}
        />
      )}

      {selectedGame && showPayment && (
        <PaymentModal
          game={selectedGame}
          isOpen={true}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
          currentUser={user || undefined}
          onOpenWallet={() => {
            setShowPayment(false); // Close payment
            setIsWalletOpen(true); // Open store
          }}
        />
      )}

      {selectedGame && isPlaying && (
        <GamePlayer
          game={selectedGame}
          onClose={() => setIsPlaying(false)}
          currentUser={user}
          expiresAt={user?.library?.find(l => l.gameId === selectedGame.id)?.expiresAt || null}
        />
      )}

      {/* Admin Dashboard Overlay */}
      <AdminDashboard
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        games={games}
        onAddGame={handleAddGame}
        onUpdateGame={handleUpdateGame}
        onDeleteGame={handleDeleteGame}
        currentUser={user}
      />

      {/* Wallet Top-up Modal (Global) */}
      {user && (
        <WalletModal
          isOpen={isWalletOpen}
          onClose={() => setIsWalletOpen(false)}
          userId={user.id}
          onTopUpSuccess={(newBal) => {
            // Optional: Update global balance or trigger Navbar refresh
            setUser({ ...user, ...newBal });
          }}
        />
      )}

      {/* Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
        />
      )}

      {/* Payment Result Modal (P99 callback) */}
      <PaymentResultModal
        isOpen={paymentResult.isOpen}
        onClose={() => {
          setPaymentResult({ isOpen: false, result: null });
          // Optionally open wallet to show updated balance
          if (paymentResult.result === 'success' && user) {
            setIsWalletOpen(true);
          }
        }}
        result={paymentResult.result}
        errorCode={paymentResult.errorCode}
        rcode={paymentResult.rcode}
        amount={paymentResult.amount}
        errorMessage={paymentResult.errorMessage}
      />

    </div>
  );
}

export default App;