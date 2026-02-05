class FirebaseService {
    constructor() {
        this.db = null;
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            const firebaseApp = firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore(firebaseApp);
            this.initialized = true;
            console.log("Firebase initialized successfully");
        } catch (error) {
            console.error("Firebase initialization failed:", error);
        }
    }

    async getOrInitUser(tgUser, referrerId = null) {
        let userId = tgUser?.id?.toString();
        if (!userId) {
            const savedId = localStorage.getItem('adtonx_id');
            userId = savedId || "anon_" + Math.random().toString(36).substring(2, 12);
            if (!savedId) localStorage.setItem('adtonx_id', userId);
        }

        const fallbackUser = {
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
            const userRef = this.db.collection("users").doc(userId);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
                const data = userDoc.data();
                if (data.status === 'banned') throw new Error("Account restricted.");
                
                await userRef.update({ last_active: new Date().toISOString() });
                return { ...fallbackUser, ...data };
            } else {
                await userRef.set(fallbackUser);
                return fallbackUser;
            }
        } catch (error) {
            console.error("Error getting user:", error);
            return fallbackUser;
        }
    }

    async updateUserBalance(userId, amount, todayIncrement = true) {
        const updates = {
            balance: firebase.firestore.FieldValue.increment(amount),
            total_earned: firebase.firestore.FieldValue.increment(amount > 0 ? amount : 0)
        };
        
        if (todayIncrement && amount > 0) {
            updates.today_earnings = firebase.firestore.FieldValue.increment(amount);
        }
        
        await this.db.collection("users").doc(userId).update(updates);
    }

    async logTransaction(txData) {
        await this.db.collection("transactions").add({
            ...txData,
            timestamp: new Date().toISOString()
        });
    }

    async getUserTransactions(userId) {
        const snapshot = await this.db.collection("transactions")
            .where("user_id", "==", userId)
            .orderBy("timestamp", "desc")
            .limit(40)
            .get();
        
        return snapshot.docs.map(doc => ({
            tx_id: doc.id,
            ...doc.data()
        }));
    }

    async getLeaderboard(limitNum = 100) {
        const snapshot = await this.db.collection("users")
            .where("weekly_ads_watched", ">", 0)
            .orderBy("weekly_ads_watched", "desc")
            .limit(limitNum)
            .get();
        
        return snapshot.docs.map(doc => doc.data());
    }

    async checkAndCreditReferralBonus(user) {
        if (user.referral_bonus_paid || !user.referred_by || user.ads_watched < 10) {
            return false;
        }

        try {
            const batch = this.db.batch();
            const referrerRef = this.db.collection("users").doc(user.referred_by);
            const userRef = this.db.collection("users").doc(user.telegram_id);

            batch.update(referrerRef, {
                balance: firebase.firestore.FieldValue.increment(0.005),
                referral_count: firebase.firestore.FieldValue.increment(1),
                referral_earnings: firebase.firestore.FieldValue.increment(0.005)
            });

            batch.update(userRef, { referral_bonus_paid: true });
            await batch.commit();
            return true;
        } catch (error) {
            console.error("Referral bonus error:", error);
            return false;
        }
    }
}

// Initialize global Firebase service
window.firebaseService = new FirebaseService();
