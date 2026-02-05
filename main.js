AdTONX.pages.home = async function() {
    const user = AdTONX.user;
    
    return `
        <div class="max-w-md mx-auto px-4 pt-6">
            <!-- Header -->
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-2xl font-black text-white uppercase tracking-tighter">Welcome,</h1>
                    <p class="text-cyan-400 font-bold text-lg">${user.first_name}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-slate-500 uppercase tracking-widest font-bold">Node Rank</p>
                    <p class="text-white text-xl font-black">#--</p>
                </div>
            </div>

            <!-- Balance Card -->
            <div class="glass-panel rounded-3xl p-8 mb-8 relative overflow-hidden">
                <div class="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl"></div>
                <div class="relative z-10">
                    <p class="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Total Balance</p>
                    <div class="flex items-end justify-between">
                        <h2 class="text-5xl font-black text-white">${user.balance.toFixed(3)}</h2>
                        <span class="text-cyan-400 font-bold text-lg">TON</span>
                    </div>
                    <div class="flex justify-between mt-6 pt-6 border-t border-white/5">
                        <div class="text-center">
                            <p class="text-xs text-slate-400 uppercase tracking-widest">Today</p>
                            <p class="text-lg font-bold text-cyan-400">${user.today_earnings.toFixed(3)}</p>
                        </div>
                        <div class="text-center">
                            <p class="text-xs text-slate-400 uppercase tracking-widest">Total</p>
                            <p class="text-lg font-bold text-cyan-400">${user.total_earned.toFixed(3)}</p>
                        </div>
                        <div class="text-center">
                            <p class="text-xs text-slate-400 uppercase tracking-widest">Ads</p>
                            <p class="text-lg font-bold text-cyan-400">${user.ads_watched}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-3 gap-4 mb-8">
                <a href="#/ads" class="glass-panel rounded-2xl p-6 text-center group hover:bg-cyan-500/5 transition-all">
                    <i data-lucide="play" class="w-8 h-8 text-cyan-400 mx-auto mb-3"></i>
                    <p class="text-xs font-bold uppercase tracking-widest text-white">Watch Ads</p>
                </a>
                <a href="#/tasks" class="glass-panel rounded-2xl p-6 text-center group hover:bg-cyan-500/5 transition-all">
                    <i data-lucide="check-square" class="w-8 h-8 text-cyan-400 mx-auto mb-3"></i>
                    <p class="text-xs font-bold uppercase tracking-widest text-white">Quests</p>
                </a>
                <a href="#/wallet" class="glass-panel rounded-2xl p-6 text-center group hover:bg-cyan-500/5 transition-all">
                    <i data-lucide="wallet" class="w-8 h-8 text-cyan-400 mx-auto mb-3"></i>
                    <p class="text-xs font-bold uppercase tracking-widest text-white">Withdraw</p>
                </a>
            </div>

            <!-- Weekly Arena -->
            <div class="glass-panel rounded-3xl p-6 mb-8">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-lg font-black text-white uppercase">Weekly Arena</h3>
                        <p class="text-xs text-slate-400">Prize Pool: ${AdTONX.config.PRIZE_POOL} TON</p>
                    </div>
                    <a href="#/leaderboard" class="text-cyan-400 text-xs font-bold uppercase tracking-widest">View</a>
                </div>
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                <span class="text-amber-500 font-black">1</span>
                            </div>
                            <p class="text-white font-bold">Top Validator</p>
                        </div>
                        <p class="text-cyan-400 font-bold">0.20 TON</p>
                    </div>
                    <div class="text-center">
                        <div class="inline-block bg-slate-900/50 rounded-full px-4 py-2">
                            <p class="text-xs text-slate-400">Your Progress: 
                                <span class="text-cyan-400 font-bold ml-2">${user.weekly_ads_watched}/${AdTONX.config.ARENA_ELIGIBILITY}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Referral Section -->
            <div class="glass-panel rounded-3xl p-6">
                <h3 class="text-lg font-black text-white uppercase mb-4">Invite & Earn</h3>
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <p class="text-cyan-400 text-3xl font-black">${user.referral_count}</p>
                        <p class="text-xs text-slate-400">Nodes Invited</p>
                    </div>
                    <div>
                        <p class="text-cyan-400 text-3xl font-black">${user.referral_earnings.toFixed(3)}</p>
                        <p class="text-xs text-slate-400">TON Earned</p>
                    </div>
                </div>
                <div class="bg-slate-900/50 rounded-2xl p-4 mb-4">
                    <p class="text-xs text-slate-400 mb-2">Your Referral Link:</p>
                    <div class="flex items-center gap-2">
                        <input 
                            type="text" 
                            id="referralLink" 
                            readonly 
                            value="https://t.me/${AdTONX.config.BOT_USERNAME}/${AdTONX.config.MINI_APP_NAME}?startapp=ref_${user.telegram_id}" 
                            class="flex-1 bg-transparent text-cyan-400 text-xs font-mono truncate"
                        />
                        <button onclick="copyReferralLink()" class="text-cyan-400 hover:text-cyan-300">
                            <i data-lucide="copy"></i>
                        </button>
                    </div>
                </div>
                <p class="text-xs text-slate-400 text-center">
                    Earn <span class="text-cyan-400 font-bold">0.005 TON</span> for each node that watches 10+ ads
                </p>
            </div>
        </div>
    `;
};

// Helper function
function copyReferralLink() {
    const input = document.getElementById('referralLink');
    if (input) {
        input.select();
        document.execCommand('copy');
        
        // Show success message
        const button = input.nextElementSibling;
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-green-400"></i>';
        
        setTimeout(() => {
            button.innerHTML = originalIcon;
            lucide.createIcons();
        }, 2000);
    }
}