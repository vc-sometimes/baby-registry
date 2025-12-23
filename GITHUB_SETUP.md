# GitHub Repository Setup Guide

Your local repository is ready! Follow these steps to push it to GitHub.

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name:** `baby-registry-site` (or your preferred name)
   - **Description:** "Beautiful baby registry website with voting and messaging features"
   - **Visibility:** Choose Public or Private
   - **DO NOT** check "Initialize with README" (we already have one)
   - **DO NOT** add .gitignore or license (we already have them)
4. Click **"Create repository"**

## Step 2: Connect and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/baby-registry-site.git

# Rename branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

## Alternative: Using SSH

If you prefer SSH (and have it set up):

```bash
git remote add origin git@github.com:YOUR_USERNAME/baby-registry-site.git
git branch -M main
git push -u origin main
```

## Step 3: Verify

1. Go to your GitHub repository page
2. You should see all your files
3. Check that `votes.json` and `messages.json` are NOT in the repo (they're in .gitignore)

## What's Included

✅ All source code
✅ Configuration files (railway.json, vercel.json, etc.)
✅ Documentation (README.md, DEPLOYMENT.md, etc.)
✅ Images in public/images/
❌ node_modules (ignored)
❌ dist folder (ignored)
❌ votes.json and messages.json (ignored - these will be created on Railway)

## Next Steps After Pushing

Once your code is on GitHub:

1. **Deploy to Railway:**
   - Go to railway.app
   - New Project → Deploy from GitHub repo
   - Select your repository
   - Deploy!

2. **Deploy to Vercel:**
   - Go to vercel.com
   - Add New Project → Import from GitHub
   - Select your repository
   - Set `VITE_API_URL` environment variable
   - Deploy!

## Troubleshooting

**"Repository not found" error?**
- Check that you typed the repository name correctly
- Make sure you're authenticated: `gh auth login` or use GitHub Desktop

**"Permission denied" error?**
- Make sure you have write access to the repository
- Check your GitHub authentication

**Need to update later?**
```bash
git add .
git commit -m "Your commit message"
git push
```

---

**Ready to push?** Follow the steps above! 🚀

