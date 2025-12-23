# Deployment Guide - Baby Registry Site

This guide will help you deploy your baby registry site so others can use the voting and messaging features.

## Overview

You'll need to deploy:
1. **Backend** (Express server) → Railway (handles votes.json and messages.json)
2. **Frontend** (React app) → Vercel (serves the website)

---

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app) and sign up/login (GitHub login recommended)

### 1.2 Deploy Backend
1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Connect your GitHub account if needed
3. Select your repository (`baby registry site`)
4. Railway will auto-detect it's a Node.js project
5. Click **"Deploy"**

### 1.3 Configure Backend
1. Once deployed, Railway will give you a URL like `https://your-app-name.up.railway.app`
2. Click on your project → **"Settings"** → **"Generate Domain"** (optional, but recommended)
3. Copy your Railway URL - you'll need this for the frontend

### 1.4 Verify Backend is Running
- Check the **"Deployments"** tab - should show "Active"
- Check the **"Logs"** tab - should show "Server running on port XXXX"
- The JSON files (`votes.json`, `messages.json`) will be created automatically on Railway's filesystem

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up/login (GitHub login recommended)

### 2.2 Deploy Frontend
1. Click **"Add New Project"** → **"Import Git Repository"**
2. Connect your GitHub account if needed
3. Select your repository (`baby registry site`)
4. Vercel will auto-detect it's a Vite project

### 2.3 Configure Frontend Settings
In the deployment settings:

**Build Settings:**
- **Framework Preset:** Vite
- **Build Command:** `npm run build` (should be auto-detected)
- **Output Directory:** `dist` (should be auto-detected)
- **Install Command:** `npm install` (should be auto-detected)

**Environment Variables:**
Click **"Environment Variables"** and add:
- **Key:** `VITE_API_URL`
- **Value:** Your Railway backend URL (e.g., `https://your-app-name.up.railway.app`)
- **Environment:** Production, Preview, Development (check all three)

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-2 minutes)
3. Vercel will give you a URL like `https://your-project.vercel.app`

---

## Step 3: Test Your Deployment

### 3.1 Test Backend
Visit your Railway URL in a browser:
- `https://your-backend-url.railway.app/api/votes` - Should return vote counts
- `https://your-backend-url.railway.app/api/messages` - Should return messages array

### 3.2 Test Frontend
1. Visit your Vercel URL
2. Try submitting a vote - should work!
3. Try submitting a message - should work!
4. Check that the carousel shows messages

---

## Step 4: Update CORS (if needed)

If you get CORS errors, update `server.js`:

```javascript
app.use(cors({
  origin: [
    'https://your-vercel-url.vercel.app',
    'http://localhost:5173' // for local development
  ],
  credentials: true
}))
```

Or allow all origins (less secure but easier):
```javascript
app.use(cors({
  origin: '*',
  credentials: true
}))
```

---

## Step 5: Custom Domain (Optional)

### Backend (Railway)
1. Go to Railway project → **Settings** → **Networking**
2. Click **"Generate Domain"** or add a custom domain

### Frontend (Vercel)
1. Go to Vercel project → **Settings** → **Domains**
2. Add your custom domain (e.g., `babyregistry.com`)
3. Follow DNS setup instructions

**Important:** If you add a custom domain, update the `VITE_API_URL` environment variable in Vercel to match your backend domain.

---

## Troubleshooting

### Backend Issues

**Problem:** Backend not starting
- Check Railway logs for errors
- Verify `package.json` has `"start": "node server.js"`
- Check that `server.js` exists in root directory

**Problem:** CORS errors
- Update CORS settings in `server.js` to include your Vercel URL
- Make sure `VITE_API_URL` is set correctly

**Problem:** Votes/messages not saving
- Check Railway logs
- Verify JSON files are being created (check Railway's file explorer)
- Check file permissions

### Frontend Issues

**Problem:** Can't connect to backend
- Verify `VITE_API_URL` environment variable is set in Vercel
- Check that the backend URL is correct (no trailing slash)
- Make sure backend is running (check Railway)

**Problem:** Build fails
- Check Vercel build logs
- Make sure all dependencies are in `package.json`
- Try building locally: `npm run build`

**Problem:** API calls fail
- Check browser console for errors
- Verify CORS is configured correctly
- Check network tab to see the actual API request

---

## Environment Variables Summary

### Railway (Backend)
- `PORT` - Auto-set by Railway (usually 3000 or 3001)
- No other variables needed!

### Vercel (Frontend)
- `VITE_API_URL` - Your Railway backend URL (e.g., `https://your-app.up.railway.app`)

---

## Important Notes

1. **Data Persistence:** Railway's filesystem persists between deployments, so your votes and messages will be saved.

2. **Free Tier Limits:**
   - Railway: 500 hours/month free, then $5/month
   - Vercel: Unlimited for personal projects

3. **Security:** The current setup uses IP-based voting (one vote per IP). For production, consider:
   - Rate limiting
   - Input validation
   - Spam protection

4. **Backups:** Consider periodically backing up `votes.json` and `messages.json` from Railway.

---

## Quick Deploy Checklist

- [ ] Backend deployed to Railway
- [ ] Backend URL copied
- [ ] Frontend deployed to Vercel
- [ ] `VITE_API_URL` environment variable set in Vercel
- [ ] Test voting functionality
- [ ] Test messaging functionality
- [ ] Share your Vercel URL with others!

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Check the logs in both Railway and Vercel for error messages
