# 🚀 Quick Deployment Guide

## Step 1: Deploy Backend to Railway (5 minutes)

1. **Go to Railway:** https://railway.app
2. **Sign up/Login** (use GitHub)
3. **Click "New Project"** → **"Deploy from GitHub repo"**
4. **Select your repo:** `vc-sometimes/baby-registry`
5. **Railway auto-detects Node.js** → Click **"Deploy"**
6. **Wait 2-3 minutes** for deployment
7. **Copy your Railway URL** (e.g., `https://baby-registry-production.up.railway.app`)

**Test Backend:**
- Visit: `https://your-railway-url/health` (should show `{"status":"ok"}`)
- Visit: `https://your-railway-url/api/votes` (should show vote counts)

---

## Step 2: Deploy Frontend to Vercel (5 minutes)

1. **Go to Vercel:** https://vercel.com
2. **Sign up/Login** (use GitHub)
3. **Click "Add New Project"** → **"Import Git Repository"**
4. **Select your repo:** `vc-sometimes/baby-registry`
5. **In "Environment Variables" section:**
   - Click **"Add"**
   - **Key:** `VITE_API_URL`
   - **Value:** Your Railway URL (e.g., `https://baby-registry-production.up.railway.app`)
   - **Check all:** Production, Preview, Development
6. **Click "Deploy"**
7. **Wait 1-2 minutes** for build
8. **Get your Vercel URL** (e.g., `https://baby-registry.vercel.app`)

**Test Frontend:**
- Visit your Vercel URL
- Try voting (should work!)
- Try leaving a message (should work!)

---

## Troubleshooting Backend Issues

### Backend Not Working?

1. **Check Railway Logs:**
   - Go to Railway project → **"Deployments"** tab
   - Click on latest deployment → **"View Logs"**
   - Look for errors

2. **Common Issues:**
   - **"Cannot find module"** → Make sure `package.json` has all dependencies
   - **"Port already in use"** → Railway handles this automatically
   - **"Server not starting"** → Check that `server.js` is in root directory

3. **Test Backend Manually:**
   ```bash
   # In your terminal, test if backend responds:
   curl https://your-railway-url/health
   curl https://your-railway-url/api/votes
   ```

4. **Verify Files:**
   - `server.js` should be in root directory
   - `package.json` should have `"start": "node server.js"`
   - `railway.json` should exist

---

## Troubleshooting Frontend Issues

### Can't Connect to Backend?

1. **Check Environment Variable:**
   - Go to Vercel project → **Settings** → **Environment Variables**
   - Verify `VITE_API_URL` is set correctly
   - Make sure it matches your Railway URL exactly (no trailing slash)

2. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to **Console** tab
   - Look for errors like "Failed to fetch" or CORS errors

3. **Check Network Tab:**
   - Open browser DevTools → **Network** tab
   - Try voting or messaging
   - See if API calls are being made
   - Check the request URL

4. **CORS Issues:**
   - If you see CORS errors, the backend CORS is already set to allow all origins (`*`)
   - If still having issues, check Railway logs

---

## Quick Test Checklist

After deployment, test these:

- [ ] Backend health endpoint works: `https://your-railway-url/health`
- [ ] Backend API works: `https://your-railway-url/api/votes`
- [ ] Frontend loads: `https://your-vercel-url`
- [ ] Can vote for boy/girl
- [ ] Vote counts update
- [ ] Can submit a message
- [ ] Message appears in carousel
- [ ] Can clear own vote
- [ ] Can clear all messages

---

## Your Repository

**GitHub:** https://github.com/vc-sometimes/baby-registry

**Files to Check:**
- `server.js` - Backend server
- `package.json` - Dependencies and scripts
- `railway.json` - Railway configuration
- `vercel.json` - Vercel configuration

---

## Need More Help?

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Check logs** in both Railway and Vercel dashboards

