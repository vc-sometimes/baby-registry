# Quick Security Check

## Step 1: Check Your Vercel URL

1. Go to [vercel.com](https://vercel.com) → Your project
2. Click on any deployment
3. Copy the URL shown (should start with `https://`)
4. Make sure you're visiting that exact URL

## Step 2: Check Environment Variable

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Find `VITE_API_URL`
3. **Make sure it starts with `https://`** (NOT `http://`)
4. Should look like: `https://your-app.up.railway.app`
5. If it's `http://`, change it to `https://` and redeploy

## Step 3: Check Railway Backend

1. Go to Railway → Your project
2. Check the URL shown
3. Should be `https://your-app.up.railway.app`
4. Railway always uses HTTPS, so this should be fine

## Step 4: Test in Browser

1. Open your Vercel site
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Type: `window.location.protocol`
5. Should show: `"https:"`
6. If it shows `"http:"`, that's the problem!

## Step 5: Check for Mixed Content

1. In DevTools, go to **Network** tab
2. Refresh the page
3. Look for any resources with:
   - Red status (failed)
   - `http://` in the URL
4. All should be `https://` or relative URLs

## Common Fixes

### If VITE_API_URL is HTTP:
1. Go to Vercel → Settings → Environment Variables
2. Edit `VITE_API_URL`
3. Change `http://` to `https://`
4. Save
5. Go to Deployments → Redeploy

### If you're accessing via HTTP:
- Just change `http://` to `https://` in your browser
- Vercel should redirect automatically, but sometimes you need to manually use HTTPS

### If SSL certificate isn't ready:
- Wait 5-15 minutes after deployment
- Refresh the page
- Try incognito mode

## Still Not Working?

Share:
1. Your Vercel URL
2. What the browser shows (screenshot if possible)
3. Any console errors (F12 → Console)

