// AdTONX - Telegram Mini App
// Main Application Logic

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCToNn1VqYZrZjjbbBA2KW126ZBso-0D80",
    authDomain: "adtonx-bot.firebaseapp.com",
    databaseURL: "https://adtonx-bot-default-rtdb.firebaseio.com",
    projectId: "adtonx-bot",
    storageBucket: "adtonx-bot.firebasestorage.app",
    messagingSenderId: "290170776005",
    appId: "1:290170776005:web:82f88036aa42d080e2c3ac",
    measurementId: "G-6S0F9NY64F"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Telegram WebApp
const tg = window.Telegram.WebApp;

// Initialize Telegram WebApp safely
if (tg && typeof tg === 'object') {
    try {
        if (tg.expand && typeof tg.expand === 'function') {
            tg.expand();
        }
        if (tg.ready && typeof tg.ready === 'function') {
            tg.ready();
        }
        
        // Only use supported features
        if (tg.version && parseFloat(tg.version) >= 6.1) {
            if (tg.setHeaderColor && typeof tg.setHeaderColor === 'function') {
                tg.setHeaderColor('#0a0e27');
            }
            if (tg.setBackgroundColor && typeof tg.setBackgroundColor === 'function') {
                tg.setBackgroundColor('#0a0e27');
            }
            if (tg.enableClosingConfirmation && typeof tg.enableClosingConfirmation === 'function') {
                tg.enableClosingConfirmation();
            }
        }
        
        // Setup main button if available
        if (tg.MainButton && typeof tg.MainButton.show === 'function') {
            tg.MainButton.setText('AdTONX');
            tg.MainButton.show();
        }
    } catch (error) {
        console.log('Telegram WebApp initialization warning:', error);
    }
}

// Global State
let currentUser = null;
let userData = null;
let adCooldown = false;
let settings = {};

// App Constants
const DAILY_AD_LIMIT = 3000;
const WITHDRAWAL_FEE = 0.20;
const MIN_WITHDRAWAL = 2;
const REFERRAL_COMMISSION = 0.10;
const REFERRAL_BONUS = 0.005;
const TASK_PRICE_PER_CLICK = 0.004; // 1 TON = 250 clicks

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
});

async function initializeApp() {
    try {
        // Show loading
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
        document.getElementById('welcome-screen').style.display = 'none';

        // Initialize Firebase Auth
        await initializeAuth();

        // Load settings
        await loadSettings();

        // Initialize UI
        initializeUI();

        // Check if user has seen welcome screen
        const hasSeenWelcome = localStorage.getItem('adtonx_welcome_seen');

        // Hide loading
        document.getElementById('loading-screen').style.display = 'none';

        if (hasSeenWelcome) {
            // Show app directly
            document.getElementById('app').style.display = 'block';
        } else {
            // Show welcome screen
            document.getElementById('welcome-screen').style.display = 'flex';
        }

        console.log('App initialized successfully');
    } catch (error) {
        console.error('App initialization error:', error);
        showError('Failed to initialize app. Please try again.');
    }
}

// Authentication
async function initializeAuth() {
    try {
        // Get Telegram user data
        let tgUser = null;
        
        if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
            tgUser = tg.initDataUnsafe.user;
        } else if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
            tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        }
        
        // For testing/development without Telegram
        if (!tgUser) {
            console.log('No Telegram user data - creating demo user');
            tgUser = {
                id: 'demo_' + Date.now(),
                username: 'demo_user',
                first_name: 'Demo',
                last_name: 'User'
            };
        }

        // Sign in anonymously (user will be linked via telegram_id)
        const userCredential = await auth.signInAnonymously();
        currentUser = userCredential.user;

        // Check if user exists in Firestore
        const userDoc = await db.collection('users').doc(tgUser.id.toString()).get();

        if (!userDoc.exists) {
            // Create new user
            const referralCode = `ref_${tgUser.id}`;
            await createUser(tgUser, referralCode);
        } else {
            userData = userDoc.data();
            // Update last active
            try {
                await db.collection('users').doc(tgUser.id.toString()).update({
                    last_active: new Date().toISOString()
                });
            } catch (error) {
                console.log('Failed to update last active:', error);
            }
        }

        // Check for referral
        const urlParams = new URLSearchParams(window.location.search);
        const referralParam = urlParams.get('start');
        
        if (referralParam && referralParam.startsWith('ref_')) {
            await handleReferral(referralParam);
        }

        // Check if admin
        const adminDoc = await db.collection('admins').doc('trillionaire').get();
        if (adminDoc.exists && adminDoc.data().username === tgUser.username) {
            document.getElementById('admin-link').style.display = 'block';
        }

        // Update UI with user data
        updateUserInfo(tgUser);
        loadUserData();
        setupRealtimeUpdates();

    } catch (error) {
        console.error('Auth error:', error);
        throw error;
    }
}

