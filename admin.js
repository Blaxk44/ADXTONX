// AdTONX Admin Panel
// Admin Panel Logic

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

// Global State
let currentAdmin = null;
let isAdminLoggedIn = false;
let currentSection = 'dashboard';
let selectedUser = null;
let settings = {};

// Admin Credentials (for demo - in production, this should be server-side)
const ADMIN_CREDENTIALS = {
    username: 'TRILLIONAIRE',
    password: 'Asdfghjkl@123'
};

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPanel();
});

function initializeAdminPanel() {
    // Check if admin is already logged in
    const savedAdmin = localStorage.getItem('adtonx_admin');
    if (savedAdmin) {
        currentAdmin = JSON.parse(savedAdmin);
        showAdminPanel();
    }

    // Initialize UI
    initializeUI();

    // Setup auth state listener
    auth.onAuthStateChanged((user) => {
        if (user && isAdminLoggedIn) {
            console.log('Admin authenticated');
        }
    });
}

// UI Initialization
function initializeUI() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Navigation
    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            navigateToSection(section);
        });
    });

    // Task tabs
    document.querySelectorAll('.task-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.task-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadTasks(tab.dataset.tab);
        });
    });

    // Withdrawal tabs
    document.querySelectorAll('.withdrawal-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.withdrawal-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadWithdrawals(tab.dataset.status);
        });
    });

    // Transaction filter
    document.getElementById('transaction-type').addEventListener('change', (e) => {
        loadTransactions(e.target.value);
    });

    // User search
    document.getElementById('user-search').addEventListener('input', (e) => {
        searchUsers(e.target.value);
    });

    // Ad settings
    document.getElementById('save-ad-settings').addEventListener('click', saveAdSettings);

    // Platform settings
    document.getElementById('save-settings').addEventListener('click', savePlatformSettings);

    // Create task
    document.getElementById('create-official-task').addEventListener('click', () => {
        document.getElementById('task-modal').style.display = 'flex';
    });

    document.getElementById('close-task-modal').addEventListener('click', () => {
        document.getElementById('task-modal').style.display = 'none';
    });

    document.getElementById('create-task-submit').addEventListener('click', createOfficialTask);

    // User modal
    document.getElementById('close-user-modal').addEventListener('click', () => {
        document.getElementById('user-modal').style.display = 'none';
    });

    document.getElementById('ban-user-btn').addEventListener('click', banUser);
    document.getElementById('unban-user-btn').addEventListener('click', unbanUser);

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    const errorElement = document.getElementById('login-error');

    // Verify credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        try {
            // Sign in anonymously for Firebase access
            await auth.signInAnonymously();
            
            currentAdmin = {
                username: username,
                isAdmin: true
            };
            
            isAdminLoggedIn = true;
            localStorage.setItem('adtonx_admin', JSON.stringify(currentAdmin));
            
            showAdminPanel();
            errorElement.style.display = 'none';
        } catch (error) {
            console.error('Login error:', error);
            errorElement.textContent = 'Authentication failed. Please try again.';
            errorElement.style.display = 'block';
        }
    } else {
        errorElement.textContent = 'Invalid username or password';
        errorElement.style.display = 'block';
    }
}

function handleLogout() {
    auth.signOut();
    currentAdmin = null;
    isAdminLoggedIn = false;
    localStorage.removeItem('adtonx_admin');
    
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    
    // Reset form
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
}

function showAdminPanel() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'flex';
    
    // Load initial data
    loadDashboardData();
    loadSettings();
    loadPendingWithdrawalsCount();
}

// Navigation
function navigateToSection(section) {
    currentSection = section;
    
    // Update navigation
    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === section) {
            item.classList.add('active');
        }
    });

    // Update sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        users: 'User Management',
        ads: 'Ads Management',
        tasks: 'Task Management',
        wallet: 'Wallet & Transactions',
        withdrawals: 'Withdrawal Requests',
        referrals: 'Referral System',
        settings: 'Platform Settings',
        logs: 'Logs & Security'
    };
    document.getElementById('page-title').textContent = titles[section] || section;

    // Load section-specific data
    switch (section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'users':
            loadUsers();
            break;
        case 'tasks':
            loadTasks('official');
            break;
        case 'wallet':
            loadTransactions('all');
            break;
        case 'withdrawals':
            loadWithdrawals('pending');
            break;
        case 'referrals':
            loadReferrals();
            break;
        case 'settings':
            loadSettingsToForm();
            break;
    }
}

