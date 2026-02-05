AdTONX.pages.profile = async function() {
    const user = AdTONX.user;
    const appLink = `https://t.me/${AdTONX.config.BOT_USERNAME}/${AdTONX.config.MINI_APP_NAME}?startapp=ref_${user.telegram_id}`;
    
    return `
        <div class="space-y-6">
            <div class="flex flex-col items-center py-10 bg-slate-900 -mx-4 rounded-b-[4rem] border-b border-white/5 mb-2 relative overflow-hidden">
                <div class="w-28 h-28 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full p-1 shadow-2xl relative z-10">
                    <div class="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-white font-black text-4xl border-4 border-slate-950">
                        ${user.first_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>
                <h2 class="text-3xl font-black mt-6 text-white tracking-tighter italic">@${user.username || user.first_name}</h2>
                <div class="flex items-center gap-2 mt-3 px-4 py-1.5 glass-panel rounded-full border-cyan-500/20">
                    <i data-lucide="shield" class="text-cyan-400 w-4 h-4"></i>
                    <span class="text-[10px] font-black tracking-widest text-cyan-400 uppercase">Verified Node v1.2</span>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="glass-panel p-6 rounded-[2rem] border-white/5">
                    <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Yield</p>
                    <div class="flex items-center gap-2">
                        <i data-lucide="award" class="text-amber-500 w-5 h-5"></i>
                        <span class="font-black text-xl text-white italic">${(user.total_earned || 0).toFixed(4)} <span class="text-[10px] text-slate-500 not-italic">TON</span></span>
                    </div>
                </div>
                <div class="glass-panel p-6 rounded-[2rem] border-white/5">
                    <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Nodes</p>
                    <div class="flex items-center gap-2">
                        <i data-lucide="users" class="text-cyan-400 w-5 h-5"></i>
                        <span class="font-black text-xl text-white italic">${user.referral_count || 0} <span class="text-[10px] text-slate-500 not-italic">REFS</span></span>
                    </div>
                </div>
            </div>

            <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-cyan-500/10">
                <div class="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div class="relative z-10">
                    <h3 class="text-xl font-black flex items-center gap-3 italic uppercase tracking-tight">
                        <i data-lucide="share-2" class="text-cyan-400 w-6 h-6"></i>
                        Expand Network
                    </h3>
                    <p class="text-xs text-slate-400 mt-3 leading-relaxed font-medium">
                        Earn <span class="text-cyan-400 font-black">10% yield commission</span> and <span class="text-cyan-400 font-black">0.005 TON</span> for every verified node in your chain.
                    </p>

                    <div class="mt-8 space-y-4">
                        <div class="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between backdrop-blur-sm group">
                            <span class="text-[10px] font-mono text-cyan-500/60 overflow-hidden text-ellipsis whitespace-nowrap mr-4" id="referralLink">${appLink}</span>
                            <button onclick="copyReferralLink()" id="copyButton" class="p-3 rounded-xl bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600 hover:text-white transition-all">
                                <i data-lucide="copy" class="w-5 h-5"></i>
                            </button>
                        </div>
                        
                        <button onclick="shareLink()" class="w-full bg-cyan-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-cyan-600/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                            <i data-lucide="rocket" class="w-5 h-5"></i> Share Mini App
                        </button>
                    </div>
                </div>
            </div>

            <div class="glass-panel rounded-[2.5rem] overflow-hidden border-white/5 divide-y divide-white/5">
                <button onclick="window.location.hash = '#leaderboard'" class="w-full flex items-center justify-between p-6 active:bg-white/5 transition-colors group">
                    <div class="flex items-center gap-4">
                        <div class="p-2 bg-white/5 rounded-xl border border-white/5"><i data-lucide="trophy" class="text-amber-500 w-5 h-5"></i></div>
                        <span class="text-xs font-black text-white uppercase tracking-widest">Arena Leaderboard</span>
                    </div>
                    <div class="text-slate-700 group-hover:text-cyan-400 transition-all">
                        <span class="text-2xl leading-none">›</span>
                    </div>
                </button>
                
                <button onclick="window.open('${AdTONX.config.OFFICIAL_CHANNEL}', '_blank')" class="w-full flex items-center justify-between p-6 active:bg-white/5 transition-colors group">
                    <div class="flex items-center gap-4">
                        <div class="p-2 bg-white/5 rounded-xl border border-white/5"><i data-lucide="message-square" class="text-cyan-400 w-5 h-5"></i></div>
                        <span class="text-xs font-black text-white uppercase tracking-widest">Join Telegram Community</span>
                    </div>
                    <div class="text-slate-700 group-hover:text-cyan-400 transition-all">
                        <span class="text-2xl leading-none">›</span>
                    </div>
                </button>
            </div>

            <div class="text-center py-8">
                <p class="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">Node ID: ${user.telegram_id}</p>
                <p class="text-[8px] text-slate-800 mt-2 font-bold tracking-widest uppercase">AdTONX Ecosystem • Secured by TON</p>
            </div>
        </div>
        
        <script>
            function copyReferralLink() {
                const link = document.getElementById('referralLink').textContent;
                navigator.clipboard.writeText(link);
                
                const button = document.getElementById('copyButton');
                button.innerHTML = '<i data-lucide="check" class="w-5 h-5 text-green-400"></i>';
                button.classList.remove('bg-cyan-600/20', 'text-cyan-400');
                button.classList.add('bg-emerald-600', 'text-white');
                
                setTimeout(() => {
                    button.innerHTML = '<i data-lucide="copy" class="w-5 h-5"></i>';
                    button.classList.remove('bg-emerald-600', 'text-white');
                    button.classList.add('bg-cyan-600/20', 'text-cyan-400');
                    lucide.createIcons();
                }, 2000);
            }
            
            function shareLink() {
                const link = document.getElementById('referralLink').textContent;
                const text = \`Join AdTONX and earn TON by watching ads! 🚀\\n\\n\${link}\`;
                const shareUrl = \`https://t.me/share/url?url=\${encodeURIComponent(link)}&text=\${encodeURIComponent(text)}\`;
                window.open(shareUrl, '_blank');
            }
        </script>
    `;
};