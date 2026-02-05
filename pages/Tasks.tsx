
import React, { useState, useEffect } from 'react';
import { User, Task } from '../types';
import { db, updateUserBalance, logTransaction, createPaidTask } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { CheckCircle2, ExternalLink, Award, Users, ShieldCheck, PlusCircle, LayoutGrid, Info } from 'lucide-react';

interface TasksProps {
  user: User;
  onUpdateUser: (u: User) => void;
}

const Tasks: React.FC<TasksProps> = ({ user, onUpdateUser }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'earn' | 'create'>('earn');
  
  // Create Task State
  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newClicks, setNewClicks] = useState(250);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "tasks"), where("status", "==", "active"));
        const snapshot = await getDocs(q);
        const taskList = snapshot.docs.map(doc => ({ task_id: doc.id, ...doc.data() } as Task));
        setTasks(taskList);
      } catch (err) {
        console.error("Fetch tasks err:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [view]);

  const handleCreatePaidTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLink) return alert("Please fill all fields");
    
    // 1 TON = 250 clicks logic
    const cost = newClicks / 250;
    if (user.balance < cost) return alert(`Insufficient balance. Cost: ${cost} TON`);

    setIsCreating(true);
    try {
      await createPaidTask(user.telegram_id, {
        title: newTitle,
        link: newLink,
        clicks_required: newClicks,
        reward: (cost * 0.75) / newClicks, // 75% goes to workers
        description: `Promoted by user: @${user.username}`,
        cost: cost
      });

      onUpdateUser({ ...user, balance: user.balance - cost });
      alert("Task created successfully!");
      setView('earn');
      setNewTitle('');
      setNewLink('');
    } catch (err: any) {
      alert(err.message || "Failed to create task");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    const confirmed = window.confirm(`Have you completed the task: ${task.title}?`);
    if (!confirmed) return;

    try {
      await updateUserBalance(user.telegram_id, task.reward);
      await updateDoc(doc(db, "users", user.telegram_id), {
        tasks_completed: increment(1)
      });
      
      const taskRef = doc(db, "tasks", task.task_id);
      await updateDoc(taskRef, { clicks_done: increment(1) });

      await logTransaction({
        user_id: user.telegram_id,
        type: 'task',
        amount: task.reward,
        fee: 0,
        status: 'completed',
        description: `Completed: ${task.title}`
      });

      onUpdateUser({
        ...user,
        balance: user.balance + task.reward,
        total_earned: (user.total_earned || 0) + task.reward,
        tasks_completed: (user.tasks_completed || 0) + 1
      });

      alert(`Success! You earned ${task.reward.toFixed(4)} TON.`);
    } catch (err) {
      alert("Error claiming reward. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4 bg-slate-50 -mx-4 px-4 rounded-b-3xl border-b border-slate-100">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quest Center</h1>
        <div className="flex bg-white p-1 rounded-xl mt-4 border border-slate-200 max-w-[280px] mx-auto">
          <button 
            onClick={() => setView('earn')}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${view === 'earn' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20' : 'text-slate-400'}`}
          >
            Earn TON
          </button>
          <button 
            onClick={() => setView('create')}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${view === 'create' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20' : 'text-slate-400'}`}
          >
            Create Task
          </button>
        </div>
      </div>

      {view === 'earn' ? (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xs font-bold text-slate-400 animate-pulse">Scanning available tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
               <LayoutGrid size={40} className="mx-auto text-slate-200 mb-4" />
               <h3 className="text-sm font-bold text-slate-400 uppercase">No quests found</h3>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.task_id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {task.type === 'official' ? (
                      <ShieldCheck size={18} className="text-cyan-500" />
                    ) : (
                      <Users size={18} className="text-emerald-500" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{task.type}</span>
                  </div>
                  <div className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs font-black">
                    +{task.reward.toFixed(4)} TON
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-800 mt-3">{task.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed opacity-80">{task.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {task.clicks_done} / {task.clicks_required} Users
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={task.link} target="_blank" rel="noopener noreferrer"
                      className="bg-slate-100 text-slate-700 p-2 px-4 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase active:bg-slate-200"
                    >
                      <ExternalLink size={12} /> Open
                    </a>
                    <button 
                      onClick={() => handleCompleteTask(task)}
                      className="bg-cyan-600 text-white p-2 px-5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase shadow-lg shadow-cyan-600/20 active:scale-95 transition-transform"
                    >
                      <CheckCircle2 size={12} /> Claim
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <form onSubmit={handleCreatePaidTask} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="bg-cyan-50 p-4 rounded-xl flex items-start gap-3 text-cyan-700">
            <Info size={18} className="shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">
              Create a task to promote your Telegram Channel or website. <br/>
              <span className="font-bold">Price: 1 TON = 250 Clicks</span>
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Title</label>
              <input 
                type="text" required placeholder="e.g. Join My Official TON Group"
                value={newTitle} onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-slate-50 border-none p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Link</label>
              <input 
                type="url" required placeholder="https://t.me/..."
                value={newLink} onChange={e => setNewLink(e.target.value)}
                className="w-full bg-slate-50 border-none p-4 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Clicks</label>
              <select 
                value={newClicks} onChange={e => setNewClicks(Number(e.target.value))}
                className="w-full bg-slate-50 border-none p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none appearance-none"
              >
                <option value={250}>250 Clicks (1 TON)</option>
                <option value={500}>500 Clicks (2 TON)</option>
                <option value={1250}>1,250 Clicks (5 TON)</option>
                <option value={2500}>2,500 Clicks (10 TON)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
             <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-xs font-bold text-slate-500">Total Cost</span>
                <span className="text-lg font-black text-cyan-600">{(newClicks / 250).toFixed(2)} TON</span>
             </div>
             <button 
              type="submit" disabled={isCreating}
              className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
             >
               {isCreating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <PlusCircle size={20} />}
               Publish Task
             </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Tasks;
