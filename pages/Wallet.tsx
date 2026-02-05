
import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types.ts';
import { 
  Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, Info, 
  History as HistoryIcon, Clock, CheckCircle2, XCircle, AlertCircle, 
  PlayCircle, Users, Award, Copy, Check, ShieldCheck, Link as LinkIcon 
} from 'lucide-react';
import { db, logTransaction, updateUserBalance, getUserTransactions } from '../firebase.ts';
import { collection, addDoc } from 'firebase/firestore';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';

interface WalletProps {
  user: User;
  onUpdateUser: (u: User) => void;
}

const Wallet: React.FC<WalletProps> = ({ user, onUpdateUser }) => {
  const [tab, setTab] = useState<'deposit' | 'withdraw' | 'history'>('withdraw');
  const [amount, setAmount] = useState('');
  const [walletAddr, setWalletAddr] = useState(user.wallet_address || '');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  const connectedAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const depositAddress = "UQCPPw01FTldjEuWeeup-wf80MJFGaB86IrQ1q-h_QpuDjc1";

  useEffect(() => {
    if (tab === 'history') {
      fetchHistory();
    }
  }, [tab]);

  // Sync connected wallet address to form
  useEffect(() => {
    if (connectedAddress) {
      setWalletAddr(connectedAddress);
    }
  }, [connectedAddress]);

  const fetchHistory = async () => {
    setFetchingHistory(true);
    try {
      const data = await getUserTransactions(user.telegram_id);
      setTransactions(data);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val < 2) return alert("Minimum withdrawal is 2 TON");
    if (val > user.balance) return alert("Insufficient balance");
    if (!walletAddr) return alert("Please connect a wallet or provide a TON address");

    setLoading(true);
    const fee = val * 0.20;
    const netAmount = val - fee;

    try {
      await updateUserBalance(user.telegram_id, -val, false);
      
      await addDoc(collection(db, "withdrawals"), {
        user_id: user.telegram_id,
        username: user.username,
        amount: val,
        fee: fee,
        net_amount: netAmount,
        wallet_address: walletAddr,
        status: 'pending',
        requested_at: new Date().toISOString()
      });

      await logTransaction({
        user_id: user.telegram_id,
        type: 'withdraw',
        amount: -val,
        fee: fee,
        status: 'pending',
        description: `Withdrawal Request to ${walletAddr.substring(0, 6)}...`
      });

      onUpdateUser({
        ...user,
        balance: user.balance - val,
        wallet_address: walletAddr
      });

      alert(`Request submitted! You will receive ${netAmount.toFixed(3)} TON after 20% fee.`);
      setAmount('');
      setTab('history');
    } catch (err) {
      alert("Withdrawal failed. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Deposit system is manual. Please contact @AdTONX_Admin to purchase ad credits or task clicks.");
  };

  const getTxIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'ad': return <PlayCircle className="text-cyan-500" size={18} />;
      case 'task': return <Award className="text-purple-500" size={18} />;
      case 'referral': return <Users className="text-emerald-500" size={18} />;
      case 'withdraw': return <ArrowDownCircle className="text-red-500" size={18} />;
      case 'deposit': return <ArrowUpCircle className="text-blue-500" size={18} />;
      default: return <AlertCircle size={18} />;
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <span className="text-cyan-400 font-black tracking-widest text-[10px] uppercase">Vault Balance</span>
          <WalletIcon size={20} className="text-slate-500" />
        </div>
        <div className="mt-8 relative z-10">
          <h2 className="text-5xl font-black flex items-baseline gap-2 tracking-tighter italic">
            {(user.balance || 0).toFixed(4)} <span className="text-xl font-black text-slate-500 not-italic uppercase tracking-widest">TON</span>
          </h2>
          <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest opacity-60">Verified Liquid Assets</p>
        </div>
      </div>

      <div className="flex p-1 glass-panel rounded-2xl border border-white/5 shadow-inner">
        <TabButton active={tab === 'withdraw'} onClick={() => setTab('withdraw')} icon={<ArrowDownCircle size={18} />} label="Withdraw" />
        <TabButton active={tab === 'deposit'} onClick={() => setTab('deposit')} icon={<ArrowUpCircle size={18} />} label="Deposit" />
        <TabButton active={tab === 'history'} onClick={() => setTab('history')} icon={<HistoryIcon size={18} />} label="History" />
      </div>

      {tab === 'withdraw' ? (
        <form onSubmit={handleWithdraw} className="glass-panel p-6 rounded-[2.5rem] shadow-sm space-y-6 animate-in slide-in-from-left duration-300">
          
          <div className="p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-2">
                 <LinkIcon size={16} className="text-cyan-400" />
                 <h4 className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">External Wallet Protocol</h4>
              </div>
              <p className="text-[11px] font-bold text-slate-400 max-w-[200px]">Connect your TON wallet for automatic destination verification.</p>
              <TonConnectButton />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Withdrawal Amount (Min 2 TON)</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.0001" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 p-5 rounded-2xl font-black text-2xl focus:ring-2 focus:ring-cyan-500 outline-none tabular-nums text-white"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-500 uppercase italic">TON</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Wallet</label>
              {connectedAddress && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                  <ShieldCheck size={12} /> Verified
                </div>
              )}
            </div>
            <input 
              type="text" 
              placeholder="UQ..."
              value={walletAddr}
              readOnly={!!connectedAddress}
              onChange={(e) => setWalletAddr(e.target.value)}
              className={`w-full bg-slate-950/50 border border-white/5 p-5 rounded-2xl font-mono text-[10px] focus:ring-2 focus:ring-cyan-500 outline-none text-white ${connectedAddress ? 'opacity-50' : ''}`}
            />
          </div>

          {amount && !isNaN(parseFloat(amount)) && (
            <div className="bg-cyan-500/10 p-4 rounded-2xl flex items-center justify-between text-xs font-black text-cyan-400 shadow-sm border border-cyan-500/20">
              <span className="uppercase tracking-widest">Platform Fee (20%)</span>
              <span className="tabular-nums">{(parseFloat(amount) * 0.2).toFixed(4)} TON</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-600 text-white p-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-cyan-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <ArrowDownCircle size={20} />}
            Finalize Withdrawal
          </button>

          <div className="flex gap-3 items-start text-[10px] text-slate-400 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 italic">
            <Info size={16} className="shrink-0 text-slate-500" />
            <p>Verification protocol: Assets are processed via AdTONX Node within 5-30 minutes. Connecting a wallet ensures your address is correct.</p>
          </div>
        </form>
      ) : tab === 'deposit' ? (
        <div className="glass-panel p-10 rounded-[2.5rem] shadow-sm text-center space-y-8 animate-in slide-in-from-right duration-300">
          <div className="w-20 h-20 bg-cyan-500/10 text-cyan-400 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm border border-cyan-500/20">
            <ArrowUpCircle size={40} />
          </div>
          <div>
            <h3 className="font-black text-xl text-white tracking-tight italic uppercase">Deposit TON Assets</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">Operate your own ad nodes or promote tasks by topping up your account balance.</p>
          </div>
          <div className="bg-slate-950 p-6 rounded-2xl text-left space-y-3 shadow-inner border border-white/5 relative group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Smart Contract Address</p>
              <button 
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[11px] font-mono break-all text-cyan-400 leading-relaxed pr-8">{depositAddress}</p>
            {copied && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce shadow-xl">
                Address Copied!
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 italic font-bold uppercase tracking-widest">Sync receipt with @AdTONX_Support after transfer.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          {fetchingHistory ? (
             <div className="py-20 text-center">
                <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning Ledger...</p>
             </div>
          ) : transactions.length === 0 ? (
             <div className="py-20 text-center glass-panel rounded-[2.5rem] border-dashed border-white/5">
                <HistoryIcon size={48} className="mx-auto text-slate-800 mb-4" />
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No record found on chain</p>
             </div>
          ) : (
            <div className="glass-panel rounded-[2.5rem] shadow-sm overflow-hidden divide-y divide-white/5">
              {transactions.map((tx) => (
                <div key={tx.tx_id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/5 p-3 rounded-2xl shadow-inner border border-white/5">
                      {getTxIcon(tx.type)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white uppercase tracking-tighter">{tx.description}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={10} className="text-slate-500" />
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{formatTimestamp(tx.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-black tabular-nums ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(4)}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {tx.status === 'completed' ? <CheckCircle2 size={10} className="text-emerald-400" /> : tx.status === 'failed' ? <XCircle size={10} className="text-red-400" /> : <Clock size={10} className="text-amber-400" />}
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{tx.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${active ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500'}`}
  >
    {icon} {label}
  </button>
);

export default Wallet;
