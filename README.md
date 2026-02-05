# AdTONX - Telegram Mini App 🪙

A complete Telegram Mini App for earning TON cryptocurrency by watching ads and completing tasks.

## 🚀 Features

### User Features
- **Watch Ads** - Earn TON by watching ads from multiple networks (Monetag, Adexium, Adsgram)
- **Complete Tasks** - Complete official, partner, and user-paid tasks for rewards
- **Referral System** - Invite friends and earn 10% commission on their earnings
- **Wallet System** - Withdraw earnings to your TON wallet
- **Tier Rewards** - Progressive reward tiers based on activity

### Admin Features
- **Dashboard** - Real-time analytics and statistics
- **User Management** - View, ban, and manage users
- **Task Management** - Create and manage tasks
- **Withdrawal Approval** - Approve or reject withdrawal requests
- **Ad Network Control** - Enable/disable ad networks
- **Platform Settings** - Configure fees, limits, and rewards

## 📦 Installation

### Prerequisites
- Firebase project with Firestore database
- Telegram Bot (already created: @AdTONX_Bot)

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd adtonx
```

2. **Configure Firebase**
- The app is already configured with your Firebase project
- Firebase is enabled for: Firestore Database and Authentication

3. **Deploy to GitHub Pages**

Option A: Using GitHub Web Interface
1. Go to your repository settings
2. Navigate to Pages
3. Select `main` branch as source
4. Click Save

Option B: Using GitHub CLI
```bash
gh repo set-default
gh api repos/:owner/:repo/pages -X PUT -f build_branch=main
```

4. **Configure Telegram Bot**

Set your Mini App URL in Telegram:
1. Open [@BotFather](https://t.me/BotFather)
2. Send: `/mybots`
3. Select @AdTONX_Bot
4. Go to Bot Settings → Menu Button
5. Set the URL to your GitHub Pages URL

## 🔧 Configuration

### Firebase Security Rules

The app uses these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /transactions/{transactionId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
    
    match /tasks/{taskId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /withdrawals/{withdrawalId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        (resource.data.user_id == request.auth.uid || isAdmin());
      allow update: if isAdmin();
    }
    
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /admins/{adminId} {
      allow read, write: if false;
    }
    
    function isAdmin() {
      return exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

### Admin Access

- **Admin Panel URL:** `https://[your-github-pages-url]/admin.html`
- **Username:** TRILLIONAIRE
- **Password:** Asdfghjkl@123

⚠️ **Important:** Change the admin credentials in `admin.js` before production deployment!

## 💰 Reward System

### Ad Rewards
- **Tier 1** (0-400 ads): 0.005 TON per ad
- **Tier 2** (400-1000 ads): 0.007 TON per ad
- **Tier 3** (1000+ ads): 0.008 TON per ad
- **Daily Limit:** 3000 ads per user

### Referral System
- **Commission:** 10% of referral's lifetime earnings
- **Bonus:** 0.005 TON per active referral

### Withdrawal
- **Minimum:** 2 TON
- **Fee:** 20%
- **Processing:** 5-30 minutes (manual approval)

## 📺 Ad Networks

### 1. Monetag
- **Ad Unit ID:** 10551237
- **Type:** Rewarded Interstitial

### 2. Adexium
- **Widget ID:** 593e85f5-6028-4ee2-bf80-f7729b16a482
- **Type:** Interstitial

### 3. Adsgram
- **Block ID:** int-22171
- **CPM URL:** https://otieu.com/4/10551270

## 🗄️ Database Structure

### Users Collection
```javascript
{
  telegram_id: "123456789",
  username: "john_doe",
  balance: 0.525,
  total_earned: 2.345,
  ads_watched: 156,
  referral_count: 3,
  wallet_address: "UQ...",
  status: "active"
}
```

### Transactions Collection
```javascript
{
  tx_id: "tx_123456",
  user_id: "123456789",
  type: "ad_watched",
  amount: 0.005,
  status: "completed",
  timestamp: "2024-01-20T14:25:00Z"
}
```

### Tasks Collection
```javascript
{
  task_id: "task_123",
  title: "Join Telegram Channel",
  type: "official",
  reward: 0.1,
  status: "active"
}
```

### Withdrawals Collection
```javascript
{
  withdrawal_id: "wd_123456",
  user_id: "123456789",
  amount: 2.5,
  fee: 0.5,
  status: "pending"
}
```

## 🔐 Security Features

- Telegram WebApp authentication
- Firebase security rules
- Ad cooldown timer (10 seconds)
- Daily ad limits (3000 per user)
- Withdrawal approval system
- User management (ban/unban)

## 📱 Screens

1. **Home** - Balance, stats, referral link
2. **Ads** - Watch ads, progress tracking
3. **Tasks** - Complete tasks for rewards
4. **Wallet** - Withdraw, view history

## 🎨 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Firebase Firestore
- **Authentication:** Firebase Auth (Anonymous)
- **Hosting:** GitHub Pages
- **Telegram SDK:** Telegram WebApp API

## 🚀 Deployment

### GitHub Pages

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

### Firebase Hosting (Alternative)

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

## 📊 Analytics

Track key metrics:
- Daily Active Users (DAU)
- Ads Watched per User
- Withdrawal Frequency
- Referral Conversion Rate
- Platform Revenue

## 🛠️ Development

### Local Development

1. Use a local server (e.g., Live Server in VS Code)
2. Firebase configuration is ready to use
3. Test with Telegram Bot's debug mode

### Adding New Features

1. Update database schema if needed
2. Add UI components to `index.html`
3. Add styling to `styles.css`
4. Implement logic in `app.js`
5. Test thoroughly before deployment

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support and updates:
- Telegram Bot: @AdTONX_Bot
- Admin: @TRILLIONAIRE

## ⚠️ Important Notes

1. **Security:** Change admin credentials before production
2. **Ad Networks:** Ensure all ad network IDs are correct
3. **Firebase:** Enable Firestore and Anonymous Auth
4. **Testing:** Test all features thoroughly before launch
5. **Monitoring:** Monitor analytics and user feedback

## 🎯 Future Enhancements

- [ ] Push notifications
- [ ] Leaderboard with prizes
- [ ] Achievement system
- [ ] More ad networks
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] User-to-user transfers
- [ ] Staking rewards

---

**Built with ❤️ for the TON ecosystem**