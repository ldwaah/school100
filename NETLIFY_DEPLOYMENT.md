# Netlify Deployment Guide for School100

This guide will help you deploy School100 to Netlify, making it accessible as a web application.

## Prerequisites

1. A Netlify account (free tier works fine)
2. Your Google Drive credentials (`google-credentials.json` and `google-token.json`)
3. Your Google Drive folder IDs (KS3, KS4, Resources)

## Step 1: Prepare Your Project

1. Make sure all your files are committed to Git (or ready to upload)
2. Ensure `netlify.toml` is in the root directory
3. Ensure `netlify/functions/` directory contains all function files

## Step 2: Set Up Environment Variables on Netlify

1. Go to your Netlify dashboard
2. Select your site (or create a new one)
3. Go to **Site settings** → **Environment variables**
4. Add the following variables:

### Required Environment Variables:

```
GOOGLE_CREDENTIALS
```
**Value**: Copy the entire contents of your `google-credentials.json` file (as a JSON string)

```
GOOGLE_TOKEN
```
**Value**: Copy the entire contents of your `google-token.json` file (as a JSON string)

```
KS3_FOLDER_ID
```
**Value**: Your KS3 Google Drive folder ID (e.g., `1p0RMviP3OxUHItAHinhJGRabScsjjVE9`)

```
KS4_FOLDER_ID
```
**Value**: Your KS4 Google Drive folder ID (e.g., `1xto97zR02qr7yqRbzm5dapczpuJBaq3N`)

```
RESOURCES_FOLDER_ID
```
**Value**: Your Resources Google Drive folder ID (e.g., `1sxDxp7wcwOh2fKBLIIgcLZ9RXko9ZTU4`)

### How to Get Your Folder IDs:

1. Open your Google Drive folder in a web browser
2. Look at the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
3. Copy the `FOLDER_ID_HERE` part

## Step 3: Deploy to Netlify

### Option A: Deploy via Git (Recommended)

1. Push your code to GitHub, GitLab, or Bitbucket
2. In Netlify, click **Add new site** → **Import an existing project**
3. Connect your Git provider and select your repository
4. Configure build settings:
   - **Build command**: Leave empty (or `npm install` if needed)
   - **Publish directory**: `public`
5. Click **Deploy site**

### Option B: Deploy via Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize and deploy:
   ```bash
   netlify init
   netlify deploy --prod
   ```

### Option C: Drag and Drop

1. Zip your project folder (excluding `node_modules`, `.env`, `uploads`, `dist`)
2. Go to Netlify dashboard
3. Drag and drop the zip file
4. Set environment variables in Site settings

## Step 4: Configure Build Settings

In Netlify dashboard → **Site settings** → **Build & deploy**:

- **Base directory**: (leave empty)
- **Build command**: (leave empty)
- **Publish directory**: `public`

## Step 5: Test Your Deployment

1. Once deployed, visit your Netlify URL (e.g., `https://your-site.netlify.app`)
2. Test uploading a file
3. Check that files appear in your Google Drive folders
4. Test the resources page

## Troubleshooting

### Files Not Uploading

- Check that environment variables are set correctly
- Verify Google Drive credentials are valid JSON strings
- Check Netlify Function logs: **Site settings** → **Functions** → View logs

### Resources Not Loading

- Ensure `public/resources-files/` directory is included in deployment
- Check that file paths are correct in `netlify.toml`

### CORS Errors

- The functions already include CORS headers
- If issues persist, check browser console for specific errors

### Function Timeout

- Netlify free tier has a 10-second function timeout
- Large file uploads might timeout - consider increasing file size limits or upgrading

## Updating Your Site

### Via Git:
- Push changes to your repository
- Netlify will automatically rebuild and deploy

### Via Netlify CLI:
```bash
netlify deploy --prod
```

## Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Add your custom domain
3. Follow DNS configuration instructions

## Notes

- **Local Development**: The app will still work locally with `npm start` (uses Express server)
- **Netlify Deployment**: Uses serverless functions instead of Express
- **File Storage**: Files go directly to Google Drive (no local storage on Netlify)
- **Environment Variables**: Keep these secure and never commit them to Git

## Support

If you encounter issues:
1. Check Netlify Function logs
2. Verify environment variables are set correctly
3. Test Google Drive API credentials locally first