async function createUser(tgUser, referralCode) {
    userData = {
        telegram_id: tgUser.id.toString(),
        username: tgUser.username || '',
        first_name: tgUser.first_name || '',
        last_name: tgUser.last_name || '',
        balance: 0,
        total_earned: 0,
        today_earnings: 0,
        ads_watched: 0,
        ads_monetag: 0,
        ads_adexium: 0,
        ads_adsgram: 0,
        cpm_clicks: 0,
        tasks_completed: 0,
        referral_count: 0,
        referral_earnings: 0,
        wallet_address: '',
        referred_by: '',
        status: 'active',
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString()
    };

    await db.collection('users').doc(tgUser.id.toString()).set(userData);
    console.log('User created:', userData);
}

async function handleReferral(referralCode) {
    try {
        if (userData && userData.referred_by) {
            return; // Already has referrer
        }

        const referrerId = referralCode.replace('ref_', '');
        
        // Verify referrer exists
        const referrerDoc = await db.collection('users').doc(referrerId).get();
        
        if (referrerDoc.exists) {
            // Update current user
            await db.collection('users').doc(currentUser.uid).update({
                referred_by: referralCode
            });
            userData.referred_by = referralCode;

            // Increment referrer count
            await db.collection('users').doc(referrerId).update({
                referral_count: firebase.firestore.FieldValue.increment(1)
            });

            // Add referral bonus to current user
            await addTransaction('referral', REFERRAL_BONUS, 'referral', null, 'Referral bonus');
            await updateBalance(REFERRAL_BONUS);

            showSuccess(`Welcome! You received ${REFERRAL_BONUS} TON referral bonus!`);
        }
    } catch (error) {
        console.error('Referral error:', error);
    }
}

// Settings
async function loadSettings() {
    try {
        const settingsDoc = await db.collection('settings').doc('platform_config').get();
        
        if (settingsDoc.exists) {
            settings = settingsDoc.data();
        } else {
            // Create default settings
            settings = {
                withdrawal_fee: WITHDRAWAL_FEE,
                min_withdrawal: MIN_WITHDRAWAL,
                min_deposit: 10,
                daily_ad_limit: DAILY_AD_LIMIT,
                cpm_target: 10000,
                cpm_reward_per_click: 0.0028,
                cpm_completion_bonus: 0.25,
                referral_commission: REFERRAL_COMMISSION,
                referral_bonus: REFERRAL_BONUS,
                task_price_per_click: TASK_PRICE_PER_CLICK,
                updated_at: new Date().toISOString()
            };
            
            await db.collection('settings').doc('platform_config').set(settings);
        }
    } catch (error) {
        console.error('Settings error:', error);
    }
}

// UI Updates
function updateUserInfo(tgUser) {
    const userDisplay = document.getElementById('user-display');
    userDisplay.textContent = tgUser.first_name || 'User';
}

function loadUserData() {
    if (!userData) return;

    // Update balance
    document.getElementById('balance-amount').textContent = userData.balance.toFixed(3);
    document.getElementById('wallet-balance').textContent = userData.balance.toFixed(3);

    // Update today's earnings
    document.getElementById('today-earnings').textContent = userData.today_earnings.toFixed(3);

    // Update ads watched
    document.getElementById('ads-watched').textContent = userData.ads_watched || 0;

    // Update referral stats
    document.getElementById('referral-count').textContent = userData.referral_count || 0;
    document.getElementById('referral-earnings').textContent = (userData.referral_earnings || 0).toFixed(3);

    // Update wallet address
    if (userData.wallet_address) {
        const shortAddress = userData.wallet_address.slice(0, 8) + '...' + userData.wallet_address.slice(-8);
        document.getElementById('wallet-address').textContent = shortAddress;
    }

    // Update ads progress
    const adsProgress = Math.min((userData.ads_watched || 0) / DAILY_AD_LIMIT * 100, 100);
    document.getElementById('ads-progress').textContent = `${userData.ads_watched || 0}/${DAILY_AD_LIMIT}`;
    document.getElementById('ads-progress-bar').style.width = `${adsProgress}%`;

    // Update tier info
    updateTierInfo();

    // Load transactions
    loadTransactions();
}

