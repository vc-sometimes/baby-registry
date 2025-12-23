# Deployment Checklist ✅

Use this checklist to ensure everything is ready for deployment.

## Pre-Deployment Checks

### Code Quality
- [x] Build succeeds locally (`npm run build`)
- [x] No hardcoded localhost URLs in production code
- [x] Environment variables properly configured
- [x] CORS configured for production
- [x] Error handling in place
- [x] JSON files in .gitignore (votes.json, messages.json)

### Configuration Files
- [x] `package.json` has correct start script
- [x] `railway.json` configured
- [x] `Procfile` exists for Railway
- [x] `vercel.json` configured for frontend
- [x] `.gitignore` excludes sensitive files

### Backend (Railway)
- [ ] Railway account created
- [ ] GitHub repo connected to Railway
- [ ] Backend deployed successfully
- [ ] Backend URL copied (e.g., `https://your-app.up.railway.app`)
- [ ] Health check works: `https://your-backend-url/health`
- [ ] API endpoints testable:
  - [ ] `GET /api/votes` returns vote counts
  - [ ] `GET /api/messages` returns messages array
  - [ ] `POST /api/votes` accepts votes
  - [ ] `POST /api/messages` accepts messages

### Frontend (Vercel)
- [ ] Vercel account created
- [ ] GitHub repo connected to Vercel
- [ ] Environment variable set: `VITE_API_URL` = your Railway backend URL
- [ ] Frontend deployed successfully
- [ ] Frontend URL accessible (e.g., `https://your-project.vercel.app`)

### Testing
- [ ] Visit frontend URL
- [ ] Test gender voting:
  - [ ] Can vote for boy
  - [ ] Can vote for girl
  - [ ] Vote counts update correctly
  - [ ] Can clear own vote
- [ ] Test messaging:
  - [ ] Can submit a message
  - [ ] Message appears in carousel
  - [ ] Carousel scrolls continuously
  - [ ] Can clear all messages (admin function)
- [ ] Test all sections:
  - [ ] Header navigation works
  - [ ] Hero section displays
  - [ ] Our Story section displays
  - [ ] Baby Journey section displays
  - [ ] Registries section displays
  - [ ] Footer displays

### Production Readiness
- [ ] CORS allows your Vercel domain
- [ ] No console errors in browser
- [ ] No network errors in browser console
- [ ] Images load correctly
- [ ] Responsive design works on mobile
- [ ] All links work correctly

## Post-Deployment

### Share Your Site
- [ ] Share Vercel URL with friends/family
- [ ] Test from different devices
- [ ] Test from different networks

### Monitoring
- [ ] Check Railway logs for errors
- [ ] Check Vercel logs for build errors
- [ ] Monitor API usage (if needed)

### Optional Enhancements
- [ ] Add custom domain
- [ ] Set up analytics (if desired)
- [ ] Set up error tracking (if desired)

## Troubleshooting Quick Reference

**Backend not starting?**
- Check Railway logs
- Verify `node server.js` works locally
- Check PORT environment variable

**Frontend can't connect to backend?**
- Verify `VITE_API_URL` is set in Vercel
- Check CORS settings in server.js
- Test backend URL directly in browser

**Votes/messages not saving?**
- Check Railway file system (votes.json, messages.json)
- Check Railway logs for errors
- Verify file permissions

**Build fails?**
- Check Vercel build logs
- Verify all dependencies in package.json
- Try building locally: `npm run build`

## Quick Deploy Commands

### Test Locally First
```bash
# Test backend
npm run dev:server

# Test frontend
npm run dev:client

# Test build
npm run build
npm run preview
```

### Deploy
1. Push code to GitHub
2. Railway auto-deploys backend
3. Vercel auto-deploys frontend (after setting env var)

---

**Ready to deploy?** Follow the steps in `DEPLOYMENT.md`!

