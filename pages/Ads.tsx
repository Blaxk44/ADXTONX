
import React, { useState, useEffect } from 'react';
import { User, AdNetwork } from '../types.ts';
import { 
  Timer, AlertTriangle, CheckCircle, Zap, 
  RefreshCw, X, Activity, ShieldCheck, 
  Film, Rocket, Video, ShieldAlert, Info, ExternalLink, ShieldX, HelpCircle, 
  Settings2, Sparkles, Filter
} from 'lucide-react';
import { triggerAd, calculateAdReward, checkMilestoneBonus, playRewardSound } from '../services/adService.ts';
import { logTransaction, db, checkAndCreditReferralBonus, PLATFORM_CONFIG } from '../firebase.ts';
import { doc, updateDoc, increment } from 'firebase/firestore';

interface AdsProps {
  user: User;
  onUpdateUser: (u: User) => void;
}

const DAILY_LIMIT = 3000;
const AVAILABLE_INTERESTS = [
  "Crypto", "Gaming", "Finance", "Technology", "Entertainment", "Lifestyle", "Education"
];

export default function Ads({ user, onUpdateUser }: AdsProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [lastNet, setLastNet] = useState<AdNetwork>(AdNetwork.MONETAG);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ amount: number, isBonus: boolean, visible: boolean }>({ amount: 0, isBonus: false, visible: false });
  const [sdkStatus, setSdkStatus] = useState({ monetag: false, adsgram: false, adexium: false });
  const [showAdBlockInfo, setShowAdBlockInfo] = useState(false);
  
  // Personalization state
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user.interests || []);
  const [isUpdatingInterests, setIsUpdatingInterests] = useState(false);

  // Monitor SDK availability in real-time
  useEffect(() => {
    const check = () => {
      const w = window as any;
      setSdkStatus({
        monetag: !!w.show_10551237 || w.monetagLoaded === true,
        adsgram: !!w.Adsgram || w.adsgramLoaded === true,
        adexium: !!w.AdexiumWidget || w.adexiumLoaded === true
      });
    };
    const i = setInterval(check, 3000); 
    check();
    return () => clearInterval(i);
  }, []);

  // Handle local cooldown timer to prevent spamming node requests
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  const allSdksBlocked = !sdkStatus.monetag && !sdkStatus.adsgram && !sdkStatus.adexium;

  const handleWatchAd = async (network: AdNetwork) => {
    if (cooldown > 0 || isWatching) return;
    
    // Validate daily node transmission capacity
    if (user.ads_watched >= DAILY_LIMIT) {
      setError("Daily network transmission limit reached. Payout nodes are saturated.");
      return;
    }

    setLastNet(network);
    setError(null);
    setIsWatching(true);
    
    const verificationTime = network === AdNetwork.ADEXIUM ? 12 : 8;
    setCountdown(verificationTime);
    const ci = setInterval(() => setCountdown(p => p <= 1 ? 0 : p - 1), 1000);

    try {
      // Pass user interests to triggerAd for SDK targeting
      const success = await triggerAd(network, user.telegram_id, user.interests);
      
      if (success) {
        clearInterval(ci);
        playRewardSound();

        const reward = calculateAdReward(user, network);
        const newTotal = (user.ads_watched || 0) + 1;
        const bonus = checkMilestoneBonus(newTotal);
        const totalReward = reward + bonus;

        const userRef = doc(db, "users", user.telegram_id);
        await updateDoc(userRef, {
          balance: increment(totalReward),
          total_earned: increment(totalReward),
          today_earnings: increment(totalReward),
          ads_watched: increment(1),
          weekly_ads_watched: increment(1),
          [`ads_${network}`]: increment(1)
        });

        await logTransaction({
          user_id: user.telegram_id,
          type: 'ad',
          amount: totalReward,
          fee: 0,
          network,
          status: 'completed',
          description: `Verified Block: ${network.toUpperCase()}`
        });

        onUpdateUser({
          ...user,
          balance: (user.balance || 0) + totalReward,
          total_earned: (user.total_earned || 0) + totalReward,
          today_earnings: (user.today_earnings || 0) + totalReward,
          ads_watched: newTotal,
          weekly_ads_watched: (user.weekly_ads_watched || 0) + 1,
          [`ads_${network}`]: ((user as any)[`ads_${network}`] || 0) + 1
        });

        checkAndCreditReferralBonus(user).catch(console.error);

        setCooldown(12);
        setToast({ amount: totalReward, isBonus: bonus > 0, visible: true });
        setTimeout(() => setToast(p => ({ ...p, visible: false })), 4000);
      }
    } catch (err: any) {
      setError(err.message || "Protocol Error: The ad stream was interrupted.");
    } finally {
      clearInterval(ci);
      setIsWatching(false);
      setCountdown(0);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const saveInterests = async () => {
    setIsUpdatingInterests(true);
    try {
      const userRef = doc(db, "users", user.telegram_id);
      await updateDoc(userRef, { interests: selectedInterests });
      onUpdateUser({ ...user, interests: selectedInterests });
      
      // Visual feedback for successful sync
      const originalText = "Yield Protocol Calibrated";
      setToast({ amount: 0, isBonus: false, visible: true });
      setTimeout(() => setToast(p => ({ ...p, visible: false })), 2000);
    } catch (err) {
      console.error("Personalization failed:", err);
    } finally {
      setIsUpdatingInterests(false);
    }
  };

  const current = user.ads_watched || 0;
  const progress = Math.min((current / DAILY_LIMIT) * 100, 100);
  const isEligible = user.weekly_ads_watched >= PLATFORM_CONFIG.ARENA_ELIGIBILITY;

  return (
    <div className="space-y-6 pb-6 select-none relative">
      {/* Premium Notification Toast */}
      {toast.visible && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-slide-down">
          <div className={`p-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/20 ${toast.isBonus ? 'bg-indigo-600/95' : 'bg-cyan-600/95'} text-white backdrop-blur-2xl`}>
            <div className="p-2 bg-white/20 rounded-xl">
               <Zap size={20} fill="white" className="animate-pulse" />
            </div>
            <div className="flex flex-col">
              {toast.amount > 0 ? (
                <>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">{toast.isBonus ? 'Milestone Bonus' : 'TON Synchronized'}</span>
                  <span className="text-xl font-black tabular-nums">+{toast.amount.toFixed(4)} <span className="text-sm font-normal opacity-60 uppercase">TON</span></span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">Protocol Update</span>
                  <span className="text-sm font-black italic">Targeting Nodes Calibrated</span>
                </>
              )}
            </div>
            <CheckCircle size={24} className="ml-auto text-white/40" />
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center py-12 glass-panel -mx-4 px-4 rounded-b-[4rem] relative overflow-hidden border-b border-cyan-500/20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.1)_0%,_transparent_70%)] animate-pulse"></div>
        <div className="relative z-10">
          <div className="inline-flex p-4 bg-cyan-400/10 rounded-[1.5rem] mb-4 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <Video size={36} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Yield Nodes</h1>
          <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-[0.5em]">Real-time Payout Stream</p>
        </div>
      </div>

      {/* AdBlock Detection Warning Banner */}
      {allSdksBlocked && (
        <div className="glass-panel border-amber-500/40 p-5 rounded-[2.5rem] bg-amber-500/10 animate-pulse relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500">
              <ShieldX size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1">Node Access Blocked</h4>
              <p className="text-[11px] font-bold text-slate-300 leading-tight">AdBlock detection active. Revenue synchronization is suspended.</p>
            </div>
            <button 
              onClick={() => setShowAdBlockInfo(true)}
              className="bg-amber-500/20 text-amber-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-500/20 hover:bg-amber-500/30 transition-all"
            >
              Learn More
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-10 -mt-10"></div>
        </div>
      )}

      {/* Ad Personalization Selector */}
      <div className="glass-panel p-6 rounded-[2.5rem] space-y-5 border-white/5 shadow-xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
           <Filter size={60} />
         </div>
         <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
               <Settings2 size={16} className="text-cyan-400" />
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yield Personalization</h3>
            </div>
            <button 
              onClick={saveInterests}
              disabled={isUpdatingInterests}
              className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${isUpdatingInterests ? 'bg-slate-800 text-slate-500' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20'}`}
            >
              {isUpdatingInterests ? 'Syncing...' : 'Sync Preferences'}
            </button>
         </div>
         <div className="flex flex-wrap gap-2 relative z-10">
            {AVAILABLE_INTERESTS.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedInterests.includes(interest) ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-slate-900 text-slate-500 border border-white/5 hover:border-white/10'}`}
              >
                {interest}
              </button>
            ))}
         </div>
         <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest italic leading-relaxed">Selecting categories prioritizes high-CPM nodes matching your interests.</p>
      </div>

      {!isEligible && (
        <div className="glass-panel border-amber-500/30 p-5 rounded-[2.5rem] bg-amber-500/5">
           <div className="flex items-start gap-4">
              <ShieldAlert size={24} className="text-amber-500 shrink-0" />
              <div>
                <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1">Arena Unlock Pending</h4>
                <p className="text-[11px] font-bold text-slate-300">Sync <span className="text-amber-400">{PLATFORM_CONFIG.ARENA_ELIGIBILITY - user.weekly_ads_watched} more</span> blocks to qualify for weekly TON prizes.</p>
              </div>
           </div>
        </div>
      )}

      {error && (
        <div className="glass-panel border-red-500/30 p-5 rounded-[2rem] bg-red-500/5 animate-shake">
           <div className="flex items-center gap-4 text-red-400">
              <AlertTriangle size={24} />
              <p className="text-sm font-bold flex-1">{error}</p>
              <button onClick={() => setError(null)} className="p-1 hover:text-white"><X size={18}/></button>
           </div>
        </div>
      )}

      {/* Ad Protocol Selection Grid */}
      <div className="space-y-6 px-1">
        <AdNodeButton 
          network={AdNetwork.ADSGRAM} 
          active={sdkStatus.adsgram} 
          disabled={isWatching || cooldown > 0} 
          onClick={() => handleWatchAd(AdNetwork.ADSGRAM)}
          label="Watch Adsgram Video"
          sub="Premium 0.0035 TON Protocol"
          icon={<Film size={32}/>}
          theme="cyan"
          highlight={true}
        />
        <AdNodeButton 
          network={AdNetwork.MONETAG} 
          active={sdkStatus.monetag} 
          disabled={isWatching || cooldown > 0} 
          onClick={() => handleWatchAd(AdNetwork.MONETAG)}
          label="Monetag Native Ad"
          sub="Stable Yield Stream"
          icon={<ShieldCheck size={32}/>}
          theme="indigo"
        />
        <AdNodeButton 
          network={AdNetwork.ADEXIUM} 
          active={sdkStatus.adexium} 
          disabled={isWatching || cooldown > 0} 
          onClick={() => handleWatchAd(AdNetwork.ADEXIUM)}
          label="Adexium Widget"
          sub="Interstitial Sync Node"
          icon={<Activity size={32}/>}
          theme="slate"
        />
      </div>

      {/* Performance Meter */}
      <div className="glass-panel p-6 rounded-[2.5rem] space-y-4 border-white/5 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform">
           <Rocket size={80} />
         </div>
         <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">
            <span>Cycle Capacity Meter</span>
            <span className="text-white tabular-nums">{current} / {DAILY_LIMIT} Blocks</span>
         </div>
         <div className="h-4 w-full bg-slate-950/80 rounded-full overflow-hidden p-1 border border-white/5 relative z-10">
            <div 
              className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-blue-500 rounded-full transition-all duration-[2000ms] shadow-[0_0_20px_rgba(34,211,238,0.4)]" 
              style={{ width: `${progress}%` }} 
            />
         </div>
         <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic text-center">Protocol Limit: {DAILY_LIMIT} Daily</p>
      </div>

      {/* Full-Screen Sync Overlay */}
      {isWatching && (
        <div className="fixed inset-0 bg-slate-950/98 z-[500] flex flex-col items-center justify-center p-12 text-white backdrop-blur-3xl animate-in fade-in zoom-in duration-300">
          <div className="w-64 h-64 rounded-full glass-panel border-cyan-500/20 flex items-center justify-center relative mb-12 shadow-[0_0_100px_rgba(34,211,238,0.15)]">
             <svg className="w-56 h-56 transform -rotate-90">
               <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
               <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="628" strokeDashoffset={628 * (countdown / (lastNet === AdNetwork.ADEXIUM ? 12 : 8))} className="text-cyan-400 transition-all duration-1000 ease-linear" />
             </svg>
             <span className="absolute text-8xl font-black tabular-nums italic drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">{countdown}</span>
          </div>
          <h2 className="text-4xl font-black italic uppercase text-white mb-2 tracking-tighter text-center">Synchronizing Nodes</h2>
          <div className="flex items-center gap-3">
            <RefreshCw className="text-cyan-400 animate-spin" size={16} />
            <p className="text-slate-400 text-[10px] uppercase tracking-[0.5em] font-black">Validating Ad Block</p>
          </div>
        </div>
      )}

      {/* Global Node Cooldown Indicator */}
      {cooldown > 0 && !isWatching && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 glass-panel text-white px-10 py-6 rounded-full flex items-center gap-5 shadow-2xl z-40 animate-slide-up border-cyan-500/30">
          <div className="bg-cyan-500/20 p-2 rounded-xl text-cyan-400 animate-spin-slow">
            <Timer size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Node Stabilization</span>
            <span className="text-2xl font-black tabular-nums italic tracking-tight">{cooldown}s</span>
          </div>
        </div>
      )}

      {/* AdBlock Info Modal */}
      {showAdBlockInfo && (
        <div className="fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-3xl p-4 flex items-center justify-center animate-in fade-in duration-300">
           <div className="glass-panel rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl relative animate-slide-up border-white/10 max-h-[90vh] overflow-y-auto no-scrollbar">
              <button 
                onClick={() => setShowAdBlockInfo(false)} 
                className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-slate-500 z-50 hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="p-8 space-y-8">
                <div className="text-center">
                   <div className="inline-flex p-6 bg-amber-400/10 rounded-[2rem] mb-6 text-amber-500 shadow-inner border border-amber-400/20">
                      <ShieldX size={48} className="animate-pulse" />
                   </div>
                   <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Node Integrity Alert</h2>
                   <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest leading-relaxed">Revenue nodes are currently unreachable due to local network interference.</p>
                </div>
                
                <div className="space-y-6">
                   <AdBlockInfoStep 
                     title="Common Causes" 
                     items={[
                       "Active Ad-Blocking extensions (uBlock, AdGuard)",
                       "Browser 'Strict' Privacy/Tracking protection",
                       "VPN or Proxy nodes with ad-filtering",
                       "Network-level blocking (Pi-hole, Firewall)"
                     ]}
                     icon={<HelpCircle size={20} className="text-amber-500"/>} 
                   />
                   
                   <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Resolution Protocol</h4>
                     <div className="grid grid-cols-1 gap-3">
                       <ResolutionStep num={1} text="Disable any ad-blocking extensions for this domain." />
                       <ResolutionStep num={2} text="Add adtonx.web.app to your whitelist/allowlist." />
                       <ResolutionStep num={3} text="Switch to standard browser privacy settings." />
                       <ResolutionStep num={4} text="Refresh the application to re-initialize nodes." />
                     </div>
                   </div>
                </div>

                <div className="bg-cyan-500/5 border border-cyan-500/10 p-5 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Info size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Why is this required?</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
                    AdTONX relies on successful ad block verification to generate TON yield. If ads are suppressed, the revenue loop is broken and rewards cannot be minted.
                  </p>
                </div>

                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-amber-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-[0_15px_30px_-10px_rgba(217,119,6,0.4)] mt-4 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  REFRESH NODE SYNC <RefreshCw size={18} />
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

const AdBlockInfoStep = ({ title, items, icon }: any) => (
  <div className="space-y-3">
    <div className="flex items-center gap-3">
       {icon}
       <h4 className="text-sm font-black text-white uppercase tracking-tight italic">{title}</h4>
    </div>
    <ul className="space-y-2 pl-8">
      {items.map((item: string, i: number) => (
        <li key={i} className="text-[11px] text-slate-500 leading-relaxed font-medium list-disc marker:text-amber-500/40">{item}</li>
      ))}
    </ul>
  </div>
);

const ResolutionStep = ({ num, text }: any) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
    <div className="w-8 h-8 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-black text-amber-500 text-xs">
      {num}
    </div>
    <p className="text-[10px] text-slate-400 font-bold leading-tight">{text}</p>
  </div>
);

const AdNodeButton = ({ active, disabled, onClick, label, sub, icon, theme, highlight }: any) => {
  const isReallyDisabled = disabled || !active;
  
  const themes: Record<string, string> = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    slate: "bg-slate-500/10 text-slate-400 border-slate-500/20"
  };

  return (
    <button 
      onClick={onClick}
      disabled={isReallyDisabled}
      className={`w-full p-8 rounded-[3rem] flex items-center justify-between transition-all relative overflow-hidden ${isReallyDisabled ? 'opacity-30 grayscale pointer-events-none' : 'glass-panel hover:bg-slate-800/60 active:scale-[0.97] border-white/5 shadow-2xl'} ${highlight && !isReallyDisabled ? 'ring-1 ring-cyan-400/30' : ''}`}
    >
      <div className="flex items-center gap-6 relative z-10">
        <div className={`p-5 rounded-2xl border transition-all ${themes[theme] || themes.cyan} ${highlight && !isReallyDisabled ? 'shadow-[0_0_20px_rgba(34,211,238,0.2)] bg-cyan-400/20' : ''}`}>
          {icon}
        </div>
        <div className="text-left">
           <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">{label}</h3>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">{active ? sub : 'Node Offline'}</p>
        </div>
      </div>
      {active && (
        <div className={`p-2.5 rounded-full border relative z-10 ${highlight ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
          <CheckCircle size={20} />
        </div>
      )}
      {highlight && !isReallyDisabled && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 blur-3xl rounded-full -mr-10 -mt-10 animate-pulse"></div>
      )}
    </button>
  );
};
