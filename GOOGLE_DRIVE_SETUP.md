# Google Drive Integration Setup Guide (OAuth)

This guide will help you connect your School100 portal to Google Drive using OAuth authentication so that all student uploads automatically sync to your Google Drive folders.

## What You'll Need

- A Google account (the one that owns the Drive folders)
- About 5-10 minutes to complete setup
- Access to Google Cloud Console

---

## Step-by-Step Setup

### Step 1: Go to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your existing project **"My First Project"** (or whichever project you created)

### Step 2: Enable Google Drive API

1. Go to **"APIs & Services"** → **"Library"** (from the left menu)
2. Search for **"Google Drive API"**
3. Click on it, then click **"Enable"** (if not already enabled)

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have Google Workspace, then choose Internal)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: `School100`
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click **"Save and Continue"**
6. On the **Scopes** page: Click **"Save and Continue"** (no need to add scopes)
7. On the **Test users** page: Click **"Add Users"** and add your own email address
8. Click **"Save and Continue"**
9. Review and click **"Back to Dashboard"**

### Step 4: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Choose **"Desktop app"** as the Application type
4. Name it: `Student Work Uploader`
5. Click **"Create"**
6. Click **"Download JSON"** (or the download icon)
7. **Important**: Rename the downloaded file to `google-credentials.json`

### Step 5: Install the Credentials

1. Move `google-credentials.json` to your School100 folder:
   ```
   /path/to/School100/google-credentials.json
   ```

### Step 6: Authorize the Application

Now you need to give the app permission to access your Google Drive.

Open Terminal and run:

```bash
cd "/path/to/School100"
npm run authorize
```

This will:
1. Show you a URL - **copy it and open in your browser**
2. Sign in with your Google account (the one that owns the Drive folders)
3. Click **"Allow"** when asked for permissions
4. You'll see a code - **copy it**
5. Paste the code back into Terminal and press Enter

You should see:
```
✅ Authorization successful!
```

### Step 7: Start the Server

```bash
npm start
```

You should see:
```
✅ Google Drive integration enabled
☁️  Google Drive Integration: ENABLED
```

---

## How It Works Now

### For Students:
- **Nothing changes!** They upload exactly as before
- Files go straight to your Google Drive
- No Google account needed

### For You:
- Files automatically appear in your Drive folders (KS3/KS4/Resources)
- Access from anywhere (Drive mobile app, web, etc.)
- Automatic backup through Google
- You're using your own storage quota (not a service account)

---

## Troubleshooting

### "Service Account detected" error

**Cause:** You're using the old Service Account credentials

**Solution:**
1. Delete the current `google-credentials.json`
2. Follow Step 4 above to create **OAuth credentials** (Desktop app)
3. Download and use those instead

### "No authentication token found"

**Cause:** You haven't authorized the app yet

**Solution:**
Run `npm run authorize` as described in Step 6

### "Token expired"

**Cause:** Your authorization token has expired

**Solution:**
Run `npm run authorize` again to get a new token

### "Access denied" or "Permission denied"

**Cause:** The folder IDs in your `.env` file might be wrong, or you don't have access to those folders

**Solution:**
1. Check the `.env` file has the correct folder IDs
2. Make sure you're signed in with the Google account that owns the folders
3. When authorizing, use the same Google account that has the folders

### Can't access the authorization URL

**Cause:** App might be in "Testing" mode with restricted users

**Solution:**
1. Go to OAuth consent screen in Google Cloud Console
2. Make sure your email is added as a test user
3. Or publish the app (though testing mode is fine for personal use)

---

## Security Notes

✅ **DO:**
- Keep both `google-credentials.json` and `google-token.json` secure
- Only authorize on your own computer
- Regularly check what apps have access to your Google Drive

❌ **DON'T:**
- Never share these files
- Don't commit them to Git (they're in `.gitignore`)
- Don't authorize on public computers

---

## Re-authorization

If you ever need to re-authorize (e.g., token expired, different Google account):

1. Delete `google-token.json`
2. Run `npm run authorize` again
3. Follow the authorization steps

---

## Cost

✅ **Completely FREE!**
- Google Drive API has a generous free tier
- Uses your personal Google Drive storage
- No credit card required

---

**You're all set!** Once configured, your student portal will seamlessly sync all uploads to your Google Drive. 🎉
