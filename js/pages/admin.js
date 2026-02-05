AdTONX.pages.admin = async function() {
    const user = AdTONX.user;
    
    // 检查是否为管理员
    if (!user || !user.isAdmin) {
        return `
            <div class="min-h-screen flex flex-col items-center justify-center p-10 text-center">
                <div class="p-10 bg-red-500/5 rounded-[3rem] text-red-500 mb-10 border border-red-500/10">
                    <i data-lucide="shield-off" class="w-16 h-16"></i>
                </div>
                <h2 class="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">Access Denied</h2>
                <p class="text-slate-500 text-xs mb-12 max-w-xs leading-relaxed uppercase tracking-widest font-bold opacity-80">Admin privileges required</p>
                <button 
                    onclick="window.location.hash = '#home'"
                    class="w-full max-w-xs bg-cyan-600/10 text-cyan-400 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] border border-cyan-500/20 shadow-xl active:scale-95 transition-all hover:bg-cyan-600/20"
                >
                    Return Home
                </button>
            </div>
        `;
    }

    return `
        <div class="min-h-screen bg-slate-950 text-slate-200 flex overflow-hidden">
            <div class="flex-1 flex flex-col overflow-hidden">
                <header class="h-16 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between">
                    <span class="text-xs font-black uppercase text-slate-500 tracking-widest">Admin Panel</span>
                    <div class="flex items-center gap-4">
                        <button onclick="window.location.reload()" class="text-slate-500 hover:text-red-500 p-2">
                            <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                        </button>
                    </div>
                </header>

                <div class="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-950">
                    <div class="space-y-8">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
                                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Total Nodes</p>
                                <p class="text-xl font-black italic text-white" id="totalUsers">0</p>
                            </div>
                            <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
                                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Platform Reserve</p>
                                <p class="text-xl font-black italic text-white" id="platformReserve">0 TON</p>
                            </div>
                            <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
                                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Pending Withdrawals</p>
                                <p class="text-xl font-black italic text-white" id="pendingWithdrawals">0</p>
                            </div>
                            <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
                                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Revenue Log</p>
                                <p class="text-xl font-black italic text-white">INSTANT</p>
                            </div>
                        </div>
                        
                        <div class="bg-slate-900 p-12 rounded-[3rem] border border-slate-800 flex flex-col items-center justify-center text-center gap-6">
                            <i data-lucide="trophy" class="w-16 h-16 text-amber-500 animate-bounce"></i>
                            <div>
                                <h3 class="text-2xl font-black italic uppercase">Weekly Arena Settlement</h3>
                                <p class="text-sm text-slate-500 max-w-sm mx-auto mt-2">Identify top 100 eligible users (700+ ads) and distribute prize pool.</p>
                            </div>
                            <button onclick="handleSettleRewards()" class="bg-amber-600 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-amber-600/20 active:scale-95 transition-all">Finalize Arena Cycles</button>
                        </div>
                        
                        <div class="space-y-6">
                            <div class="relative">
                                <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5"></i>
                                <input type="text" placeholder="Scan Telegram ID..." id="userSearch" class="w-full bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none" oninput="searchUsers()"/>
                            </div>
                            <div class="bg-slate-900 rounded-3xl overflow-hidden">
                                <div id="usersTable"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

async function loadAdminStats() {
    try {
        // 这里需要实现具体的统计获取逻辑
        document.getElementById('totalUsers').textContent = 'Loading...';
        document.getElementById('platformReserve').textContent = 'Loading...';
        document.getElementById('pendingWithdrawals').textContent = 'Loading...';
        
        // 实际实现时需要调用firebaseService中的方法
        // const stats = await firebaseService.adminGetStats();
        // 更新DOM...
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    // 实现用户搜索逻辑
}

function handleSettleRewards() {
    if (confirm("Confirm distribution of 5.0 TON to top 100 eligible users and global reset?")) {
        // 实现结算奖励逻辑
        alert("Settlement Complete");
        loadAdminStats();
    }
}