// Dashboard
async function loadDashboardData() {
    try {
        // Load total users
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        document.getElementById('total-users').textContent = totalUsers;

        // Load active users (last 24h)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const activeUsers = usersSnapshot.docs.filter(doc => {
            const lastActive = doc.data().last_active;
            return lastActive && lastActive > yesterday;
        }).length;
        document.getElementById('active-users').textContent = activeUsers;

        // Load total revenue (sum of all withdrawals)
        const withdrawalsSnapshot = await db.collection('withdrawals')
            .where('status', '==', 'completed')
            .get();
        const totalRevenue = withdrawalsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        document.getElementById('total-revenue').textContent = `${totalRevenue.toFixed(3)} TON`;

        // Load pending withdrawals
        const pendingSnapshot = await db.collection('withdrawals')
            .where('status', '==', 'pending')
            .get();
        document.getElementById('pending-withdrawals').textContent = pendingSnapshot.size;

        // Calculate platform reserve
        const totalBalance = usersSnapshot.docs.reduce((sum, doc) => sum + (doc.data().balance || 0), 0);
        const pendingWithdrawals = pendingSnapshot.docs.reduce((sum, doc) => sum + (doc.data().net_amount || 0), 0);
        const platformReserve = totalBalance - pendingWithdrawals;
        document.getElementById('platform-reserve').textContent = `${platformReserve.toFixed(3)} TON`;

        // Load ads watched today
        const today = new Date().toDateString();
        const adsToday = usersSnapshot.docs.reduce((sum, doc) => {
            const userData = doc.data();
            // Check if user was active today
            if (userData.last_active && new Date(userData.last_active).toDateString() === today) {
                return sum + (userData.ads_watched || 0);
            }
            return sum;
        }, 0);
        document.getElementById('ads-today').textContent = adsToday;

        // Load recent activity
        loadRecentActivity();

    } catch (error) {
        console.error('Dashboard data error:', error);
    }
}

