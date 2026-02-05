// Main application
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Start login process
    await loginUser();
});

async function loginUser() {
    const tg = window.Telegram?.WebApp;
    
    try {
        if (!tg || !tg.initDataUnsafe) {
            console.warn("Telegram WebApp environment not detected. Running in sandbox mode.");
        }

        if (tg) {
            tg.ready();
            tg.expand();
            tg.setHeaderColor('secondary_bg_color');
            tg.setBackgroundColor('bg_color');
        }

        // Extract user data
        const initDataUnsafe = tg?.initDataUnsafe || {};
        const tgUser = initDataUnsafe.user;
        
        // Parse referral code
        const startParam = initDataUnsafe.start_param;
        const referrerId = startParam && startParam.startsWith('ref_') 
            ? startParam.replace('ref_', '') 
            : null;

        // Wait for Firebase initialization
        await waitForFirebase();

        // Get or create user
        const userData = await firebaseService.getOrInitUser(tgUser, referrerId);
        AdTONX.user = userData;

        // Check referral bonus
        if (!userData.referral_bonus_paid && userData.referred_by) {
            await firebaseService.checkAndCreditReferralBonus(userData);
        }

        // Show navigation
        document.getElementById('navigation').classList.remove('hidden');
        
        // Load home page
        await router.handleRoute();

    } catch (error) {
        console.error("Login error:", error);
        showErrorScreen(error.message || "Protocol synchronization failed.");
    }
}

function waitForFirebase() {
    return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
            if (firebaseService.initialized) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error("Firebase initialization timeout"));
        }, 10000);
    });
}

function showErrorScreen(errorMessage) {
    document.getElementById('app