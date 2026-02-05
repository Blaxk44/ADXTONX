AdTONX.pages.wallet = async function() {
    const user = AdTONX.user;
    
    return `
        <div class="space-y-6 pb-12">
            <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
                <div class="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div class="flex items-center justify-between relative z-10">
                    <span class="text-cyan-400 font-black tracking-widest text-[10px] uppercase">Vault Balance</span>
                    <i data-lucide="wallet" class="text-slate-500 w-5 h-5"></i>
                </div>
                <div class="mt-8 relative z-10">
                    <h2 class="text-5xl font-black flex items-baseline gap-2 tracking-tighter italic">
                        ${(user.balance || 0).toFixed(4)} <span class="text-xl font-black text-slate-500 not-italic uppercase tracking-widest">TON</span>
                    </h2>
                    <p class="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest opacity-60">Verified Liquid Assets</p>
                </div>
            </div>

            <div class="flex p-1 glass-panel rounded-2xl border border-white/5 shadow-inner" id="walletTabs">
                <button onclick="switchWalletTab('withdraw')" class="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 wallet-tab active-tab" data-tab="withdraw">
                    <i data-lucide="arrow-down-circle" class="w-5 h-5"></i> Withdraw
                </button>
                <button onclick="switchWalletTab('deposit')" class="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 wallet-tab" data-tab="deposit">
                    <i data-lucide="arrow-up-circle" class="w-5 h-5"></i> Deposit
                </button>
                <button onclick="switchWalletTab('history')" class="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 wallet-tab" data-tab="history">
                    <i data-lucide="history" class="w-5 h-5"></i> History
                </button>
            </div>

            <div id="walletContent">
                <!-- 内容将通过JavaScript动态加载 -->
                <div class="py-20 text-center">
                    <div class="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading...</p>
                </div>
            </div>
        </div>
        
        <script>
            function switchWalletTab(tab) {
                // 更新标签按钮状态
                document.querySelectorAll('.wallet-tab').forEach(btn => {
                    if (btn.getAttribute('data-tab') === tab) {
                        btn.classList.add('active-tab');
                        btn.classList.remove('text-slate-500');
                        btn.classList.add('bg-cyan-600', 'text-white', 'shadow-sm');
                    } else {
                        btn.classList.remove('active-tab', 'bg-cyan-600', 'text-white', 'shadow-sm');
                        btn.classList.add('text-slate-500');
                    }
                });
                
                // 加载对应标签的内容
                loadWalletTab(tab);
            }
            
            function loadWalletTab(tab) {
                switch(tab) {
                    case 'withdraw':
                        loadWithdrawTab();
                        break;
                    case 'deposit':
                        loadDepositTab();
                        break;
                    case 'history':
                        loadHistoryTab();
                        break;
                }
            }
            
            function loadWithdrawTab() {
                document.getElementById('walletContent').innerHTML = \`
                    <form onsubmit="return handleWithdraw(event)" class="glass-panel p-6 rounded-[2.5rem] shadow-sm space-y-6">
                        <div class="space-y-3">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Withdrawal Amount (Min 2 TON)</label>
                            <div class="relative">
                                <input 
                                    type="number" 
                                    step="0.0001" 
                                    placeholder="0.00"
                                    id="withdrawAmount"
                                    class="w-full bg-slate-950/50 border border-white/5 p-5 rounded-2xl font-black text-2xl focus:ring-2 focus:ring-cyan-500 outline-none tabular-nums text-white"
                                />
                                <span class="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-500 uppercase italic">TON</span>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Wallet Address</label>
                            <input 
                                type="text" 
                                placeholder="UQ..."
                                id="walletAddress"
                                value="${user.wallet_address || ''}"
                                class="w-full bg-slate-950/50 border border-white/5 p-5 rounded-2xl font-mono text-[10px] focus:ring-2 focus:ring-cyan-500 outline-none text-white"
                            />
                        </div>

                        <div id="feeDisplay" class="bg-cyan-500/10 p-4 rounded-2xl flex items-center justify-between text-xs font-black text-cyan-400 shadow-sm border border-cyan-500/20 hidden">
                            <span class="uppercase tracking-widest">Platform Fee (20%)</span>
                            <span class="tabular-nums" id="feeAmount">0.0000 TON</span>
                        </div>

                        <button 
                            type="submit" 
                            class="w-full bg-cyan-600 text-white p-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-cyan-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <i data-lucide="arrow-down-circle" class="w-5 h-5"></i>
                            Finalize Withdrawal
                        </button>

                        <div class="flex gap-3 items-start text-[10px] text-slate-400 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                            <i data-lucide="info" class="shrink-0 text-slate-500 w-4 h-4"></i>
                            <p>Withdrawals are processed within 5-30 minutes. Minimum withdrawal is 2 TON with a 20% platform fee.</p>
                        </div>
                    </form>
                \`;
                
                // 添加金额变化监听
                document.getElementById('withdrawAmount').addEventListener('input', updateFeeDisplay);
                updateFeeDisplay();
                
                lucide.createIcons();
            }
            
            function loadDepositTab() {
                const depositAddress = "UQCPPw01FTldjEuWeeup-wf80MJFGaB86IrQ1q-h_QpuDjc1";
                
                document.getElementById('walletContent').innerHTML = \`
                    <div class="glass-panel p-10 rounded-[2.5rem] shadow-sm text-center space-y-8">
                        <div class="w-20 h-20 bg-cyan-500/10 text-cyan-400 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm border border-cyan-500/20">
                            <i data-lucide="arrow-up-circle" class="w-10 h-10"></i>
                        </div>
                        <div>
                            <h3 class="font-black text-xl text-white tracking-tight italic uppercase">Deposit TON Assets</h3>
                            <p class="text-xs text-slate-500 mt-2 font-medium leading-relaxed">Send TON to the address below and contact support with the transaction hash.</p>
                        </div>
                        <div class="bg-slate-950 p-6 rounded-2xl text-left space-y-3 shadow-inner border border-white/5 relative">
                            <div class="flex items-center justify-between">
                                <p class="text-[10px] text-slate-600 font-black uppercase tracking-widest">Smart Contract Address</p>
                                <button onclick="copyDepositAddress()" id="copyDepositBtn" class="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all">
                                    <i data-lucide="copy" class="w-4 h-4"></i>
                                </button>
                            </div>
                            <p class="text-[11px] font-mono break-all text-cyan-400 leading-relaxed pr-8" id="depositAddrText">\${depositAddress}</p>
                        </div>
                        <p class="text-[10px] text-slate-400 italic font-bold uppercase tracking-widest">Sync receipt with @AdTONX_Support after transfer.</p>
                    </div>
                \`;
                
                lucide.createIcons();
            }
            
            function loadHistoryTab() {
                document.getElementById('walletContent').innerHTML = \`
                    <div class="space-y-4">
                        <div class="py-20 text-center glass-panel rounded-[2.5rem] border-dashed border-white/5">
                            <i data-lucide="history" class="mx-auto text-slate-800 mb-4 w-12 h-12"></i>
                            <p class="text-xs font-black text-slate-600 uppercase tracking-widest">No transaction history</p>
                        </div>
                    </div>
                \`;
                
                lucide.createIcons();
            }
            
            function updateFeeDisplay() {
                const amountInput = document.getElementById('withdrawAmount');
                const amount = parseFloat(amountInput.value);
                const feeDisplay = document.getElementById('feeDisplay');
                const feeAmount = document.getElementById('feeAmount');
                
                if (!isNaN(amount) && amount > 0) {
                    const fee = amount * 0.2;
                    feeAmount.textContent = fee.toFixed(4) + ' TON';
                    feeDisplay.classList.remove('hidden');
                } else {
                    feeDisplay.classList.add('hidden');
                }
            }
            
            function handleWithdraw(e) {
                e.preventDefault();
                const amount = parseFloat(document.getElementById('withdrawAmount').value);
                const address = document.getElementById('walletAddress').value;
                
                if (isNaN(amount) || amount < 2) {
                    alert("Minimum withdrawal is 2 TON");
                    return false;
                }
                
                if (amount > ${user.balance || 0}) {
                    alert("Insufficient balance");
                    return false;
                }
                
                if (!address || address.trim() === '') {
                    alert("Please enter a wallet address");
                    return false;
                }
                
                const fee = amount * 0.2;
                const netAmount = amount - fee;
                
                if (confirm(\`Confirm withdrawal of \${amount.toFixed(4)} TON?\\nFee: \${fee.toFixed(4)} TON\\nYou will receive: \${netAmount.toFixed(4)} TON\\nTo: \${address.substring(0, 10)}...\`)) {
                    alert("Withdrawal request submitted! It will be processed within 30 minutes.");
                    document.getElementById('withdrawAmount').value = '';
                    document.getElementById('walletAddress').value = '';
                    document.getElementById('feeDisplay').classList.add('hidden');
                    
                    // 在实际应用中，这里会调用API提交提现请求
                    // firebaseService.submitWithdrawal(user.telegram_id, amount, address);
                }
                
                return false;
            }
            
            function copyDepositAddress() {
                const address = document.getElementById('depositAddrText').textContent;
                navigator.clipboard.writeText(address);
                
                const button = document.getElementById('copyDepositBtn');
                button.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-green-400"></i>';
                button.classList.remove('bg-cyan-500/10', 'text-cyan-400');
                button.classList.add('bg-emerald-500', 'text-white');
                
                setTimeout(() => {
                    button.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i>';
                    button.classList.remove('bg-emerald-500', 'text-white');
                    button.classList.add('bg-cyan-500/10', 'text-cyan-400');
                    lucide.createIcons();
                }, 2000);
            }
            
            // 初始化加载提现标签
            loadWithdrawTab();
        </script>
        
        <style>
            .wallet-tab {
                transition: all 0.3s ease;
            }
        </style>
    `;
};