function updateTierInfo() {
    const adsWatched = userData.ads_watched || 0;
    let tier, reward;

    if (adsWatched < 400) {
        tier = 'Tier 1 (0-400 ads)';
        reward = 0.005;
    } else if (adsWatched < 1000) {
        tier = 'Tier 2 (400-1000 ads)';
        reward = 0.007;
    } else {
        tier = 'Tier 3 (1000+ ads)';
        reward = 0.008;
    }

    document.getElementById('current-tier').textContent = tier;
    document.getElementById('tier-reward').textContent = `${reward.toFixed(3)} TON`;

    // Update ad network rewards
    document.getElementById('monetag-reward').textContent = `${reward.toFixed(3)} TON`;
    document.getElementById('adexium-reward').textContent = `${reward.toFixed(3)} TON`;
    document.getElementById('adsgram-reward').textContent = `${reward.toFixed(3)} TON`;
}

function setupRealtimeUpdates() {
    // Listen for user updates
    db.collection('users').doc(currentUser.uid).onSnapshot((doc) => {
        if (doc.exists) {
            userData = doc.data();
            loadUserData();
        }
    });
}

// UI Initialization
function initializeUI() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const screen = item.dataset.screen;
            navigateToScreen(screen);
        });
    });

    // Action buttons
    document.getElementById('watch-ads-btn').addEventListener('click', () => navigateToScreen('ads'));
    document.getElementById('complete-tasks-btn').addEventListener('click', () => navigateToScreen('tasks'));

    // Ad watching buttons
    document.getElementById('watch-monetag').addEventListener('click', () => watchAd('monetag'));
    document.getElementById('watch-adexium').addEventListener('click', () => watchAd('adexium'));
    document.getElementById('watch-adsgram').addEventListener('click', () => watchAd('adsgram'));

    // Task tabs
    document.querySelectorAll('.task-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.task-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.task-list, .task-form-container').forEach(list => {
                list.style.display = 'none';
            });
            
            if (tabName === 'official') {
                document.getElementById('official-tasks').style.display = 'block';
            } else if (tabName === 'partner') {
                document.getElementById('partner-tasks').style.display = 'block';
            } else if (tabName === 'create') {
                document.getElementById('create-task-form').style.display = 'block';
            }
        });
    });

    // Task buttons
    document.querySelectorAll('.btn-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.id === 'daily-login-btn') {
                completeDailyLogin();
            } else {
                showSuccess('Task started! Complete the action to earn rewards.');
            }
        });
    });

    // Create task
    document.getElementById('create-task-submit').addEventListener('click', createTask);

    // Wallet buttons
    document.getElementById('withdraw-btn').addEventListener('click', openWithdrawModal);
    document.getElementById('deposit-btn').addEventListener('click', () => showSuccess('Deposit feature coming soon!'));
    document.getElementById('edit-wallet-btn').addEventListener('click', openWalletModal);

    // Withdrawal modal
    document.getElementById('close-withdraw-modal').addEventListener('click', closeWithdrawModal);
    document.getElementById('withdraw-amount').addEventListener('input', calculateWithdrawal);
    document.getElementById('confirm-withdraw').addEventListener('click', processWithdrawal);

    // Wallet modal
    document.getElementById('close-wallet-modal').addEventListener('click', closeWalletModal);
    document.getElementById('save-wallet-address').addEventListener('click', saveWalletAddress);

    // Referral button
    document.getElementById('copy-referral-btn').addEventListener('click', copyReferralLink);

    // Welcome screen start button
    document.getElementById('start-app-btn').addEventListener('click', () => {
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        localStorage.setItem('adtonx_welcome_seen', 'true');
    });

    // Modal close buttons
    document.getElementById('close-success-modal').addEventListener('click', () => closeModal('success-modal'));
    document.getElementById('close-error-modal').addEventListener('click', () => closeModal('error-modal'));

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

function navigateToScreen(screenName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.screen === screenName) {
            item.classList.add('active');
        }
    });

    // Update screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(`${screenName}-screen`).classList.add('active');

    // Load screen-specific data
    if (screenName === 'wallet') {
        loadTransactions();
    }
}

