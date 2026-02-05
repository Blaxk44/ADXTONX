# AdTONX Telegram WebApp - Deployment Guide

## Railway Deployment

### Prerequisites
1. Railway account (https://railway.app)
2. GitHub repository with the code
3. Firebase project setup

### Deployment Steps

#### Method 1: Direct from GitHub (Recommended)
1. Go to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will automatically detect and deploy

#### Method 2: Using Railway CLI
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up