async function loadRecentActivity() {
    try {
        const activityList = document.getElementById('recent-activity');
        activityList.innerHTML = '';

        // Load recent users
        const recentUsers = await db.collection('users')
            .orderBy('created_at', 'desc')
            .limit(5)
            .get();

        recentUsers.forEach(doc => {
            const user = doc.data();
            const timeAgo = getTimeAgo(user.created_at);
            
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">👤</div>
                <div class="activity-info">
                    <div class="activity-text">New user: ${user.username || user.first_name || 'Unknown'}</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            `;
            activityList.appendChild(activityItem);
        });

    } catch (error) {
        console.error('Recent activity error:', error);
    }
}

// Users
async function loadUsers() {
    try {
        const usersTable = document.getElementById('users-table');
        usersTable.innerHTML = '<tr><td colspan="7">Loading users...</td></tr>';

        const usersSnapshot = await db.collection('users')
            .orderBy('created_at', 'desc')
            .limit(50)
            .get();

        usersTable.innerHTML = '';

        if (usersSnapshot.empty) {
            usersTable.innerHTML = '<tr><td colspan="7">No users found</td></tr>';
            return;
        }

        usersSnapshot.forEach(doc => {
            const user = doc.data();
            const row = createUserRow(user);
            usersTable.appendChild(row);
        });

    } catch (error) {
        console.error('Load users error:', error);
    }
}

function createUserRow(user) {
    const tr = document.createElement('tr');
    
    const statusClass = user.status === 'active' ? 'active' : (user.status === 'banned' ? 'banned' : 'inactive');
    
    tr.innerHTML = `
        <td>${user.telegram_id}</td>
        <td>${user.username || user.first_name || '-'}</td>
        <td>${user.balance.toFixed(3)} TON</td>
        <td>${user.total_earned.toFixed(3)} TON</td>
        <td>${user.referral_count || 0}</td>
        <td><span class="status-badge ${statusClass}">${user.status}</span></td>
        <td>
            <button class="btn btn-small" onclick="viewUser('${user.telegram_id}')">View</button>
            ${user.status === 'active' ? 
                `<button class="btn btn-small btn-danger" onclick="quickBan('${user.telegram_id}')">Ban</button>` :
                `<button class="btn btn-small btn-success" onclick="quickUnban('${user.telegram_id}')">Unban</button>`
            }
        </td>
    `;
    
    return tr;
}

function searchUsers(query) {
    // Implement search logic
    console.log('Searching for:', query);
    // In production, you'd use Firebase queries or Algolia
}

async function viewUser(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            alert('User not found');
            return;
        }

        selectedUser = userDoc.data();
        selectedUser.id = userId;

        document.getElementById('detail-telegram-id').textContent = selectedUser.telegram_id;
        document.getElementById('detail-username').textContent = selectedUser.username || selectedUser.first_name || '-';
        document.getElementById('detail-balance').textContent = `${selectedUser.balance.toFixed(3)} TON`;
        document.getElementById('detail-total-earned').textContent = `${selectedUser.total_earned.toFixed(3)} TON`;
        document.getElementById('detail-wallet').textContent = selectedUser.wallet_address || '-';
        document.getElementById('detail-status').textContent = selectedUser.status;

        // Show/hide ban button
        const banBtn = document.getElementById('ban-user-btn');
        const unbanBtn = document.getElementById('unban-user-btn');
        
        if (selectedUser.status === 'active') {
            banBtn.style.display = 'inline-flex';
            unbanBtn.style.display = 'none';
        } else {
            banBtn.style.display = 'none';
            unbanBtn.style.display = 'inline-flex';
        }

        document.getElementById('user-modal').style.display = 'flex';

    } catch (error) {
        console.error('View user error:', error);
        alert('Failed to load user details');
    }
}

async function banUser() {
    if (!selectedUser || !confirm(`Are you sure you want to ban ${selectedUser.username || selectedUser.first_name || 'this user'}?`)) {
        return;
    }

    try {
        await db.collection('users').doc(selectedUser.id).update({
            status: 'banned'
        });

        selectedUser.status = 'banned';
        document.getElementById('detail-status').textContent = 'banned';
        document.getElementById('ban-user-btn').style.display = 'none';
        document.getElementById('unban-user-btn').style.display = 'inline-flex';

        alert('User banned successfully');
        loadUsers();

    } catch (error) {
        console.error('Ban user error:', error);
        alert('Failed to ban user');
    }
}

async function unbanUser() {
    if (!selectedUser || !confirm(`Are you sure you want to unban ${selectedUser.username || selectedUser.first_name || 'this user'}?`)) {
        return;
    }

    try {
        await db.collection('users').doc(selectedUser.id).update({
            status: 'active'
        });

        selectedUser.status = 'active';
        document.getElementById('detail-status').textContent = 'active';
        document.getElementById('ban-user-btn').style.display = 'inline-flex';
        document.getElementById('unban-user-btn').style.display = 'none';

        alert('User unbanned successfully');
        loadUsers();

    } catch (error) {
        console.error('Unban user error:', error);
        alert('Failed to unban user');
    }
}

async function quickBan(userId) {
    if (!confirm('Are you sure you want to ban this user?')) return;

    try {
        await db.collection('users').doc(userId).update({
            status: 'banned'
        });
        loadUsers();
    } catch (error) {
        console.error('Quick ban error:', error);
    }
}

async function quickUnban(userId) {
    if (!confirm('Are you sure you want to unban this user?')) return;

    try {
        await db.collection('users').doc(userId).update({
            status: 'active'
        });
        loadUsers();
    } catch (error) {
        console.error('Quick unban error:', error);
    }
}

// Tasks
async function loadTasks(type) {
    try {
        const tasksTable = document.getElementById('tasks-table');
        tasksTable.innerHTML = '<tr><td colspan="7">Loading tasks...</td></tr>';

        let query = db.collection('tasks');
        
        if (type !== 'all') {
            query = query.where('type', '==', type);
        }
        
        const tasksSnapshot = await query.orderBy('created_at', 'desc').limit(50).get();
        
        tasksTable.innerHTML = '';
        
        if (tasksSnapshot.empty) {
            tasksTable.innerHTML = `<tr><td colspan="7">No ${type} tasks found</td></tr>`;
            return;
        }

        tasksSnapshot.forEach(doc => {
            const task = doc.data();
            const row = createTaskRow(task, doc.id);
            tasksTable.appendChild(row);
        });

    } catch (error) {
        console.error('Load tasks error:', error);
    }
}

function createTaskRow(task, taskId) {
    const tr = document.createElement('tr');
    const statusClass = task.status || 'active';
    
    tr.innerHTML = `
        <td>${taskId.slice(0, 15)}...</td>
        <td>${task.title}</td>
        <td>${task.type}</td>
        <td>${task.reward.toFixed(3)} TON</td>
        <td>${task.clicks_done || 0}/${task.clicks_required || 0}</td>
        <td><span class="status-badge ${statusClass}">${task.status}</span></td>
        <td>
            ${task.type === 'paid' ? 
                `<button class="btn btn-small btn-danger" onclick="cancelTask('${taskId}')">Cancel</button>` :
                `<button class="btn btn-small btn-danger" onclick="deleteTask('${taskId}')">Delete</button>`
            }
        </td>
    `;
    
    return tr;
}

async function createOfficialTask() {
    const title = document.getElementById('task-title-input').value.trim();
    const description = document.getElementById('task-desc-input').value.trim();
    const link = document.getElementById('task-link-input').value.trim();
    const reward = parseFloat(document.getElementById('task-reward-input').value);
    const verification = document.getElementById('task-verification-input').value;
    const expiry = parseInt(document.getElementById('task-expiry-input').value);

    if (!title || !link || !reward) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        await db.collection('tasks').add({
            task_id: `task_${Date.now()}`,
            creator_id: 'admin',
            title: title,
            description: description,
            type: 'official',
            link: link,
            reward: reward,
            clicks_required: 999999, // Unlimited for official tasks
            clicks_done: 0,
            budget: null,
            verification: verification,
            status: 'active',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + expiry * 24 * 60 * 60 * 1000).toISOString()
        });

        alert('Task created successfully!');
        document.getElementById('task-modal').style.display = 'none';
        
        // Clear form
        document.getElementById('task-title-input').value = '';
        document.getElementById('task-desc-input').value = '';
        document.getElementById('task-link-input').value = '';
        document.getElementById('task-reward-input').value = '';
        document.getElementById('task-expiry-input').value = '30';

        loadTasks('official');

    } catch (error) {
        console.error('Create task error:', error);
        alert('Failed to create task');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        await db.collection('tasks').doc(taskId).delete();
        loadTasks('official');
    } catch (error) {
        console.error('Delete task error:', error);
    }
}

async function cancelTask(taskId) {
    if (!confirm('Are you sure you want to cancel this task?')) return;

    try {
        await db.collection('tasks').doc(taskId).update({
            status: 'cancelled'
        });
        loadTasks('paid');
    } catch (error) {
        console.error('Cancel task error:', error);
    }
}

// Withdrawals
async function loadWithdrawals(status) {
    try {
        const withdrawalsTable = document.getElementById('withdrawals-table');
        withdrawalsTable.innerHTML = '<tr><td colspan="8">Loading withdrawals...</td></tr>';

        let query = db.collection('withdrawals');
        
        if (status !== 'all') {
            query = query.where('status', '==', status);
        }
        
        const withdrawalsSnapshot = await query.orderBy('requested_at', 'desc').limit(50).get();
        
        withdrawalsTable.innerHTML = '';
        
        if (withdrawalsSnapshot.empty) {
            withdrawalsTable.innerHTML = `<tr><td colspan="8">No ${status} withdrawals found</td></tr>`;
            return;
        }

        for (const doc of withdrawalsSnapshot.docs) {
            const withdrawal = doc.data();
            const row = await createWithdrawalRow(withdrawal, doc.id);
            withdrawalsTable.appendChild(row);
        }

    } catch (error) {
        console.error('Load withdrawals error:', error);
    }
}

async function createWithdrawalRow(withdrawal, withdrawalId) {
    const tr = document.createElement('tr');
    const statusClass = withdrawal.status || 'pending';
    
    // Get user info
    let username = 'Unknown';
    try {
        const userDoc = await db.collection('users').doc(withdrawal.user_id).get();
        if (userDoc.exists) {
            const user = userDoc.data();
            username = user.username || user.first_name || user.telegram_id;
        }
    } catch (error) {
        console.error('Get user error:', error);
    }
    
    const shortWallet = withdrawal.wallet_address.slice(0, 8) + '...' + withdrawal.wallet_address.slice(-8);
    
    let actions = '-';
    if (withdrawal.status === 'pending') {
        actions = `
            <button class="btn btn-small btn-success" onclick="approveWithdrawal('${withdrawalId}')">Approve</button>
            <button class="btn btn-small btn-danger" onclick="rejectWithdrawal('${withdrawalId}')">Reject</button>
        `;
    }
    
    tr.innerHTML = `
        <td>${withdrawalId.slice(0, 15)}...</td>
        <td>${username}</td>
        <td>${withdrawal.amount.toFixed(3)} TON</td>
        <td>${withdrawal.fee.toFixed(3)} TON</td>
        <td>${withdrawal.net_amount.toFixed(3)} TON</td>
        <td title="${withdrawal.wallet_address}">${shortWallet}</td>
        <td><span class="status-badge ${statusClass}">${withdrawal.status}</span></td>
        <td>${actions}</td>
    `;
    
    return tr;
}

async function approveWithdrawal(withdrawalId) {
    if (!confirm('Are you sure you want to approve this withdrawal?')) return;

    try {
        const withdrawalDoc = await db.collection('withdrawals').doc(withdrawalId).get();
        const withdrawal = withdrawalDoc.data();

        // Update withdrawal status
        await db.collection('withdrawals').doc(withdrawalId).update({
            status: 'completed',
            processed_at: new Date().toISOString()
        });

        // In production, you would send the TON transaction here
        // This would require backend integration with TON blockchain

        alert('Withdrawal approved successfully!');
        loadWithdrawals('pending');
        loadPendingWithdrawalsCount();

    } catch (error) {
        console.error('Approve withdrawal error:', error);
        alert('Failed to approve withdrawal');
    }
}

async function rejectWithdrawal(withdrawalId) {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
        const withdrawalDoc = await db.collection('withdrawals').doc(withdrawalId).get();
        const withdrawal = withdrawalDoc.data();

        // Update withdrawal status
        await db.collection('withdrawals').doc(withdrawalId).update({
            status: 'failed',
            processed_at: new Date().toISOString()
        });

        // Refund user
        await db.collection('users').doc(withdrawal.user_id).update({
            balance: firebase.firestore.FieldValue.increment(withdrawal.amount)
        });

        // Add refund transaction
        await db.collection('transactions').add({
            tx_id: `tx_${Date.now()}`,
            user_id: withdrawal.user_id,
            type: 'refund',
            amount: withdrawal.amount,
            fee: 0,
            network: null,
            task_id: null,
            status: 'completed',
            timestamp: new Date().toISOString(),
            description: `Withdrawal rejected: ${reason}`
        });

        alert('Withdrawal rejected and refunded!');
        loadWithdrawals('pending');
        loadPendingWithdrawalsCount();

    } catch (error) {
        console.error('Reject withdrawal error:', error);
        alert('Failed to reject withdrawal');
    }
}

async function loadPendingWithdrawalsCount() {
    try {
        const pendingSnapshot = await db.collection('withdrawals')
            .where('status', '==', 'pending')
            .get();
        
        document.getElementById('pending-badge').textContent = pendingSnapshot.size;
        document.getElementById('pending-badge').style.display = pendingSnapshot.size > 0 ? 'inline-block' : 'none';
    } catch (error) {
        console.error('Pending withdrawals count error:', error);
    }
}

// Transactions
async function loadTransactions(type) {
    try {
        const transactionsTable = document.getElementById('transactions-table');
        transactionsTable.innerHTML = '<tr><td colspan="6">Loading transactions...</td></tr>';

        let query = db.collection('transactions');
        
        if (type !== 'all') {
            query = query.where('type', '==', type);
        }
        
        const transactionsSnapshot = await query.orderBy('timestamp', 'desc').limit(100).get();
        
        transactionsTable.innerHTML = '';
        
        if (transactionsSnapshot.empty) {
            transactionsTable.innerHTML = `<tr><td colspan="6">No transactions found</td></tr>`;
            return;
        }

        transactionsSnapshot.forEach(doc => {
            const tx = doc.data();
            const row = createTransactionRow(tx);
            transactionsTable.appendChild(row);
        });

    } catch (error) {
        console.error('Load transactions error:', error);
    }
}

function createTransactionRow(tx) {
    const tr = document.createElement('tr');
    const shortTxId = tx.tx_id.slice(0, 15) + '...';
    
    tr.innerHTML = `
        <td>${shortTxId}</td>
        <td>${tx.user_id}</td>
        <td>${tx.type}</td>
        <td>${tx.amount.toFixed(3)} TON</td>
        <td>${tx.fee ? tx.fee.toFixed(3) : '-'} TON</td>
        <td>${formatDateTime(tx.timestamp)}</td>
    `;
    
    return tr;
}

// Referrals
async function loadReferrals() {
    try {
        // Load total referrals and payouts
        const usersSnapshot = await db.collection('users').get();
        
        let totalReferrals = 0;
        let totalPayouts = 0;
        
        usersSnapshot.forEach(doc => {
            const user = doc.data();
            totalReferrals += user.referral_count || 0;
            totalPayouts += user.referral_earnings || 0;
        });
        
        document.getElementById('total-referrals').textContent = totalReferrals;
        document.getElementById('total-payouts').textContent = `${totalPayouts.toFixed(3)} TON`;

        // Load referral transactions
        const referralSnapshot = await db.collection('transactions')
            .where('type', '==', 'referral')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();

        const referralsTable = document.getElementById('referrals-table');
        referralsTable.innerHTML = '';
        
        if (referralSnapshot.empty) {
            referralsTable.innerHTML = '<tr><td colspan="4">No referrals found</td></tr>';
            return;
        }

        referralSnapshot.forEach(doc => {
            const tx = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tx.user_id}</td>
                <td>${tx.description}</td>
                <td>${tx.amount.toFixed(3)} TON</td>
                <td>${formatDateTime(tx.timestamp)}</td>
            `;
            referralsTable.appendChild(row);
        });

    } catch (error) {
        console.error('Load referrals error:', error);
    }
}

