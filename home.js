AdTONX.pages.home = async function() {
    const user = AdTONX.user;
    
    return `
        <div class="space-y-6 pb-4">
            <div class="flex items-center justify-between px-2">
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <div class="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full"></div>
                        <img src="https://i.ibb.co/NgbS3j2F/logo.png" class="w-12 h-12 rounded-full object-cover border-2 border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] relative z-10" alt="AdTONX" />
                    </div>
                    <span class="text-2xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">AdTONX</span>
                </div>
                <button onclick="window.location.hash = '#profile'" class="p-2.5 glass-panel rounded-2xl active:scale-95 transition-all text-cyan-400 border-white/5">
                    <i data-lucide="activity" class="w-5 h-5"></i>
                </button>
            </div>

            <div class="relative group overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/5">
                <img 
                    src="https://i.ibb.co/p63387My/hero.png" 
                    alt="Welcome" 
                    class="w-full h-52 object-cover transition-transform duration-[2s] group-hover:scale-110"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-8">
                    <p class="text-white font-black text-4xl italic tracking-tighter uppercase leading-none mb-1">Blockchain Power</p>
                    <div class="flex items-center gap-2 mt-2">
                        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                        <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Node Protocol v1.2</p>
                    </div>
                </div>
            </div>

            <div class="glass-panel rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden border-white/10">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <div class="p-2 bg-cyan-400/10 rounded-lg text-cyan-400"><i data-lucide="info" class="w-4 h-4"></i></div>
                        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Yield Engine Guide</h3>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                    <div class="flex flex-col items-center gap-1.5 p-4 rounded-3xl bg-white/5 border border-white/5 shadow-inner">
                        <div class="bg-cyan-400/5 text-cyan-400 p-2 rounded-xl"><i data-lucide="play-circle" class="w-4 h-4"></i></div>
                        <span class="text-[9px] font-black uppercase tracking-[0.1em] text-cyan-400">VERIFY</span>
                        <span class="text-[8px] font-bold uppercase tracking-tighter text-slate-500 text-center">Watch Ads</span>
                    </div>
                    <div class="flex flex-col items-center gap-1.5 p-4 rounded-3xl bg-white/5 border border-white/5 shadow-inner">
                        <div class="bg-purple-400/5 text-purple-400 p-2 rounded-xl"><i data-lucide="check-square" class="w-4 h-4"></i></div>
                        <span class="text-[9px] font-black uppercase tracking-[0.1em] text-purple-400">SYNC</span>
                        <span class="text-[8px] font-bold uppercase tracking-tighter text-slate-500 text-center">Finish Tasks</span>
                    </div>
                    <div class="flex flex-col items-center gap-1.5 p-4 rounded-3xl bg-white/5 border border-white/5 shadow-inner">
                        <div class="bg-emerald-400/5 text-emerald-400 p-2 rounded-xl"><i data-lucide="wallet" class="w-4 h-4"></i></div>
                        <span class="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-400">PAYOUT</span>
                        <span class="text-[8px] font-bold uppercase tracking-tighter text-slate-500 text-center">Claim TON</span>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
                <div class="relative z-10">
                    <div class="flex items-center justify-between mb-4">
                        <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Vault Liquidity</p>
                        <div class="px-3 py-1 bg-cyan-400/10 rounded-lg border border-cyan-400/20 text-[8px] font-black uppercase tracking-widest text-cyan-400 animate-pulse">Node Syncing</div>
                    </div>
                    <div class="flex items-end gap-3">
                        <span class="text-6xl font-black tracking-tighter italic drop-shadow-[0_0_15px_rgba(34,211,238,0.2)] text-white">${(user.balance || 0).toFixed(4)}</span>
                        <span class="text-xl font-black mb-1.5 italic text-slate-500 uppercase tracking-widest">TON</span>
                    </div>
                    <div class="mt-10 grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                        <div class="flex flex-col">
                            <p class="text-[9px] text-slate-600 uppercase tracking-widest font-black mb-2">Cycle Earnings</p>
                            <p class="font-black text-lg tabular-nums text-emerald-400">+${(user.today_earnings || 0).toFixed(4)}</p>
                        </div>
                        <div class="flex flex-col items-end">
                            <p class="text-[9px] text-slate-600 uppercase tracking-widest font-black mb-2">Block Views</p>
                            <p class="font-black text-lg tabular-nums text-cyan-400">${user.ads_watched || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <button onclick="window.location.hash = '#ads'" class="w-full p-8 rounded-[2.5rem] border border-white/5 transition-all flex items-center justify-between glass-panel hover:bg-slate-900 shadow-2xl shadow-cyan-900/10 active:scale-[0.98]">
                <div class="flex items-center gap-6">
                    <div class="p-4 rounded-3xl bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                        <i data-lucide="zap" class="w-8 h-8"></i>
                    </div>
                    <div class="text-left">
                        <h4 class="text-xl font-black text-white uppercase tracking-tighter italic">Flash Validator</h4>
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Adsgram High-Speed Cycle</p>
                    </div>
                </div>
                <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-cyan-400">
                    <i data-lucide="chevron-right" class="w-6 h-6"></i>
                </div>
            </button>

            <div class="grid grid-cols-2 gap-4">
                <button onclick="window.location.hash = '#ads'" class="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center gap-4 active:scale-95 transition-all border-white/5 shadow-lg">
                    <div class="text-cyan-400 bg-cyan-400/5 p-5 rounded-[1.5rem] shadow-inner">
                        <i data-lucide="play-circle" class="w-7 h-7"></i>
                    </div>
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">AD NODES</span>
                </button>
                <button onclick="window.location.hash = '#tasks'" class="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center gap-4 active:scale-95 transition-all border-white/5 shadow-lg">
                    <div class="text-purple-400 bg-purple-400/5 p-5 rounded-[1.5rem] shadow-inner">
                        <i data-lucide="award" class="w-7 h-7"></i>
                    </div>
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">QUESTS</span>
                </button>
            </div>
        </div>
    `;
};