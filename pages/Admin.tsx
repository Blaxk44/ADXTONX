
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, DollarSign, Settings, 
  Search, Ban, CheckCircle, XCircle, ArrowUpRight, 
  Wallet, Activity, Bell, LogOut, Menu, X, 
  RefreshCw, Zap, LayoutGrid, PieChart, Trophy, HandCoins
} from 'lucide-react';
import { 
  adminGetStats, adminGetAllUsers, adminUpdateUser, 
  adminGetPendingWithdrawals, adminProcessWithdrawal, 
  adminGetSettings, adminUpdateSettings, settleWeeklyRewards 
} from '../firebase.ts';
import { User, Withdrawal } from '../types.ts';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'withdrawals' | 'settings'>('dashboard');
  const [stats, setStats] = useState({ totalUsers: 0, platformReserve: 0, pendingWithdrawals: 0, totalAdRevenue: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [settings, setSettings] = useState({ minWithdrawal: 2, withdrawalFee: 20, refCommission: 10, adCooldown: 10 });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [s, u, w, set] = await Promise.all([
        adminGetStats(),
        adminGetAllUsers(100),
        adminGetPendingWithdrawals(),
        adminGetSettings()
      ]);
      setStats(s);
      setUsers(u);
      setWithdrawals(w);
      setSettings(prev => ({ ...prev, ...(set as any) }));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [activeTab]);

  const handleSettleRewards = async () => {
    if (!confirm("Confirm distribution of 5.0 TON to top 100 eligible users and global reset?")) return;
    try {
      const res = await settleWeeklyRewards();
      alert(`Settlement Complete: ${res.winnersCount} nodes rewarded.`);
      load();
    } catch (e) { alert("Settlement Error"); }
  };

  const handleBan = async (uId: string, current: string) => {
    if (!confirm("Toggle user restriction?")) return;
    await adminUpdateUser(uId, { status: current === 'banned' ? 'active' : 'banned' });
    load();
  };

  const handleWithdrawal = async (wId: string, status: 'completed' | 'failed') => {
    if (!confirm(`Mark as ${status.toUpperCase()}?`)) return;
    await adminProcessWithdrawal(wId, status);
    load();
  };

  const filtered = users.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.telegram_id.includes(searchTerm));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex overflow-hidden -mx-4 -mt-6">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 border-r border-slate-800 transition-all flex flex-col z-50`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <ShieldCheck size={24} className="text-red-600" />
          {sidebarOpen && <span className="font-black italic text-white uppercase truncate">AdTONX Admin</span>}
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutGrid size={18} />} label="Stats" open={sidebarOpen} />
          <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18} />} label="Users" open={sidebarOpen} />
          <NavItem active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} icon={<HandCoins size={18} />} label="Payouts" open={sidebarOpen} badge={stats.pendingWithdrawals} />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18} />} label="System" open={sidebarOpen} />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between">
           <span className="text-xs font-black uppercase text-slate-500 tracking-widest">{activeTab} node</span>
           <div className="flex items-center gap-4">
              <span className="text-xs font-black text-emerald-400 tabular-nums">RESERVE: {stats.platformReserve.toFixed(2)} TON</span>
              <button onClick={() => window.location.reload()} className="p-2 hover:text-red-500"><LogOut size={18}/></button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-950">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total Nodes" value={stats.totalUsers.toLocaleString()} />
                <StatCard label="Platform Reserve" value={`${stats.platformReserve.toFixed(2)} TON`} />
                <StatCard label="Pending" value={stats.pendingWithdrawals.toString()} />
                <StatCard label="Revenue Log" value="INSTANT" />
              </div>
              <div className="bg-slate-900 p-12 rounded-[3rem] border border-slate-800 flex flex-col items-center justify-center text-center gap-6">
                  <Trophy size={64} className="text-amber-500 animate-bounce" />
                  <div>
                    <h3 className="text-2xl font-black italic uppercase">Weekly Arena Settlement</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">Identify top 100 eligible users (700+ ads) and distribute prize pool.</p>
                  </div>
                  <button onClick={handleSettleRewards} className="bg-amber-600 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-amber-600/20 active:scale-95 transition-all">Finalize Arena Cycles</button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" placeholder="Scan Telegram ID..." className="w-full bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
               </div>
               <div className="bg-slate-900 rounded-3xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead><tr className="bg-slate-950 text-slate-600 font-black uppercase tracking-widest"><th className="p-6">User</th><th className="p-6">Balance</th><th className="p-6">Weekly</th><th className="p-6">Status</th><th className="p-6 text-right">Edit</th></tr></thead>
                    <tbody className="divide-y divide-slate-800">
                      {filtered.map(u => (
                        <tr key={u.telegram_id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-6 font-bold">@{u.username}</td>
                          <td className="p-6 text-emerald-400 font-black italic tabular-nums">{u.balance.toFixed(4)}</td>
                          <td className="p-6 tabular-nums">{u.weekly_ads_watched} blocks</td>
                          <td className="p-6 uppercase font-black text-[9px]"><span className={u.status === 'banned' ? 'text-red-500' : 'text-emerald-500'}>{u.status}</span></td>
                          <td className="p-6 text-right">
                             <button onClick={() => handleBan(u.telegram_id, u.status)} className={`p-2 rounded-xl ${u.status === 'banned' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}><Ban size={14}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeTab === 'withdrawals' && (
             <div className="space-y-4">
               {withdrawals.length === 0 ? <p className="text-center py-20 text-slate-600 italic uppercase font-black">No pending requests</p> : withdrawals.map(w => (
                 <div key={w.withdrawal_id} className="bg-slate-900 p-8 rounded-[2.5rem] flex items-center justify-between border border-slate-800">
                   <div>
                      <h4 className="font-black italic">@{w.username || 'Watcher'}</h4>
                      <p className="text-[10px] font-mono text-cyan-500 mt-2">{w.wallet_address}</p>
                   </div>
                   <div className="text-right flex items-center gap-6">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Net Payout</p>
                        <p className="text-xl font-black text-emerald-400 tabular-nums">{w.net_amount.toFixed(3)} TON</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleWithdrawal(w.withdrawal_id, 'completed')} className="bg-emerald-600 p-3 rounded-xl"><CheckCircle size={18}/></button>
                        <button onClick={() => handleWithdrawal(w.withdrawal_id, 'failed')} className="bg-red-600 p-3 rounded-xl"><XCircle size={18}/></button>
                      </div>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label, open, badge }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl relative ${active ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
    {icon} {open && <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>}
    {badge > 0 && <span className="absolute right-3 w-4 h-4 bg-emerald-500 rounded-full text-[8px] flex items-center justify-center font-black">{badge}</span>}
  </button>
);

const StatCard = ({ label, value }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-sm">
     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">{label}</p>
     <p className="text-xl font-black italic text-white">{value}</p>
  </div>
);

export default Admin;
