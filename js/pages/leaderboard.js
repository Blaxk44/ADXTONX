AdTONX.pages.leaderboard = async function() {
    return `
        <div class="space-y-6">
            <div class="text-center py-10 glass-panel -mx-4 px-4 rounded-b-[4rem] text-white shadow-2xl relative overflow-hidden mb-8">
                <i data-lucide="trophy" class="mx-auto text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] mb-6 w-10 h-10"></i>
                <h1 class="text-4xl font-black tracking-tighter uppercase italic leading-none">Global Arena</h1>
                <p class="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-400 mt-3">Prize Pool: 5.00 TON Weekly</p>
            </div>

            <div class="glass-panel border-amber-500/30 p-5 rounded-[2.5rem] bg-amber-500/5 flex items-center gap-4">
                <i data-lucide="shield-alert" class="text-amber-500 w-6 h-6"></i>
                <div class="flex-1">
                    <h4 class="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1">Eligibility Threshold</h4>
                    <p class="text-[11px] font-bold text-slate-300">Min <span class="text-amber-500">700 ad blocks</span> required to qualify for payouts.</p>
                </div>
            </div>

            <div class="glass-panel rounded-[3rem] shadow-2xl overflow-hidden divide-y divide-white/5">
                <div class="p-6 bg-white/5 flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Network Rank</span>
                    <span>Weekly Activity</span>
                </div>
                
                <div class="py-24 text-center">
                    <div class="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse">Scanning Nodes...</p>
                </div>
            </div>
        </div>
    `;
};