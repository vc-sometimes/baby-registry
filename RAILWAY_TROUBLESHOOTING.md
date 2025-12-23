# Railway Backend Troubleshooting

## Issue: 404 Error on API Routes

If you're getting 404 errors like `//api/votes`, here's how to fix it:

### Problem 1: Double Slash in URL

**Symptom:** Path shows `//api/votes` instead of `/api/votes`

**Fix:** 
- Make sure `VITE_API_URL` in Vercel does NOT have a trailing slash
- Should be: `https://your-app.up.railway.app`
- NOT: `https://your-app.up.railway.app/`

The code now automatically removes trailing slashes, but double-check your Vercel environment variable.

### Problem 2: Backend Routes Not Found (404)

**Check Railway Logs:**
1. Go to Railway project → **"Deployments"** tab
2. Click latest deployment → **"View Logs"**
3. Look for:
   - "Server running on port XXXX" ✅ (good)
   - Any error messages ❌ (bad)

**Verify Server is Running:**
- Railway should auto-detect `server.js` as the entry point
- Check that logs show: `Server running on port XXXX`

**Test Backend Directly:**
Visit these URLs in your browser (replace with your Railway URL):
- `https://your-railway-url/health` → Should show `{"status":"ok"}`
- `https://your-railway-url/` → Should show `{"message":"Baby Registry API Server","status":"running"}`
- `https://your-railway-url/api/votes` → Should show vote counts

### Problem 3: Railway Configuration

**Check railway.json:**
```json
{
  "deploy": {
    "startCommand": "node server.js"
  }
}
```

**Check Procfile:**
```
web: node server.js
```

**Check package.json:**
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### Problem 4: Port Configuration

Railway automatically sets the `PORT` environment variable. Your `server.js` should use:
```javascript
const PORT = process.env.PORT || 3001
```

This is already correct in your code.

### Problem 5: CORS Issues

If you see CORS errors in browser console:
- Your `server.js` already allows all origins (`origin: '*'`)
- If still having issues, check Railway logs for CORS errors

### Quick Fixes

1. **Redeploy Backend:**
   - Go to Railway → Your project
   - Click **"Redeploy"** button
   - Wait for deployment to complete

2. **Check Environment Variables:**
   - Railway: Usually no env vars needed (PORT is auto-set)
   - Vercel: Make sure `VITE_API_URL` is set correctly (no trailing slash!)

3. **Verify Files:**
   - `server.js` is in root directory ✅
   - `package.json` has `"start": "node server.js"` ✅
   - `railway.json` exists ✅

### Testing Checklist

After fixing, test:
- [ ] `https://your-railway-url/health` works
- [ ] `https://your-railway-url/api/votes` works (GET)
- [ ] `https://your-railway-url/api/votes` works (POST) - use Postman or curl
- [ ] `https://your-railway-url/api/messages` works (GET)
- [ ] Frontend can connect to backend

### Still Not Working?

1. **Check Railway Logs** - They'll show exactly what's wrong
2. **Verify Railway URL** - Make sure it's correct in Vercel env vars
3. **Test with curl:**
   ```bash
   curl https://your-railway-url/health
   curl https://your-railway-url/api/votes
   ```
4. **Contact Railway Support** - They can help debug deployment issues

