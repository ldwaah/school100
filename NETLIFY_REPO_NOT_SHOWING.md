# Repository Not Appearing in Netlify - Troubleshooting Guide

## Quick Fixes (Try These First)

### 1. **Search for Your Repository**
- In Netlify, when you see the repository list, use the **search box** at the top
- Type: `school100` or `ldwaah/school100`
- Sometimes repositories don't show in the default list but can be found by searching

### 2. **Refresh the Page**
- Click the refresh button or press `F5` / `Cmd+R`
- Sometimes the list needs to reload

### 3. **Check Repository Visibility**
- Go to https://github.com/ldwaah/school100
- Make sure the repository exists and you can access it
- If it's private, Netlify needs permission to access it

## Step-by-Step Solution

### Option A: Re-authorize GitHub Connection

1. **In Netlify Dashboard:**
   - Go to **User settings** (click your profile icon)
   - Click **Connected accounts** or **GitHub**
   - Click **Disconnect** next to GitHub
   - Then click **Connect to GitHub** again
   - Authorize Netlify to access your repositories

2. **Grant Repository Access:**
   - When authorizing, make sure to grant access to:
     - ✅ All repositories, OR
     - ✅ Specific repositories (select `school100`)

3. **Try Again:**
   - Go back to "Add new site" → "Import an existing project"
   - Your repository should now appear

### Option B: Install Netlify GitHub App

1. **Go to GitHub:**
   - Visit: https://github.com/settings/installations
   - Or go to your repository → Settings → Integrations → Applications

2. **Find Netlify:**
   - Look for "Netlify" in the list
   - If it's not installed, you'll need to install it

3. **Grant Permissions:**
   - Click "Configure" next to Netlify
   - Select "All repositories" or just `school100`
   - Grant necessary permissions

### Option C: Manual Repository Selection

1. **In Netlify:**
   - Click "Add new site" → "Import an existing project"
   - Click "GitHub" to connect
   - If you see a search box, type: `ldwaah/school100`
   - Or scroll through the list more carefully

2. **Check Filters:**
   - Make sure no filters are applied (like "Only show repositories with deployments")
   - Check if there's a "Show all" or "Load more" button

### Option D: Use Repository URL Directly

1. **In Netlify:**
   - Click "Add new site" → "Import an existing project"
   - Look for an option to "Enter repository URL" or "Paste repository URL"
   - Enter: `https://github.com/ldwaah/school100`

## Alternative: Deploy via Netlify CLI

If the web interface isn't working, you can deploy using the command line:

```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
# Follow the prompts to connect your repository

# Deploy to production
netlify deploy --prod
```

## Alternative: Drag & Drop Deployment

If connecting GitHub isn't working, you can deploy without Git:

1. **Prepare Your Project:**
   - Create a ZIP file of your project
   - **EXCLUDE**: `node_modules/`, `dist/`, `uploads/`, `.env`, `google-credentials.json`, `google-token.json`

2. **Deploy:**
   - Go to https://app.netlify.com
   - Drag and drop your ZIP file
   - Set environment variables in Site settings
   - Configure build settings

## Verify Your Repository

Make sure your repository is:
- ✅ Accessible at: https://github.com/ldwaah/school100
- ✅ You have admin/push access to it
- ✅ It's not archived or disabled
- ✅ It contains your code (check the main branch)

## Still Not Working?

1. **Check Netlify Status:**
   - Visit: https://www.netlifystatus.com
   - Make sure there are no service issues

2. **Try Different Browser:**
   - Sometimes browser extensions or cache can cause issues
   - Try an incognito/private window

3. **Contact Support:**
   - Netlify support: https://www.netlify.com/support
   - Include your repository URL and what you've tried

## Quick Checklist

- [ ] Repository exists and is accessible on GitHub
- [ ] You're logged into the correct GitHub account
- [ ] Netlify has permission to access your repositories
- [ ] You've tried searching for the repository name
- [ ] You've refreshed the page
- [ ] You've tried re-authorizing GitHub connection

