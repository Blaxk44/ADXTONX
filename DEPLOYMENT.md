# AdTONX Deployment Guide 🚀

This guide will help you deploy the AdTONX Telegram Mini App to production.

## 📋 Pre-Deployment Checklist

- [ ] Firebase project is set up and configured
- [ ] Admin credentials are changed from default
- [ ] Ad network IDs are verified
- [ ] Firebase Security Rules are deployed
- [ ] All features are tested locally
- [ ] Telegram Bot Mini App URL is ready

## 🌐 Deployment Options

### Option 1: GitHub Pages (Recommended - Free)

#### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `adtonx` or your preferred name
3. Initialize with README (optional)
4. Create the repository

#### Step 2: Upload Files

**Option A: Using GitHub Web Interface**
1. Click "Upload files" button
2. Drag and drop all project files:
   - index.html
   - styles.css
   - app.js
   - admin.html
   - admin.css
   - admin.js
   - README.md
   - .gitignore
3. Add commit message: "Initial deployment"
4. Click "Commit changes"

**Option B: Using Git Command Line**

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial deployment"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/adtonx.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Select **main** branch and **/ (root)** folder
6. Click **Save**

Your site will be deployed at: `https://YOUR_USERNAME.github.io/adtonx/`

#### Step 4: Configure Telegram Bot

1. Open [@BotFather](https://t.me/BotFather) in Telegram
2. Send `/mybots`
3. Select @AdTONX_Bot
4. Go to **Bot Settings** → **Menu Button**
5. Set URL to your GitHub Pages URL
6. Save changes

### Option 2: Firebase Hosting

#### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### Step 2: Login to Firebase

```bash
firebase login
```

#### Step 3: Initialize Firebase

```bash
firebase init
```

Select:
- **Hosting:** Configure files for Firebase Hosting
- **Use an existing project:** Select `adtonx-bot`
- **Public directory:** `.` (current directory)
- **Configure as single-page app:** No
- **Set up automatic builds:** No

#### Step 4: Deploy

```bash
firebase deploy
```

Your site will be deployed at: `https://adtonx-bot.web.app`

### Option 3: Netlify (Free)

#### Step 1: Deploy via Drag & Drop

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop your project folder
3. Wait for deployment to complete

#### Step 2: Get Your URL

Netlify will provide a random URL like:
`https://random-name-123456.netlify.app`

You can customize this in Netlify dashboard.

### Option 4: Vercel (Free)

#### Step 1: Deploy via CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts to deploy.

#### Step 2: Get Your URL

Vercel will provide a URL like:
`https://adtonx.vercel.app`

## 🔐 Post-Deployment Setup

### 1. Update Admin Credentials

Open `admin.js` and update the admin credentials:

```javascript
const ADMIN_CREDENTIALS = {
    username: 'YOUR_NEW_USERNAME',
    password: 'YOUR_SECURE_PASSWORD'
};
```

**Important:** Use strong passwords and consider using environment variables in production.

### 2. Verify Firebase Configuration

Ensure `app.js` and `admin.js` have the correct Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyCToNn1VqYZrZjjbbBA2KW126ZBso-0D80",
    authDomain: "adtonx-bot.firebaseapp.com",
    projectId: "adtonx-bot",
    // ... rest of config
};
```

### 3. Deploy Firebase Security Rules

Open [Firebase Console](https://console.firebase.google.com)
1. Go to Firestore Database
2. Click on **Rules** tab
3. Copy the security rules from README.md
4. Click **Publish**

### 4. Test the Application

1. Open your deployed URL in a browser
2. Test as a regular user:
   - Watch ads
   - Complete tasks
   - Check balance
   - Copy referral link
3. Test admin panel:
   - Login with admin credentials
   - View users
   - Check withdrawals
   - Create tasks

### 5. Set Up Telegram Webhook (Optional)

For advanced bot features, set up a webhook:

```bash
curl -F "url=https://your-deployed-url/webhook" \
     "https://api.telegram.org/bot8356591705:AAGUlcADugoR3u77EiAY67C8XSyZGU89PcU/setWebhook"
```

## 📊 Monitoring

### Firebase Console

Monitor your app:
- **Authentication:** User sign-ins
- **Firestore Database:** Data operations
- **Crashlytics:** App crashes (if added)

### Admin Panel

Use the admin panel to monitor:
- User activity
- Ad revenue
- Withdrawal requests
- Platform statistics

## 🔄 Updating the App

### GitHub Pages

```bash
git add .
git commit -m "Update features"
git push
```

Changes are automatically deployed within minutes.

### Firebase Hosting

```bash
firebase deploy
```

### Netlify/Vercel

Push changes to your Git repository, and they auto-deploy.

## 🐛 Troubleshooting

### Issue: App not loading

**Solution:**
- Check browser console for errors
- Verify Firebase configuration
- Ensure Firebase project is enabled

### Issue: Admin panel not accessible

**Solution:**
- Check admin credentials in `admin.js`
- Clear browser cache
- Try incognito mode

### Issue: Ads not showing

**Solution:**
- Verify ad network IDs
- Check if ad networks are enabled in admin panel
- Test on mobile device (some ads require mobile)

### Issue: Withdrawal not processing

**Solution:**
- Check withdrawal status in admin panel
- Ensure user has sufficient balance
- Verify wallet address format

## 📱 Mobile Testing

Test on Telegram Mobile App:
1. Open @AdTONX_Bot in Telegram
2. Click Menu button
3. Mini App will open
4. Test all features

## 🎯 Production Best Practices

1. **Security:**
   - Change admin credentials
   - Use HTTPS
   - Implement rate limiting
   - Monitor suspicious activity

2. **Performance:**
   - Optimize images
   - Minify CSS/JS
   - Use CDN for static assets
   - Enable caching

3. **Backup:**
   - Regular Firebase backups
   - Export data periodically
   - Keep deployment history

4. **Monitoring:**
   - Set up alerts for errors
   - Monitor user feedback
   - Track key metrics
   - Review analytics weekly

## 📞 Support

If you encounter issues:
1. Check this deployment guide
2. Review README.md
3. Check Firebase Console logs
4. Contact support via Telegram

---

**Deployment complete! 🎉**

Your AdTONX Mini App is now live and ready to use!