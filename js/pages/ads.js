AdTONX.pages.ads = async function() {
    const user = AdTONX.user;
    const DAILY_LIMIT = 3000;
    
    return `
        <div class="space-y-6 pb-6 select-none relative">
            <div class="text-center py-12 glass-panel -mx-4 px-4 rounded-b-[4rem] relative overflow-hidden border-b border-cyan-500/20">
                <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.1)_0%,_transparent_70%)] animate-pulse"></div>
                <div class="relative z-10">
                    <div class="inline-flex p-4 bg-cyan-400/10 rounded-[1.5rem] mb-4 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        <i data-lucide="video" class="w-9 h-9"></i>
                    </div>
                    <h1 class="text-3xl font-black text-white tracking-tighter uppercase italic">Yield Nodes</h1>
                    <p class="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-[0.5em]">Real-time Payout Stream</p>
                </div>
            </div>

            <div class="space-y-6 px-1">
                <div class="ad-node" data-network="adsgram">
                    <div class="flex items-center gap-6">
                        <div class="p-5 rounded-2xl border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                            <i data-lucide="film" class="w-8 h-8"></i>
                        </div>
                        <div class="text-left">
                            <h3 class="text-2xl font-black italic tracking-tighter uppercase text-white">Watch Adsgram Video</h3>
                            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Premium 0.0035 TON Protocol</p>
                        </div>
                    </div>
                    <div class="p-2.5 rounded-full border bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                        <i data-lucide="check-circle" class="w-5 h-5"></i>
                    </div>
                </div>
                
                <div class="ad-node" data-network="monetag">
                    <div class="flex items-center gap-6">
                        <div class="p-5 rounded-2xl border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                            <i data-lucide="shield-check" class="w-8 h-8"></i>
                        </div>
                        <div class="text-left">
                            <h3 class="text-2xl font-black italic tracking-tighter uppercase text-white">Monetag Native Ad</h3>
                            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Stable Yield Stream</p>
                        </div>
                    </div>
                    <div class="p-2.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                        <i data-lucide="check-circle" class="w-5 h-5"></i>
                    </div>
                </div>
                
                <div class="ad-node" data-network="adexium">
                    <div class="flex items-center gap-6">
                        <div class="p-5 rounded-2xl border bg-slate-500/10 text-slate-400 border-slate-500/20">
                            <i data-lucide="activity" class="w-8 h-8"></i>
                        </div>
                        <div class="text-left">
                            <h3 class="text-2xl font-black italic tracking-tighter uppercase text-white">Adexium Widget</h3>
                            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Interstitial Sync Node</p>
                        </div>
                    </div>
                    <div class="p-2.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                        <i data-lucide="check-circle" class="w-5 h-5"></i>
                    </div>
                </div>
            </div>

            <div class="glass-panel p-6 rounded-[2.5rem] space-y-4 border-white/5 shadow-2xl relative overflow-hidden">
                <div class="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Cycle Capacity Meter</span>
                    <span class="text-white tabular-nums">${user.ads_watched || 0} / ${DAILY_LIMIT} Blocks</span>
                </div>
                <div class="h-4 w-full bg-slate-950/80 rounded-full overflow-hidden p-1 border border-white/5">
                    <div 
                        class="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-blue-500 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)]" 
                        style="width: ${Math.min(((user.ads_watched || 0) / DAILY_LIMIT) * 100, 100)}%" 
                    />
                </div>
                <p class="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic text-center">Protocol Limit: ${DAILY_LIMIT} Daily</p>
            </div>
        </div>
        
        <script>
            // 添加点击事件
            document.querySelectorAll('.ad-node').forEach(node => {
                node.addEventListener('click', function() {
                    const network = this.getAttribute('data-network');
                    watchAd(network);
                });
            });
            
            function watchAd(network) {
                alert('Watching ' + network + ' ad...');
                // 这里需要实现实际的广告观看逻辑
            }
        </script>
    `;
};