
import React, { useState } from 'react';
import { User, AdNetwork } from '../types.ts';
import { 
  TrendingUp, Award, PlayCircle, Info, Megaphone, Zap, ZapOff, Activity, 
  RefreshCw, ChevronRight, HelpCircle, X, CheckCircle, Smartphone, 
  DollarSign, ArrowRight, CheckSquare, Wallet, ShieldCheck, Fingerprint, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerAd, calculateAdReward, playRewardSound } from '../services/adService.ts';
import { updateUserBalance, logTransaction } from '../firebase.ts';

interface HomeProps {
  user: User;
  onUpdateUser: (u: User) => void;
}

const Home: React.FC<HomeProps> = ({ user, onUpdateUser }) => {
  const navigate = useNavigate();
  const [isBoosting, setIsBoosting] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [rewardToast, setRewardToast] = useState<{ amount: number; visible: boolean }>({ amount: 0, visible: false });

  if (!user) return null;

  const handleFlashAd = async () => {
    if (isBoosting) return;
    setIsBoosting(true);
    try {
      const success = await triggerAd(AdNetwork.ADSGRAM, user.telegram_id);
      if (success) {
        playRewardSound();
        const reward = calculateAdReward(user, AdNetwork.ADSGRAM);
        await updateUserBalance(user.telegram_id, reward);
        await logTransaction({
          user_id: user.telegram_id,
          type: 'ad',
          amount: reward,
          fee: 0,
          network: AdNetwork.ADSGRAM,
          status: 'completed',
          description: `Flash Reward (Adsgram)`
        });

        onUpdateUser({
          ...user,
          balance: user.balance + reward,
          today_earnings: (user.today_earnings || 0) + reward,
          ads_watched: (user.ads_watched || 0) + 1,
          ads_adsgram: (user.ads_adsgram || 0) + 1
        });

        setRewardToast({ amount: reward, visible: true });
        setTimeout(() => setRewardToast(prev => ({ ...prev, visible: false })), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Flash ad failed to load.");
    } finally {
      setIsBoosting(false);
    }
  };

  return (
    <div className="space-y-6 pb-4">
      {rewardToast.visible && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-sm animate-slide-down">
          <div className="bg-emerald-600/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-4 border border-emerald-400/30">
            <div className="bg-white/20 p-2 rounded-xl animate-bounce">
              <CheckCircle size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">TON Confirmed</span>
              <span className="text-lg font-black tabular-nums">+{rewardToast.amount.toFixed(4)} TON</span>
            </div>
            <div className="ml-auto flex items-center gap-1 bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black">
              <Zap size={10} fill="currentColor" /> INSTANT
            </div>
          </div>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
           <div className="relative">
             <div className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full"></div>
             <img src="https://i.ibb.co/NgbS3j2F/logo.png" className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] relative z-10" alt="AdTONX" />
           </div>
           <span className="text-2xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">AdTONX</span>
        </div>
        <button onClick={() => navigate('/profile')} className="p-2.5 glass-panel rounded-2xl active:scale-95 transition-all text-cyan-400 border-white/5">
           <Activity size={20} />
        </button>
      </div>

      {/* Main Branding Hero */}
      <div className="relative group overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/5">
        <img 
          src="https://i.ibb.co/p63387My/hero.png" 
          alt="Welcome" 
          className="w-full h-52 object-cover transition-transform duration-[2s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-8">
          <p className="text-white font-black text-4xl italic tracking-tighter uppercase leading-none mb-1">Blockchain Power</p>
          <div className="flex items-center gap-2 mt-2">
             <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Node Protocol v1.2</p>
          </div>
        </div>
      </div>

      {/* Quick Tutorial Guide Card */}
      <div className="glass-panel rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden border-white/10 group">
        <div className="absolute -right-8 -top-8 opacity-[0.03] rotate-12 transition-transform duration-1000 group-hover:rotate-45">
          <Layers size={150} />
        </div>
        <div className="flex items-center justify-between mb-4 relative z-10">
           <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-400/10 rounded-lg text-cyan-400"><Info size={14} /></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Yield Engine Guide</h3>
           </div>
           <button 
             onClick={() => setShowTutorial(true)} 
             className="text-[9px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/5 px-4 py-2 rounded-xl border border-cyan-400/10 hover:bg-cyan-400/10 transition-all flex items-center gap-2"
           >
             <HelpCircle size={12} /> Full Docs
           </button>
        </div>
        <div className="grid grid-cols-3 gap-3 relative z-10">
          <TutorialStep icon={<PlayCircle size={16} />} label="VERIFY" desc="Watch Ads" color="text-cyan-400" bg="bg-cyan-400/5" />
          <TutorialStep icon={<CheckSquare size={16} />} label="SYNC" desc="Finish Tasks" color="text-purple-400" bg="bg-purple-400/5" />
          <TutorialStep icon={<Wallet size={16} />} label="PAYOUT" desc="Claim TON" color="text-emerald-400" bg="bg-emerald-400/5" />
        </div>
      </div>

      {/* Balance Display */}
      <div className={`bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10 group transition-all duration-500 ${rewardToast.visible ? 'ring-4 ring-cyan-400/20' : ''}`}>
        <div className="absolute -top-10 -right-10 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000">
          <TrendingUp size={200} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Vault Liquidity</p>
            <div className="px-3 py-1 bg-cyan-400/10 rounded-lg border border-cyan-400/20 text-[8px] font-black uppercase tracking-widest text-cyan-400 animate-pulse">Node Syncing</div>
          </div>
          <div className="flex items-end gap-3">
            <span className={`text-6xl font-black tracking-tighter italic drop-shadow-[0_0_15px_rgba(34,211,238,0.2)] ${rewardToast.visible ? 'text-cyan-400' : 'text-white'}`}>{(user.balance || 0).toFixed(4)}</span>
            <span className="text-xl font-black mb-1.5 italic text-slate-500 uppercase tracking-widest">TON</span>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
            <div className="flex flex-col">
              <p className="text-[9px] text-slate-600 uppercase tracking-widest font-black mb-2">Cycle Earnings</p>
              <p className="font-black text-lg tabular-nums text-emerald-400">+{(user.today_earnings || 0).toFixed(4)}</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[9px] text-slate-600 uppercase tracking-widest font-black mb-2">Block Views</p>
              <p className="font-black text-lg tabular-nums text-cyan-400">{user.ads_watched || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Action Button */}
      <button 
        onClick={handleFlashAd}
        disabled={isBoosting}
        className={`w-full p-8 rounded-[2.5rem] border border-white/5 transition-all flex items-center justify-between group active:scale-[0.98] ${isBoosting ? 'opacity-50 cursor-wait glass-panel' : 'glass-panel hover:bg-slate-900 shadow-2xl shadow-cyan-900/10'}`}
      >
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-3xl transition-all ${isBoosting ? 'bg-slate-800 text-slate-600' : 'bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black shadow-[0_0_20px_rgba(34,211,238,0.1)] group-hover:shadow-[0_0_30_rgba(34,211,238,0.4)]'}`}>
            {isBoosting ? <RefreshCw className="animate-spin" size={32} /> : <Zap size={32} fill="currentColor" />}
          </div>
          <div className="text-left">
            <h4 className="text-xl font-black text-white uppercase tracking-tighter italic">Flash Validator</h4>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Adsgram High-Speed Cycle</p>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all">
           <ChevronRight size={24} />
        </div>
      </button>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <QuickLink icon={<PlayCircle size={28} />} label="AD NODES" onClick={() => navigate('/ads')} color="text-cyan-400 bg-cyan-400/5" />
        <QuickLink icon={<Award size={28} />} label="QUESTS" onClick={() => navigate('/tasks')} color="text-purple-400 bg-purple-400/5" />
      </div>

      {/* Detailed Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-[400] bg-slate-950/95 backdrop-blur-3xl p-4 flex items-center justify-center animate-in fade-in duration-300">
           <div className="glass-panel rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl relative animate-slide-up border-white/10 max-h-[90vh] overflow-y-auto no-scrollbar">
              <button 
                onClick={() => setShowTutorial(false)} 
                className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-slate-500 z-50 hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="p-8 space-y-8">
                <div className="text-center">
                   <div className="inline-flex p-6 bg-cyan-400/10 rounded-[2rem] mb-6 text-cyan-400 shadow-inner border border-cyan-400/20">
                      <Fingerprint size={48} className="animate-pulse" />
                   </div>
                   <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Node Protocol Guide</h2>
                   <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest leading-relaxed">Master the AdTONX Revenue ecosystem in 3 simple steps.</p>
                </div>
                
                <div className="space-y-8">
                   <TutorialModalStep 
                     num={1} 
                     title="AD VERIFICATION" 
                     text="Navigate to 'Ad Nodes' to initiate traffic validation. Each 5-30 second stream credits liquid TON to your vault. Watch up to 3000 blocks daily to maximize yield." 
                     icon={<PlayCircle size={24} className="text-cyan-400"/>} 
                   />
                   <TutorialModalStep 
                     num={2} 
                     title="QUEST SYNCHRONIZATION" 
                     text="Complete partner quests in the 'Quests' center. These tasks provide massive TON multipliers and are required to unlock weekly Arena prizes for top validators." 
                     icon={<CheckSquare size={24} className="text-purple-400"/>} 
                   />
                   <TutorialModalStep 
                     num={3} 
                     title="LIQUID SETTLEMENT" 
                     text="Connect your wallet in the 'Vault' section. Once you reach 2 TON, you can settle your earnings. Payouts are verified by the AdTONX protocol within 30 minutes." 
                     icon={<Wallet size={24} className="text-emerald-400"/>} 
                   />
                </div>

                <div className="bg-cyan-500/5 border border-cyan-500/10 p-5 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol Rules</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
                    Anti-cheat systems are active. Manual verification of clicks ensures 100% payout security. Bypassing nodes results in immediate account restriction.
                  </p>
                </div>

                <button 
                  onClick={() => setShowTutorial(false)}
                  className="w-full bg-cyan-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-[0_15px_30px_-10px_rgba(8,145,178,0.4)] mt-4 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  INITIALIZE NODE <ArrowRight size={18} />
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const TutorialStep: React.FC<{ icon: React.ReactNode, label: string, desc: string, color: string, bg: string }> = ({ icon, label, desc, color, bg }) => (
  <div className="flex flex-col items-center gap-1.5 p-4 rounded-3xl bg-white/5 border border-white/5 shadow-inner transition-transform hover:scale-105">
    <div className={`${bg} ${color} p-2 rounded-xl`}>{icon}</div>
    <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${color}`}>{label}</span>
    <span className="text-[8px] font-bold uppercase tracking-tighter text-slate-500 text-center">{desc}</span>
  </div>
);

const TutorialModalStep: React.FC<{ num: number, title: string, text: string, icon: React.ReactNode }> = ({ num, title, text, icon }) => (
  <div className="flex items-start gap-5 group">
    <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-cyan-400 text-sm shadow-inner transition-all group-hover:bg-cyan-400/10 group-hover:border-cyan-400/20">
      {num}
    </div>
    <div className="space-y-1">
      <div className="flex items-center gap-2">
         {icon}
         <h4 className="text-sm font-black text-white uppercase tracking-tight italic">{title}</h4>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{text}</p>
    </div>
  </div>
);

const QuickLink: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, color: string }> = ({ icon, label, onClick, color }) => (
  <button 
    onClick={onClick}
    className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center gap-4 active:scale-95 transition-all border-white/5 group shadow-lg"
  >
    <div className={`${color} p-5 rounded-[1.5rem] shadow-inner transition-transform group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`}>
      {icon}
    </div>
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</span>
  </button>
);

export default Home;
