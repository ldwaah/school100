# How to Push School100 to GitHub

## Step 1: Create GitHub Repository

1. Go to https://github.com
2. Sign in (or create account)
3. Click the **+** icon (top right) → **New repository**
4. Repository name: `School100` (or any name you like)
5. Description: "Student work upload portal"
6. Choose **Public** or **Private**
7. **DO NOT** check "Initialize with README" (we already have files)
8. Click **Create repository**

## Step 2: Copy Repository URL

After creating, GitHub will show you a page with commands. 
**Copy the repository URL** - it looks like:
- `https://github.com/yourusername/School100.git`

## Step 3: Open Terminal and Navigate to Folder

Open Terminal (Applications → Utilities → Terminal) and run:

```bash
cd /Users/lloyddwaah/Desktop/School100
```

## Step 4: Initialize Git and Push

Run these commands one by one (replace YOUR_USERNAME with your GitHub username):

```bash
# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - School100 app with all resources"

# Add GitHub remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/School100.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** GitHub will ask for your username and password. 
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your GitHub password)

## Step 5: Create Personal Access Token (if needed)

If GitHub asks for a password:

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token (classic)**
3. Name it: "Netlify Deploy"
4. Check **repo** (full control of private repositories)
5. Click **Generate token**
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

## Step 6: Connect to Netlify

1. Go to https://app.netlify.com
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub**
4. Authorize Netlify to access GitHub
5. Select your **School100** repository
6. Configure:
   - Build command: `npm run generate-manifest`
   - Publish directory: `public`
7. Click **Deploy site**

Done! Your site will deploy automatically whenever you push to GitHub.