// Ad Watching
async function watchAd(network) {
    if (adCooldown) {
        showError('Please wait before watching another ad.');
        return;
    }

    const adsWatchedToday = userData.ads_watched || 0;
    if (adsWatchedToday >= DAILY_AD_LIMIT) {
        showError('You have reached your daily ad limit.');
        return;
    }

    adCooldown = true;

    try {
        // Calculate reward
        const reward = calculateAdReward(network);

        // Show ad modal with timer
        showAdModal(reward);

        // Wait for ad timer (10 seconds)
        await countdownTimer(10);

        // Show actual ad based on network
        await showAd(network);

        // Process reward
        await processAdReward(network, reward);

        // Close modal
        closeAdModal();

        // Show success
        showSuccess(`You earned ${reward.toFixed(3)} TON!`);

        // Haptic feedback
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }

    } catch (error) {
        console.error('Ad error:', error);
        closeAdModal();
        showError('Failed to watch ad. Please try again.');
    }

    adCooldown = false;
}

function calculateAdReward(network) {
    const adsWatched = userData.ads_watched || 0;
    let baseReward = 0.005;

    // Tier system
    if (adsWatched >= 400 && adsWatched < 1000) {
        baseReward = 0.007;
    } else if (adsWatched >= 1000) {
        baseReward = 0.008;
    }

    return baseReward;
}

async function showAd(network) {
    return new Promise((resolve) => {
        switch (network) {
            case 'monetag':
                // Monetag integration
                if (typeof show_10551237 === 'function') {
                    show_10551237().then(resolve).catch(() => resolve());
                } else {
                    console.log('Monetag not loaded');
                    resolve();
                }
                break;

            case 'adexium':
                // Adexium integration
                if (typeof AdexiumWidget !== 'undefined') {
                    const adexiumWidget = new AdexiumWidget({
                        wid: '593e85f5-6028-4ee2-bf80-f7729b16a482',
                        adFormat: 'interstitial'
                    });
                    adexiumWidget.show();
                    setTimeout(resolve, 2000);
                } else {
                    console.log('Adexium not loaded');
                    resolve();
                }
                break;

            case 'adsgram':
                // Adsgram integration (open in new window for now)
                const adsgramUrl = 'https://otieu.com/4/10551270';
                window.open(adsgramUrl, '_blank');
                setTimeout(resolve, 2000);
                break;

            default:
                resolve();
        }
    });
}

async function processAdReward(network, reward) {
    try {
        // Update user data
        const updates = {
            balance: firebase.firestore.FieldValue.increment(reward),
            total_earned: firebase.firestore.FieldValue.increment(reward),
            today_earnings: firebase.firestore.FieldValue.increment(reward),
            ads_watched: firebase.firestore.FieldValue.increment(1),
            [`ads_${network}`]: firebase.firestore.FieldValue.increment(1)
        };

        // Add tier bonus
        const adsWatched = (userData.ads_watched || 0) + 1;
        if (adsWatched === 400) {
            updates.balance = firebase.firestore.FieldValue.increment(0.05);
            updates.total_earned = firebase.firestore.FieldValue.increment(0.05);
        } else if (adsWatched === 1000) {
            updates.balance = firebase.firestore.FieldValue.increment(0.08);
            updates.total_earned = firebase.firestore.FieldValue.increment(0.08);
        }

        await db.collection('users').doc(currentUser.uid).update(updates);

        // Add transaction
        await addTransaction('ad_watched', reward, network, null, `${network} ad watched`);

        // Process referral commission
        if (userData.referred_by) {
            await processReferralCommission(reward);
        }

    } catch (error) {
        console.error('Reward processing error:', error);
        throw error;
    }
}

async function processReferralCommission(amount) {
    try {
        const commission = amount * settings.referral_commission;
        const referrerId = userData.referred_by.replace('ref_', '');

        // Update referrer
        await db.collection('users').doc(referrerId).update({
            balance: firebase.firestore.FieldValue.increment(commission),
            total_earned: firebase.firestore.FieldValue.increment(commission),
            referral_earnings: firebase.firestore.FieldValue.increment(commission)
        });

        // Add transaction for referrer
        await db.collection('transactions').add({
            tx_id: `tx_${Date.now()}`,
            user_id: referrerId,
            type: 'referral',
            amount: commission,
            fee: 0,
            network: null,
            task_id: null,
            status: 'completed',
            timestamp: new Date().toISOString(),
            description: `Referral commission from ${userData.username || 'user'}`
        });

    } catch (error) {
        console.error('Referral commission error:', error);
    }
}

