
import { initializeApp } from "firebase/app";
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, increment, 
  collection, query, getDocs, addDoc, limit, orderBy, 
  where, runTransaction, persistentLocalCache, 
  persistentMultipleTabManager, initializeFirestore, writeBatch
} from "firebase/firestore";
import { User, Transaction, Task, Withdrawal } from './types.ts';

const firebaseConfig = {
    apiKey: "AIzaSyCToNn1VqYZrZjjbbBA2KW126ZBso-0D80",
    authDomain: "adtonx-bot.firebaseapp.com",
    projectId: "adtonx-bot",
    storageBucket: "adtonx-bot.firebasestorage.app",
    messagingSenderId: "290170776005",
    appId: "1:290170776005:web:82f88036aa42d080e2c3ac"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

export const PLATFORM_CONFIG = {
  BOT_USERNAME: "AdTONX_BOT",
  MINI_APP_NAME: "app",
  ARENA_ELIGIBILITY: 700,
  PRIZE_POOL: 5.0,
  OFFICIAL_CHANNEL: "https://t.me/AdTONX_News",
  get MINI_APP_LINK() {
    return `https://t.me/${this.BOT_USERNAME}/${this.MINI_APP_NAME}`;
  }
};

export const getOrInitUser = async (tgUser: any, referrerId: string | null = null): Promise<User> => {
  let userId = tgUser?.id?.toString();
  if (!userId) {
    const savedId = localStorage.getItem('adtonx_id');
    userId = savedId || "anon_" + Math.random().toString(36).substring(2, 12);
    if (!savedId) localStorage.setItem('adtonx_id', userId);
  }

  const userRef = doc(db, "users", userId);
  const fallbackUser: User = {
    telegram_id: userId,
    username: tgUser?.username || 'Watcher',
    first_name: tgUser?.first_name || 'Watcher',
    last_name: tgUser?.last_name || '',
    balance: 0,
    total_earned: 0,
    today_earnings: 0,
    ads_watched: 0,
    weekly_ads_watched: 0,
    ads_monetag: 0,
    ads_adexium: 0,
    ads_adsgram: 0,
    cpm_clicks: 0,
    tasks_completed: 0,
    referral_count: 0,
    referral_earnings: 0,
    wallet_address: '',
    referred_by: referrerId,
    status: 'active',
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    isAdmin: false
  };

  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data() as User;
      if (data.status === 'banned') throw new Error("Account restricted.");
      updateDoc(userRef, { last_active: new Date().toISOString() }).catch(() => {});
      return { ...fallbackUser, ...data };
    } else {
      await setDoc(userRef, fallbackUser);
      return fallbackUser;
    }
  } catch (error: any) {
    return fallbackUser;
  }
};

export const updateUserBalance = async (userId: string, amount: number, todayIncrement: boolean = true) => {
  await updateDoc(doc(db, "users", userId), {
    balance: increment(amount),
    total_earned: increment(amount > 0 ? amount : 0),
    ...(todayIncrement && amount > 0 ? { today_earnings: increment(amount) } : {})
  });
};

export const logTransaction = async (tx: Omit<Transaction, 'tx_id' | 'timestamp'>) => {
  await addDoc(collection(db, "transactions"), { ...tx, timestamp: new Date().toISOString() });
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  const q = query(collection(db, "transactions"), where("user_id", "==", userId), orderBy("timestamp", "desc"), limit(40));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ tx_id: doc.id, ...doc.data() } as Transaction));
};

export const getLeaderboard = async (limitNum: number = 100): Promise<User[]> => {
  const q = query(collection(db, "users"), where("weekly_ads_watched", ">", 0), orderBy("weekly_ads_watched", "desc"), limit(limitNum));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as User);
};

export const adminGetStats = async () => {
  const usersSnap = await getDocs(collection(db, "users"));
  const withdrawSnap = await getDocs(query(collection(db, "withdrawals"), where("status", "==", "pending")));
  let totalBalance = 0;
  usersSnap.forEach(u => totalBalance += (u.data().balance || 0));
  return { totalUsers: usersSnap.size, platformReserve: totalBalance, pendingWithdrawals: withdrawSnap.size };
};

export const adminGetAllUsers = async (limitNum: number = 50): Promise<User[]> => {
  const q = query(collection(db, "users"), orderBy("last_active", "desc"), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as User);
};

export const adminUpdateUser = async (userId: string, updates: Partial<User>) => {
  await updateDoc(doc(db, "users", userId), updates);
};

export const adminGetPendingWithdrawals = async (): Promise<Withdrawal[]> => {
  const q = query(collection(db, "withdrawals"), where("status", "==", "pending"), orderBy("requested_at", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ withdrawal_id: doc.id, ...doc.data() } as Withdrawal));
};

export const adminProcessWithdrawal = async (withdrawalId: string, status: 'completed' | 'failed') => {
  await updateDoc(doc(db, "withdrawals", withdrawalId), { status, processed_at: new Date().toISOString() });
};

export const adminUpdateSettings = async (updates: any) => {
  await setDoc(doc(db, "platform", "settings"), updates, { merge: true });
};

export const adminGetSettings = async () => {
  const snap = await getDoc(doc(db, "platform", "settings"));
  return snap.exists() ? snap.data() : { minWithdrawal: 2, withdrawalFee: 20 };
};

export const settleWeeklyRewards = async (): Promise<{ winnersCount: number }> => {
  const q = query(
    collection(db, "users"),
    where("weekly_ads_watched", ">=", PLATFORM_CONFIG.ARENA_ELIGIBILITY),
    orderBy("weekly_ads_watched", "desc"),
    limit(100)
  );

  const snapshot = await getDocs(q);
  const winnersCount = snapshot.size;
  const batch = writeBatch(db);
  
  let rank = 1;
  for (const doc of snapshot.docs) {
    const reward = rank <= 10 ? 0.20 : 0.033;
    batch.update(doc.ref, {
      balance: increment(reward),
      total_earned: increment(reward),
      weekly_ads_watched: 0
    });
    
    const txRef = doc(collection(db, "transactions"));
    batch.set(txRef, {
      user_id: doc.id,
      type: 'reward',
      amount: reward,
      fee: 0,
      status: 'completed',
      description: `Weekly Arena Prize: Rank #${rank}`,
      timestamp: new Date().toISOString()
    });
    rank++;
  }
  await batch.commit();

  const othersQ = query(collection(db, "users"), where("weekly_ads_watched", ">", 0));
  const othersSnap = await getDocs(othersQ);
  const resetBatch = writeBatch(db);
  othersSnap.docs.forEach(d => resetBatch.update(d.ref, { weekly_ads_watched: 0 }));
  await resetBatch.commit();

  return { winnersCount };
};

export const createPaidTask = async (userId: string, taskData: any) => {
  await addDoc(collection(db, "tasks"), { ...taskData, creator_id: userId, clicks_done: 0, status: 'active', created_at: new Date().toISOString() });
  await updateUserBalance(userId, -taskData.cost, false);
};

export const checkAndCreditReferralBonus = async (user: User): Promise<boolean> => {
  if (user.referral_bonus_paid || !user.referred_by) return false;
  if (user.ads_watched >= 10) {
    try {
      return await runTransaction(db, async (transaction) => {
        const referrerRef = doc(db, "users", user.referred_by!);
        transaction.update(referrerRef, {
          balance: increment(0.005),
          referral_count: increment(1),
          referral_earnings: increment(0.005)
        });
        transaction.update(doc(db, "users", user.telegram_id), { referral_bonus_paid: true });
        return true;
      });
    } catch (e) { return false; }
  }
  return false;
};
