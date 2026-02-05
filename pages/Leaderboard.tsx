
import React, { useEffect, useState } from 'react';
import { getLeaderboard, PLATFORM_CONFIG } from '../firebase';
import { User } from '../types';
import { Trophy, Award, Crown, Medal, Activity, Timer, ShieldCheck, ShieldAlert } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const board = await getLeaderboard(50);
        setTopUsers(board);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center py-10 glass-panel -mx-4 px-4 rounded-b-[4rem] text-white shadow-2xl relative overflow-hidden mb-8">
        <Trophy className="mx-auto text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] mb-6" size={42} />
        <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Global Arena</h1>
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-400 mt-3">Prize Pool: 5.00 TON Weekly</p>

        <div className="mt-10 flex justify-center items-end gap-6 pb-4">
           {topUsers[1] && <PodiumItem rank={2} user={topUsers[1]} size="sm" />}
           {topUsers[0] && <PodiumItem rank={1} user={topUsers[0]} size="lg" />}
           {topUsers[2] && <PodiumItem rank={3} user={topUsers[2]} size="sm" />}
        </div>
      </div>

      <div className="glass-panel border-amber-500/30 p-5 rounded-[2.5rem] bg-amber-500/5 flex items-center gap-4">
         <ShieldAlert size={24} className="text-amber-500" />
         <div className="flex-1">
            <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1">Eligibility Threshold</h4>
            <p className="text-[11px] font-bold text-slate-300">Min <span className="text-amber-500">{PLATFORM_CONFIG.ARENA_ELIGIBILITY} ad blocks</span> required to qualify for payouts.</p>
         </div>
      </div>

      <div className="glass-panel rounded-[3rem] shadow-2xl overflow-hidden divide-y divide-white/5">
        <div className="p-6 bg-white/5 flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest">
           <span>Network Rank</span>
           <span>Weekly Activity</span>
        </div>
        
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse">Scanning Nodes...</p>
          </div>
        ) : (
          topUsers.map((user, idx) => {
            const isEligible = user.weekly_ads_watched >= PLATFORM_CONFIG.ARENA_ELIGIBILITY;
            return (
              <div key={user.telegram_id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black border ${idx < 3 ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white italic">@{user.username || 'Watcher'}</span>
                        {isEligible && <ShieldCheck size={14} className="text-emerald-400" />}
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{isEligible ? 'ELITE STATUS' : 'SYNCING...'}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`text-xl font-black tabular-nums italic tracking-tighter ${isEligible ? 'text-emerald-400' : 'text-white'}`}>{user.weekly_ads_watched}</span>
                    <div className="flex items-center justify-end gap-1 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                       <Activity size={10} /> {Math.min(100, Math.floor((user.weekly_ads_watched / PLATFORM_CONFIG.ARENA_ELIGIBILITY) * 100))}%
                    </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const PodiumItem = ({ rank, user, size }: any) => {
  const color = rank === 1 ? '#fbbf24' : rank === 2 ? '#cbd5e1' : '#fb923c';
  return (
    <div className="flex flex-col items-center">
       <div className={`relative ${size === 'lg' ? 'w-24 h-24' : 'w-20 h-20'} rounded-full border-4 flex items-center justify-center bg-slate-900 shadow-2xl`} style={{ borderColor: color }}>
          <span className={`${size === 'lg' ? 'text-3xl' : 'text-xl'} font-black`}>{user.first_name?.[0]}</span>
          <div className="absolute -bottom-2 bg-slate-950 p-1.5 rounded-full border-2 border-slate-800">
             {rank === 1 ? <Crown size={16} className="text-amber-400" /> : <Medal size={16} className="text-slate-400" />}
          </div>
       </div>
       <span className="text-[10px] font-black text-white mt-6 uppercase truncate max-w-[80px]">@{user.username}</span>
    </div>
  );
};

export default Leaderboard;