// Tasks
async function completeDailyLogin() {
    const today = new Date().toDateString();
    const lastLogin = userData.last_daily_login;

    if (lastLogin === today) {
        showError('You already claimed today\'s login bonus!');
        return;
    }

    try {
        const reward = 0.01;

        await db.collection('users').doc(currentUser.uid).update({
            balance: firebase.firestore.FieldValue.increment(reward),
            total_earned: firebase.firestore.FieldValue.increment(reward),
            today_earnings: firebase.firestore.FieldValue.increment(reward),
            tasks_completed: firebase.firestore.FieldValue.increment(1),
            last_daily_login: today
        });

        await addTransaction('task', reward, null, 'daily_login', 'Daily login bonus');

        showSuccess(`Daily login bonus: +${reward} TON!`);
        document.getElementById('daily-login-btn').textContent = 'Claimed';
        document.getElementById('daily-login-btn').disabled = true;

    } catch (error) {
        console.error('Daily login error:', error);
        showError('Failed to claim daily bonus.');
    }
}

async function createTask() {
    const title = document.getElementById('task-title').value.trim();
    const link = document.getElementById('task-link').value.trim();
    const clicksRequired = parseInt(document.getElementById('task-clicks').value);
    const cost = parseFloat(document.getElementById('task-cost').value);

    if (!title || !link || !clicksRequired || !cost) {
        showError('Please fill in all fields');
        return;
    }

    if (userData.balance < cost) {
        showError('Insufficient balance');
        return;
    }

    try {
        // Calculate expected cost
        const expectedCost = clicksRequired * settings.task_price_per_click;
        
        if (Math.abs(cost - expectedCost) > 0.001) {
            showError(`Invalid cost. Expected: ${expectedCost.toFixed(3)} TON`);
            return;
        }

        // Deduct balance
        await db.collection('users').doc(currentUser.uid).update({
            balance: firebase.firestore.FieldValue.increment(-cost)
        });

        // Create task
        await db.collection('tasks').add({
            task_id: `task_${Date.now()}`,
            creator_id: currentUser.uid,
            title: title,
            description: '',
            type: 'paid',
            link: link,
            reward: settings.task_price_per_click,
            clicks_required: clicksRequired,
            clicks_done: 0,
            budget: cost,
            status: 'active',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });

        // Add transaction
        await addTransaction('deposit', cost, null, null, `Task created: ${title}`);

        showSuccess('Task created successfully!');
        
        // Clear form
        document.getElementById('task-title').value = '';
        document.getElementById('task-link').value = '';
        document.getElementById('task-clicks').value = '';
        document.getElementById('task-cost').value = '';

        // Switch to official tab
        document.querySelector('[data-tab="official"]').click();

    } catch (error) {
        console.error('Task creation error:', error);
        showError('Failed to create task.');
    }
}

// Wallet
function openWithdrawModal() {
    if (userData.balance < settings.min_withdrawal) {
        showError(`Minimum withdrawal is ${settings.min_withdrawal} TON`);
        return;
    }

    if (!userData.wallet_address) {
        showError('Please set your wallet address first');
        openWalletModal();
        return;
    }

    document.getElementById('withdraw-modal').style.display = 'flex';
    calculateWithdrawal();
}

function closeWithdrawModal() {
    document.getElementById('withdraw-modal').style.display = 'none';
}

function calculateWithdrawal() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value) || 0;
    const fee = amount * settings.withdrawal_fee;
    const netAmount = amount - fee;

    document.getElementById('withdraw-amount-display').textContent = `${amount.toFixed(3)} TON`;
    document.getElementById('withdraw-fee-display').textContent = `${fee.toFixed(3)} TON`;
    document.getElementById('withdraw-net-display').textContent = `${netAmount.toFixed(3)} TON`;
}

async function processWithdrawal() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);

    if (!amount || amount < settings.min_withdrawal) {
        showError(`Minimum withdrawal is ${settings.min_withdrawal} TON`);
        return;
    }

    if (amount > userData.balance) {
        showError('Insufficient balance');
        return;
    }

    try {
        const fee = amount * settings.withdrawal_fee;
        const netAmount = amount - fee;

        // Create withdrawal request
        await db.collection('withdrawals').add({
            withdrawal_id: `wd_${Date.now()}`,
            user_id: currentUser.uid,
            amount: amount,
            fee: fee,
            net_amount: netAmount,
            wallet_address: userData.wallet_address,
            status: 'pending',
            requested_at: new Date().toISOString(),
            processed_at: null,
            transaction_hash: null
        });

        // Deduct balance
        await db.collection('users').doc(currentUser.uid).update({
            balance: firebase.firestore.FieldValue.increment(-amount)
        });

        // Add transaction
        await addTransaction('withdraw', amount, null, null, 'Withdrawal requested', fee);

        closeWithdrawModal();
        showSuccess('Withdrawal request submitted! Processing time: 5-30 minutes');

    } catch (error) {
        console.error('Withdrawal error:', error);
        showError('Failed to process withdrawal.');
    }
}