// Settings
async function loadSettings() {
    try {
        const settingsDoc = await db.collection('settings').doc('platform_config').get();
        
        if (settingsDoc.exists) {
            settings = settingsDoc.data();
        }
    } catch (error) {
        console.error('Load settings error:', error);
    }
}

async function loadSettingsToForm() {
    await loadSettings();
    
    document.getElementById('min-deposit').value = settings.min_deposit || 10;
    document.getElementById('min-withdrawal').value = settings.min_withdrawal || 2;
    document.getElementById('withdrawal-fee').value = (settings.withdrawal_fee || 0.20) * 100;
    document.getElementById('price-per-click').value = settings.task_price_per_click || 0.004;
    document.getElementById('referral-commission').value = (settings.referral_commission || 0.10) * 100;
    document.getElementById('referral-bonus').value = settings.referral_bonus || 0.005;
    document.getElementById('cpm-target').value = settings.cpm_target || 10000;
    document.getElementById('cpm-reward').value = settings.cpm_reward_per_click || 0.0028;
    document.getElementById('cpm-bonus').value = settings.cpm_completion_bonus || 0.25;
    
    // Ad settings
    document.getElementById('tier1-reward').value = 0.005;
    document.getElementById('tier2-reward').value = 0.007;
    document.getElementById('tier3-reward').value = 0.008;
    document.getElementById('ad-cooldown').value = 10;
    document.getElementById('daily-ad-limit').value = settings.daily_ad_limit || 3000;
}

