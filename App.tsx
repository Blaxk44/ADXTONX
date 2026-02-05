
import React, { useEffect, useState, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Home as HomeIcon, Play, CheckSquare, Wallet, User as UserIcon, AlertCircle, ShieldCheck } from 'lucide-react';
import HomePage from './pages/Home.tsx';
import AdsPage from './pages/Ads.tsx';
import TasksPage from './pages/Tasks.tsx';
import WalletPage from './pages/Wallet.tsx';
import ProfilePage from './pages/Profile.tsx';
import AdminPage from './pages/Admin.tsx';
import LeaderboardPage from './pages/Leaderboard.tsx';
import { User } from './types.ts';
import { getOrInitUser, checkAndCreditReferralBonus } from './firebase.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(!navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOfflineMode(!navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  /**
   * Official Telegram WebApp Initialization & Login Sequence
   * 1. Detect Telegram environment and signal readiness.
   * 2. Extract authenticated user payload from initDataUnsafe.
   * 3. Handle referral deep-links (start_param).
   * 4. Sync session with Firebase (getOrInitUser).
   */
  const loginUser = useCallback(async () => {
    setLoading(true);
    const tg = (window as any).Telegram?.WebApp;
    
    try {
      if (!tg || !tg.initDataUnsafe) {
        // Fallback for local development or external browsers
        console.warn("Telegram WebApp environment not detected. Running in sandbox mode.");
      }

      if (tg) {
        tg.ready();
        tg.expand();
        // Set dynamic theme colors based on platform
        tg.setHeaderColor('secondary_bg_color');
        tg.setBackgroundColor('bg_color');
      }

      // Extract raw data from Telegram's secure context
      const initDataUnsafe = tg?.initDataUnsafe || {};
      const tgUser = initDataUnsafe.user;
      
      // Parse potential referral code from start_param (e.g., t.me/bot/app?startapp=ref_12345)
      const startParam = initDataUnsafe.start_param;
      const referrerId = startParam && startParam.startsWith('ref_') 
        ? startParam.replace('ref_', '') 
        : null;

      // Verify and persist user in the database
      // The getOrInitUser function handles mapping tgUser.id to User.telegram_id
      const userData = await getOrInitUser(tgUser, referrerId);
      
      setUser(userData);

      // Check for immediate referral milestones if applicable
      if (!userData.referral_bonus_paid && userData.referred_by) {
        await checkAndCreditReferralBonus(userData);
      }

    } catch (err: any) {
      console.error("Authentication/Login Failure:", err);
      setError(err.message || "Protocol synchronization failed. Please restart the app.");
    } finally {
      // Branding delay for luxury UX
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);

  useEffect(() => { 
    loginUser(); 
  }, [loginUser]);

  // Premium Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-12 text-center bg-[#010409]">
        <div className="relative mb-16">
          <div className="absolute inset-0 bg-cyan-500/15 blur-[100px] rounded-full scale-150 animate-pulse"></div>
          <div className="w-40 h-40 rounded-full glass-panel border-white/10 flex items-center justify-center relative z-10 shadow-[0_0_80px_rgba(34,211,238,0.1)]">
            <img 
              src="https://i.ibb.co/NgbS3j2F/logo.png" 
              className="w-32 h-32 rounded-full border-2 border-slate-900 shadow-2xl animate-pulse" 
              alt="AdTONX"
            />
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-white text-5xl font-black italic tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">AdTONX</h1>
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-2 text-cyan-400">
               <ShieldCheck size={16} className="animate-spin-slow" />
               <p className="text-[10px] uppercase tracking-[0.6em] font-black italic">Validating Node</p>
            </div>
            <div className="w-56 h-1 bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
               <div className="absolute inset-0 bg-cyan-900/20"></div>
               <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 w-1/3 animate-loading-bar shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
          .animate-loading-bar {
            animation: loading-bar 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>
      </div>
    );
  }

  // Error Handling UI
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-slate-950">
        <div className="p-10 bg-red-500/5 rounded-[3rem] text-red-500 mb-10 border border-red-500/10 shadow-2xl">
           <AlertCircle size={60} />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">Protocol Error</h2>
        <p className="text-slate-500 text-xs mb-12 max-w-xs leading-relaxed uppercase tracking-widest font-bold opacity-80">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full max-w-xs bg-cyan-600/10 text-cyan-400 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] border border-cyan-500/20 shadow-xl active:scale-95 transition-all hover:bg-cyan-600/20"
        >
          Re-initialize Session
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen pb-32">
        <div className="max-w-md mx-auto px-4 pt-6">
          <Routes>
            <Route path="/" element={user ? <HomePage user={user} onUpdateUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/ads" element={user ? <AdsPage user={user} onUpdateUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/tasks" element={user ? <TasksPage user={user} onUpdateUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/wallet" element={user ? <WalletPage user={user} onUpdateUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Navigate to="/" />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            {user?.isAdmin && <Route path="/admin" element={<AdminPage />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Global Navigation - Glassmorphism UI */}
        <nav className="fixed bottom-0 left-0 right-0 glass-nav px-8 pt-4 pb-10 z-[100] border-t border-white/5">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <NavItem to="/" icon={<HomeIcon size={24} />} label="Home" />
            <NavItem to="/ads" icon={<Play size={24} />} label="Yield" />
            <NavItem to="/tasks" icon={<CheckSquare size={24} />} label="Quests" />
            <NavItem to="/wallet" icon={<Wallet size={24} />} label="Vault" />
            <NavItem to="/profile" icon={<UserIcon size={24} />} label="Node" />
          </div>
        </nav>
      </div>
    </Router>
  );
};

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all relative ${isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-400'}`}>
    {({ isActive }) => (
      <>
        <div className={`p-1 transition-transform duration-300 ${isActive ? 'scale-125' : 'scale-100'}`}>
          {icon}
        </div>
        <span className={`text-[8px] font-black uppercase tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
          {label}
        </span>
        {isActive && (
          <div className="absolute -bottom-2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
        )}
      </>
    )}
  </NavLink>
);

export default App;