function openWalletModal() {
    document.getElementById('wallet-modal').style.display = 'flex';
    document.getElementById('wallet-address-input').value = userData.wallet_address || '';
}

function closeWalletModal() {
    document.getElementById('wallet-modal').style.display = 'none';
}

async function saveWalletAddress() {
    const address = document.getElementById('wallet-address-input').value.trim();

    if (!address) {
        showError('Please enter a wallet address');
        return;
    }

    try {
        await db.collection('users').doc(currentUser.uid).update({
            wallet_address: address
        });

        userData.wallet_address = address;
        loadUserData();
        closeWalletModal();
        showSuccess('Wallet address saved!');

    } catch (error) {
        console.error('Wallet save error:', error);
        showError('Failed to save wallet address.');
    }
}

// Transactions
async function addTransaction(type, amount, network, taskId, description, fee = 0) {
    try {
        await db.collection('transactions').add({
            tx_id: `tx_${Date.now()}`,
            user_id: currentUser.uid,
            type: type,
            amount: amount,
            fee: fee,
            network: network,
            task_id: taskId,
            status: 'completed',
            timestamp: new Date().toISOString(),
            description: description
        });
    } catch (error) {
        console.error('Transaction error:', error);
    }
}

async function loadTransactions() {
    try {
        const transactionsQuery = await db.collection('transactions')
            .where('user_id', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        const transactionList = document.getElementById('transaction-list');
        transactionList.innerHTML = '';

        if (transactionsQuery.empty) {
            transactionList.innerHTML = '<div class="no-transactions">No transactions yet</div>';
            return;
        }

        transactionsQuery.forEach(doc => {
            const tx = doc.data();
            const txElement = createTransactionElement(tx);
            transactionList.appendChild(txElement);
        });

    } catch (error) {
        console.error('Load transactions error:', error);
    }
}

function createTransactionElement(tx) {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    
    const icon = getTransactionIcon(tx.type);
    const amountClass = tx.type === 'withdraw' || tx.type === 'deposit' ? 'negative' : 'positive';
    const amountPrefix = tx.type === 'withdraw' ? '-' : '+';
    
    div.innerHTML = `
        <div class="transaction-icon">${icon}</div>
        <div class="transaction-info">
            <div class="transaction-type">${tx.description}</div>
            <div class="transaction-date">${formatDate(tx.timestamp)}</div>
        </div>
        <div class="transaction-amount ${amountClass}">
            ${amountPrefix}${tx.amount.toFixed(3)} TON
        </div>
    `;
    
    return div;
}

function getTransactionIcon(type) {
    switch (type) {
        case 'ad_watched': return '📺';
        case 'task': return '✅';
        case 'referral': return '👥';
        case 'deposit': return '💰';
        case 'withdraw': return '💸';
        default: return '📊';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
}

// Referral
function copyReferralLink() {
    const referralLink = `https://t.me/AdTONX_Bot?start=ref_${currentUser.uid}`;
    
    navigator.clipboard.writeText(referralLink).then(() => {
        showSuccess('Referral link copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = referralLink;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showSuccess('Referral link copied to clipboard!');
    });
}

// Modals
function showAdModal(reward) {
    document.getElementById('ad-reward-preview').textContent = reward.toFixed(3);
    document.getElementById('ad-modal').style.display = 'flex';
}

function closeAdModal() {
    document.getElementById('ad-modal').style.display = 'none';
}

async function countdownTimer(seconds) {
    const timerElement = document.getElementById('ad-timer-text');
    
    for (let i = seconds; i > 0; i--) {
        timerElement.textContent = i;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    timerElement.textContent = '✓';
}

function showSuccess(message) {
    document.getElementById('success-message').textContent = message;
    document.getElementById('success-modal').style.display = 'flex';
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Helper Functions
async function updateBalance(amount) {
    try {
        await db.collection('users').doc(currentUser.uid).update({
            balance: firebase.firestore.FieldValue.increment(amount)
        });
    } catch (error) {
        console.error('Balance update error:', error);
    }
}

// Note: BackButton and MainButton features removed for compatibility with older Telegram versions

// Export for debugging
window.AdTONX = {
    db,
    auth,
    userData,
    settings,
    currentUser
};

console.log('AdTONX Mini App loaded successfully');