async function savePlatformSettings() {
    const newSettings = {
        min_deposit: parseFloat(document.getElementById('min-deposit').value),
        min_withdrawal: parseFloat(document.getElementById('min-withdrawal').value),
        withdrawal_fee: parseFloat(document.getElementById('withdrawal-fee').value) / 100,
        task_price_per_click: parseFloat(document.getElementById('price-per-click').value),
        referral_commission: parseFloat(document.getElementById('referral-commission').value) / 100,
        referral_bonus: parseFloat(document.getElementById('referral-bonus').value),
        cpm_target: parseInt(document.getElementById('cpm-target').value),
        cpm_reward_per_click: parseFloat(document.getElementById('cpm-reward').value),
        cpm_completion_bonus: parseFloat(document.getElementById('cpm-bonus').value),
        updated_at: new Date().toISOString()
    };

    try {
        await db.collection('settings').doc('platform_config').set(newSettings);
        settings = newSettings;
        alert('Settings saved successfully!');
    } catch (error) {
        console.error('Save settings error:', error);
        alert('Failed to save settings');
    }
}

async function saveAdSettings() {
    const adSettings = {
        tier1_reward: parseFloat(document.getElementById('tier1-reward').value),
        tier2_reward: parseFloat(document.getElementById('tier2-reward').value),
        tier3_reward: parseFloat(document.getElementById('tier3-reward').value),
        ad_cooldown: parseInt(document.getElementById('ad-cooldown').value),
        daily_ad_limit: parseInt(document.getElementById('daily-ad-limit').value)
    };

    try {
        await db.collection('settings').doc('ad_settings').set(adSettings);
        alert('Ad settings saved successfully!');
    } catch (error) {
        console.error('Save ad settings error:', error);
        alert('Failed to save ad settings');
    }
}

// Helper Functions
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Export functions for inline HTML handlers
window.viewUser = viewUser;
window.quickBan = quickBan;
window.quickUnban = quickUnban;
window.approveWithdrawal = approveWithdrawal;
window.rejectWithdrawal = rejectWithdrawal;
window.deleteTask = deleteTask;
window.cancelTask = cancelTask;

console.log('AdTONX Admin Panel loaded successfully');