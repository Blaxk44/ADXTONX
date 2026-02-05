# Admin Login Credentials 🔐

## Admin Panel Access

### Admin Panel URL
```
https://[your-deployed-url]/admin.html
```

For example, if deployed to GitHub Pages:
```
https://your-username.github.io/adtonx/admin.html
```

### Login Credentials

**Username:** `TRILLIONAIRE`

**Password:** `Asdfghjkl@123`

⚠️ **IMPORTANT SECURITY WARNING:**
These are the default credentials. You MUST change them before deploying to production!

## How to Change Admin Credentials

### Method 1: Direct Code Change (Quick)

1. Open the `admin.js` file
2. Find this code (around line 15-19):

```javascript
const ADMIN_CREDENTIALS = {
    username: 'TRILLIONAIRE',
    password: 'Asdfghjkl@123'
};
```

3. Change the username and password to your secure credentials:

```javascript
const ADMIN_CREDENTIALS = {
    username: 'YOUR_NEW_USERNAME',
    password: 'YourSecurePassword123!'
};
```

4. Save the file and redeploy

### Method 2: Using Environment Variables (Recommended for Production)

1. Create a `.env` file (don't commit this to Git):
```
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_secure_password
```

2. Update `admin.js` to use environment variables:

```javascript
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'TRILLIONAIRE',
    password: process.env.ADMIN_PASSWORD || 'Asdfghjkl@123'
};
```

## Security Best Practices

### Password Requirements
- Minimum 12 characters
- Mix of uppercase and lowercase letters
- Include numbers
- Include special characters (!@#$%^&*)
- Don't use common words or patterns

### Example Strong Passwords
```
✅ Xy7!mP9#qL2@nR
✅ T3l3gr@mS3cur3!2024
✅ AdTONX@dm1nP@ss2024
```

### Weak Passwords (AVOID)
```
❌ password
❌ admin123
❌ 12345678
❌ Asdfghjkl@123 (current default)
```

## Accessing Admin Panel

### Step 1: Deploy the App
Follow the instructions in `DEPLOYMENT.md` to deploy your app.

### Step 2: Open Admin Panel
Navigate to your deployed URL + `/admin.html`

Example:
```
https://your-username.github.io/adtonx/admin.html
```

### Step 3: Login
Enter your username and password to access the admin panel.

## Admin Features

Once logged in, you can access:

1. **Dashboard** - View platform statistics and analytics
2. **Users** - Manage user accounts, ban/unban users
3. **Ads Management** - Enable/disable ad networks, adjust rewards
4. **Tasks** - Create and manage tasks
5. **Wallet & Transactions** - View all transactions
6. **Withdrawals** - Approve or reject withdrawal requests
7. **Referrals** - Monitor referral system
8. **Settings** - Configure platform settings
9. **Logs & Security** - View security logs

## Troubleshooting

### Can't Login?

**Problem:** Invalid username or password error

**Solutions:**
1. Check that you're using the correct credentials (case-sensitive)
2. Make sure you've saved the changes to `admin.js`
3. Clear your browser cache and try again
4. Try using incognito/private mode
5. Check browser console for errors (F12 → Console)

### Admin Panel Not Loading?

**Problem:** Admin page shows blank or errors

**Solutions:**
1. Ensure both `admin.html` and `admin.js` are deployed
2. Check Firebase configuration in `admin.js`
3. Verify Firebase Auth is enabled
4. Check browser console for specific errors

### Forgot Admin Password?

**Solution:**
1. Open `admin.js` in your code editor
2. Find the `ADMIN_CREDENTIALS` object
3. Reset the password to a new value
4. Save and redeploy

## Security Checklist

Before deploying to production:

- [ ] Changed default username from `TRILLIONAIRE`
- [ ] Changed default password from `Asdfghjkl@123`
- [ ] Used a strong, unique password
- [ ] Not shared credentials with unauthorized users
- [ ] Enabled HTTPS on your deployment
- [ ] Set up regular password rotation
- [ ] Implemented IP restrictions (if possible)
- [ ] Added 2FA (two-factor authentication) in future

## Additional Security Measures

### 1. Firebase Authentication (Future)
Consider implementing Firebase Authentication for admin login:
```javascript
await auth.signInWithEmailAndPassword(email, password);
```

### 2. JWT Tokens (Future)
Use JSON Web Tokens for session management:
```javascript
const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
```

### 3. IP Whitelisting (Future)
Restrict admin access to specific IP addresses:
```javascript
const allowedIPs = ['192.168.1.1', '10.0.0.1'];
if (!allowedIPs.includes(request.ip)) {
    return res.status(403).send('Access denied');
}
```

### 4. Rate Limiting (Future)
Implement rate limiting to prevent brute force attacks:
```javascript
const loginAttempts = new Map();
if (loginAttempts.has(ip) && loginAttempts.get(ip) > 5) {
    return res.status(429).send('Too many attempts');
}
```

## Support

If you have issues with admin access:
1. Check this documentation
2. Review `admin.js` for configuration
3. Check browser console for errors
4. Verify Firebase is properly configured

---

**Remember:** Security is everyone's responsibility. Keep your admin credentials safe and change them regularly!