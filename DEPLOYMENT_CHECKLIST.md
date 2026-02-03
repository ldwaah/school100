# Netlify Deployment Checklist

## Pre-Deployment Checks

### ✅ 1. Files Are Ready
- [ ] All code is committed to Git
- [ ] `netlify.toml` is in root directory
- [ ] `public/` directory contains all static files
- [ ] `netlify/functions/` contains all function files

### ✅ 2. Build Test (Run Locally)
```bash
npm install
npm run generate-manifest
```
Should complete without errors and create `public/resources-manifest.json`

### ✅ 3. Environment Variables Ready
Have these values ready:
- [ ] `GOOGLE_CREDENTIALS` - Full JSON content from `google-credentials.json`
- [ ] `GOOGLE_TOKEN` - Full JSON content from `google-token.json`
- [ ] `KS3_FOLDER_ID` - Your KS3 Google Drive folder ID
- [ ] `KS4_FOLDER_ID` - Your KS4 Google Drive folder ID
- [ ] `RESOURCES_FOLDER_ID` - Your Resources Google Drive folder ID

## Deployment Steps

### Option A: Git Deployment (Recommended)

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider
   - Select your repository

3. **Configure Build Settings**
   - Build command: `npm install && npm run generate-manifest`
   - Publish directory: `public`
   - Base directory: (leave empty)

4. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add all 5 variables listed above
   - **Important**: For JSON values, paste the ENTIRE file content as a single-line string

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

### Option B: Drag & Drop Deployment

1. **Prepare Folder**
   - Create a ZIP of your project
   - **EXCLUDE**: `node_modules/`, `dist/`, `uploads/`, `.env`, `google-credentials.json`, `google-token.json`

2. **Upload to Netlify**
   - Go to https://app.netlify.com
   - Drag and drop your ZIP file
   - Wait for upload

3. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add all 5 variables

4. **Configure Build Settings**
   - Site settings → Build & deploy
   - Build command: `npm install && npm run generate-manifest`
   - Publish directory: `public`

5. **Deploy**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

## Post-Deployment Verification

### ✅ Test These Features

1. **Homepage Loads**
   - Visit your Netlify URL
   - Should see the School100 homepage

2. **File Upload Works**
   - Click "Upload KS3 Work" or "Upload KS4 Work"
   - Fill in the form and upload a test file
   - Should see success message
   - Check Google Drive to verify file appears

3. **Resources Page Works**
   - Click "View 100% Resources"
   - Should see list of resources by year group
   - Should be able to open resource files

## Common Issues & Solutions

### ❌ Build Fails: "Cannot find module"
**Solution**: Make sure `npm install` runs in build command. The build command should be: `npm install && npm run generate-manifest`

### ❌ Functions Return 500 Error
**Solution**: 
- Check environment variables are set correctly
- Verify JSON values are valid (use a JSON validator)
- Check Netlify Function logs: Site settings → Functions → View logs

### ❌ Upload Fails: "Google Drive not configured"
**Solution**: 
- Verify `GOOGLE_CREDENTIALS` and `GOOGLE_TOKEN` environment variables are set
- Make sure JSON values are complete (entire file content)
- Check that credentials haven't expired

### ❌ Resources Not Loading
**Solution**:
- Verify `public/resources-files/` directory is included in deployment
- Check that `resources-manifest.json` was generated (should appear in Deploys → Published files)
- Verify file paths in browser console

### ❌ CORS Errors
**Solution**: Functions already include CORS headers. If issues persist:
- Check browser console for specific error
- Verify function is being called correctly
- Check Netlify Function logs

## Getting Help

If deployment still fails:

1. **Check Build Logs**
   - Go to Deploys tab
   - Click on the failed deploy
   - Review the build log for errors

2. **Check Function Logs**
   - Site settings → Functions
   - Click on a function
   - View logs for runtime errors

3. **Test Locally First**
   - Run `npm start` locally
   - Test all features work
   - Fix any issues before deploying

4. **Verify Environment Variables**
   - Double-check all 5 variables are set
   - Verify JSON values are valid
   - Test credentials work locally

