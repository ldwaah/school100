# Quick Deploy to Netlify - Just Upload!

## 🚀 3 Simple Steps

### 1️⃣ Upload Folder
- Go to https://app.netlify.com
- Drag your **School100** folder onto the page
- Wait for upload

### 2️⃣ Set Environment Variables
In Netlify dashboard → **Site settings** → **Environment variables**, add:

| Variable Name | Value |
|--------------|-------|
| `GOOGLE_CREDENTIALS` | Copy entire contents of `google-credentials.json` |
| `GOOGLE_TOKEN` | Copy entire contents of `google-token.json` |
| `KS3_FOLDER_ID` | Your KS3 Google Drive folder ID |
| `KS4_FOLDER_ID` | Your KS4 Google Drive folder ID |
| `RESOURCES_FOLDER_ID` | Your Resources Google Drive folder ID |

### 3️⃣ Configure & Deploy
- **Site settings** → **Build & deploy**
- Set **Publish directory**: `public`
- **Deploys** tab → Click **"Deploy site"**

## ✅ Done!
Your app will be live at: `https://your-site-name.netlify.app`

---

**Note:** You can exclude `node_modules`, `dist`, and `uploads` folders before uploading (they're not needed).

