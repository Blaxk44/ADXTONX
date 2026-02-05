
import React, { useState } from 'react';
import { User } from '../types.ts';
import { 
  Share2, Users, Award, History, Shield, Copy, 
  CheckCircle, Trophy, Settings as SettingsIcon,
  MessageSquare, ExternalLink, Rocket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PLATFORM_CONFIG } from '../firebase.ts';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Official Telegram Mini App Direct Link format
  const appLink = `${PLATFORM_CONFIG.MINI_APP_LINK}?startapp=ref_${user.telegram_id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `Join AdTONX and earn TON by watching ads! 🚀\n\n${appLink}`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appLink)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <div className="flex flex-col items-center py-10 bg-slate-900 -mx-4 rounded-b-[4rem] border-b border-white/5 mb-2 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.1)_0%,_transparent_70%)]"></div>
        <div className="w-28 h-28 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full p-1 shadow-2xl relative z-10">
           <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-white font-black text-4xl border-4 border-slate-950">
             {user.first_name?.[0]?.toUpperCase() || 'U'}
           </div>
        </div>
        <h2 className="text-3xl font-black mt-6 text-white tracking-tighter italic">@{user.username || user.first_name}</h2>
        <div className="flex items-center gap-2 mt-3 px-4 py-1.5 glass-panel rounded-full border-cyan-500/20">
          <Shield size={14} className="text-cyan-400" />
          <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">Verified Node v1.2</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-6 rounded-[2rem] border-white/5">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Yield</p>
          <div className="flex items-center gap-2">
             <Award size={20} className="text-amber-500" />
             <span className="font-black text-xl text-white italic">{(user.total_earned || 0).toFixed(4)} <span className="text-[10px] text-slate-500 not-italic">TON</span></span>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-[2rem] border-white/5">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Nodes</p>
          <div className="flex items-center gap-2">
             <Users size={20} className="text-cyan-400" />
             <span className="font-black text-xl text-white italic">{user.referral_count || 0} <span className="text-[10px] text-slate-500 not-italic">REFS</span></span>
          </div>
        </div>
      </div>

      {/* Referral Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-cyan-500/10">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-black flex items-center gap-3 italic uppercase tracking-tight">
            <Share2 size={24} className="text-cyan-400" />
            Expand Network
          </h3>
          <p className="text-xs text-slate-400 mt-3 leading-relaxed font-medium">
            Earn <span className="text-cyan-400 font-black">10% yield commission</span> and <span className="text-cyan-400 font-black">0.005 TON</span> for every verified node in your chain.
          </p>

          <div className="mt-8 space-y-4">
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between backdrop-blur-sm group">
              <span className="text-[10px] font-mono text-cyan-500/60 overflow-hidden text-ellipsis whitespace-nowrap mr-4">{appLink}</span>
              <button onClick={copyToClipboard} className={`p-3 rounded-xl transition-all ${copied ? 'bg-emerald-600' : 'bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600 hover:text-white'}`}>
                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              </button>
            </div>
            
            <button 
              onClick={handleShare}
              className="w-full bg-cyan-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-cyan-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Rocket size={20} /> Share Mini App
            </button>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="glass-panel rounded-[2.5rem] overflow-hidden border-white/5 divide-y divide-white/5">
        <MenuItem onClick={() => navigate('/leaderboard')} icon={<Trophy size={20} className="text-amber-500" />} label="Arena Leaderboard" />
        <MenuItem onClick={() => window.open(PLATFORM_CONFIG.OFFICIAL_CHANNEL, '_blank')} icon={<MessageSquare size={20} className="text-cyan-400" />} label="Join Telegram Community" />
        <MenuItem icon={<ExternalLink size={20} className="text-slate-500" />} label="TON Blockchain Explorer" />
        <MenuItem icon={<SettingsIcon size={20} className="text-slate-500" />} label="Node Settings" />
      </div>

      <div className="text-center py-8">
        <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">Node ID: {user.telegram_id}</p>
        <p className="text-[8px] text-slate-800 mt-2 font-bold tracking-widest uppercase">AdTONX Ecosystem • Secured by TON</p>
      </div>
    </div>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-6 active:bg-white/5 transition-colors group">
    <div className="flex items-center gap-4">
      <div className="p-2 bg-white/5 rounded-xl border border-white/5">{icon}</div>
      <span className="text-xs font-black text-white uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-slate-700 group-hover:text-cyan-400 group-active:translate-x-1 transition-all">
      <span className="text-2xl leading-none">›</span>
    </div>
  </button>
);

export default Profile;
