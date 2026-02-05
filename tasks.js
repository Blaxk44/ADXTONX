AdTONX.pages.tasks = async function() {
    const user = AdTONX.user;
    
    return `
        <div class="space-y-6">
            <div class="text-center py-4 bg-slate-50 -mx-4 px-4 rounded-b-3xl border-b border-slate-100">
                <h1 class="text-2xl font-black text-slate-800 tracking-tight">Quest Center</h1>
                <div class="flex bg-white p-1 rounded-xl mt-4 border border-slate-200 max-w-[280px] mx-auto" id="taskTabs">
                    <button 
                        onclick="switchTaskTab('earn')"
                        class="flex-1 py-2 text-xs font-black rounded-lg transition-all task-tab active-tab"
                        data-tab="earn"
                    >
                        Earn TON
                    </button>
                    <button 
                        onclick="switchTaskTab('create')"
                        class="flex-1 py-2 text-xs font-black rounded-lg transition-all task-tab"
                        data-tab="create"
                    >
                        Create Task
                    </button>
                </div>
            </div>

            <div id="tasksContent">
                <!-- 内容将通过JavaScript动态加载 -->
                <div class="py-20 text-center">
                    <div class="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-xs font-bold text-slate-400 animate-pulse">Loading tasks...</p>
                </div>
            </div>
        </div>
        
        <script>
            function switchTaskTab(tab) {
                // 更新标签按钮状态
                document.querySelectorAll('.task-tab').forEach(btn => {
                    if (btn.getAttribute('data-tab') === tab) {
                        btn.classList.add('active-tab');
                        btn.classList.remove('text-slate-400');
                        btn.classList.add('bg-cyan-600', 'text-white', 'shadow-md', 'shadow-cyan-600/20');
                    } else {
                        btn.classList.remove('active-tab', 'bg-cyan-600', 'text-white', 'shadow-md', 'shadow-cyan-600/20');
                        btn.classList.add('text-slate-400');
                    }
                });
                
                // 加载对应标签的内容
                if (tab === 'earn') {
                    loadEarnTasks();
                } else {
                    loadCreateTask();
                }
            }
            
            function loadEarnTasks() {
                document.getElementById('tasksContent').innerHTML = \`
                    <div class="space-y-4">
                        <div class="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                            <i data-lucide="layout-grid" class="mx-auto text-slate-200 mb-4 w-10 h-10"></i>
                            <h3 class="text-sm font-bold text-slate-400 uppercase">No quests available</h3>
                            <p class="text-xs text-slate-500 mt-2">Check back later for new tasks</p>
                        </div>
                    </div>
                \`;
                lucide.createIcons();
            }
            
            function loadCreateTask() {
                document.getElementById('tasksContent').innerHTML = \`
                    <form onsubmit="return handleCreateTask(event)" class="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
                        <div class="bg-cyan-50 p-4 rounded-xl flex items-start gap-3 text-cyan-700">
                            <i data-lucide="info" class="shrink-0 mt-0.5 w-5 h-5"></i>
                            <p class="text-xs font-medium leading-relaxed">
                                Create a task to promote your Telegram Channel or website.<br/>
                                <span class="font-bold">Price: 1 TON = 250 Clicks</span>
                            </p>
                        </div>

                        <div class="space-y-4">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Title</label>
                                <input 
                                    type="text" required placeholder="e.g. Join My Official TON Group"
                                    id="taskTitle"
                                    class="w-full bg-slate-50 border-none p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                            </div>

                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Link</label>
                                <input 
                                    type="url" required placeholder="https://t.me/..."
                                    id="taskLink"
                                    class="w-full bg-slate-50 border-none p-4 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                            </div>

                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Clicks</label>
                                <select 
                                    id="taskClicks"
                                    class="w-full bg-slate-50 border-none p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none appearance-none"
                                >
                                    <option value="250">250 Clicks (1 TON)</option>
                                    <option value="500">500 Clicks (2 TON)</option>
                                    <option value="1250">1,250 Clicks (5 TON)</option>
                                    <option value="2500">2,500 Clicks (10 TON)</option>
                                </select>
                            </div>
                        </div>

                        <div class="pt-2">
                            <div class="flex justify-between items-center mb-4 px-1">
                                <span class="text-xs font-bold text-slate-500">Total Cost</span>
                                <span id="taskCost" class="text-lg font-black text-cyan-600">1.00 TON</span>
                            </div>
                            <button 
                                type="submit"
                                class="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                <i data-lucide="plus-circle" class="w-5 h-5"></i>
                                Publish Task
                            </button>
                        </div>
                    </form>
                \`;
                
                // 更新成本显示
                document.getElementById('taskClicks').addEventListener('change', updateTaskCost);
                updateTaskCost();
                
                lucide.createIcons();
            }
            
            function updateTaskCost() {
                const clicks = parseInt(document.getElementById('taskClicks').value);
                const cost = (clicks / 250).toFixed(2);
                document.getElementById('taskCost').textContent = cost + ' TON';
            }
            
            function handleCreateTask(e) {
                e.preventDefault();
                alert('Task creation functionality would be implemented here');
                return false;
            }
            
            // 初始化加载
            loadEarnTasks();
        </script>
        
        <style>
            .task-tab {
                transition: all 0.3s ease;
            }
            
            .active-tab {
                background-color: #0891b2;
                color: white;
                box-shadow: 0 4px 6px -1px rgba(8, 145, 178, 0.1), 0 2px 4px -1px rgba(8, 145, 178, 0.06);
            }
        </style>
    `;
};