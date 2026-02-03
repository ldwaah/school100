# Installing School100 on Multiple Computers

This guide helps you install School100 on each school laptop.

## What You'll Copy to Each Laptop

You need to copy these files/folders to each computer:
- The entire `School100` folder
- Including `google-credentials.json` and `google-token.json`

## One-Time Setup (First Time Only - Already Done!)

✅ You've already completed:
- Google Cloud project setup
- OAuth credentials
- Authorization
- Google Drive folder sharing

## Installing on Each New Laptop

### Step 1: Install Node.js (if not already installed)

1. Download from: https://nodejs.org/
2. Choose the **LTS version** (Long Term Support)
3. Run the installer
4. Click through all the defaults

### Step 2: Copy the Folder

1. Copy the entire `School100` folder to each laptop
2. Put it somewhere easy to find, like:
   - `/Applications/School100/`
   - Or the Desktop
   - Or a shared network drive

**IMPORTANT**: Make sure these files are included:
- `google-credentials.json` ✓
- `google-token.json` ✓
- All the other files

### Step 3: Install Dependencies (First Time on Each Laptop)

Open Terminal on the new laptop and run:

```bash
cd "/path/to/School100"
npm install
```

(Replace `/path/to/` with wherever you put the folder)

### Step 4: Start the Server

```bash
npm start
```

### Step 5: Students Access It

Students open their browser and go to:
```
http://localhost:3000
```

---

## Running Automatically When the Computer Starts

If you want the server to start automatically when the laptop boots up, see `AUTO_START_SETUP.md`

---

## How Multiple Laptops Work Together

- Each laptop runs independently
- Students on Laptop 1 go to `http://localhost:3000` on Laptop 1
- Students on Laptop 2 go to `http://localhost:3000` on Laptop 2
- All uploads from all laptops → Same Google Drive folders
- You see everything in one place in Google Drive

---

## Updating All Laptops

If you make changes to the portal (colors, text, etc.):

1. Update the files in one location
2. Copy the updated `public` folder to all laptops
3. Restart the servers on each laptop

---

## Troubleshooting

### "Port 3000 already in use"

**Solution**: Either:
- Stop any other Node servers running
- Or change the port in `.env` file to `PORT=3001` (or another number)

### "Google Drive integration disabled"

**Cause**: The credential files are missing

**Solution**: 
- Make sure `google-credentials.json` and `google-token.json` are in the folder
- Copy them from your working setup

### Token expired

**Cause**: The Google token expired (happens after ~7 days if not used)

**Solution**:
- On one computer, run `npm run authorize` again
- Copy the new `google-token.json` to all other laptops

---

## Security Note

⚠️ The `google-credentials.json` and `google-token.json` files give access to your Google Drive.

**Keep them secure:**
- Only install on trusted school computers
- Don't put them on public/shared drives
- Don't share them with students
- Set file permissions so students can't copy them

---

## Network Access (Optional)

If you want students on other devices (tablets, phones) to access a laptop's server:

1. Find the laptop's IP address (System Settings → Network)
2. Students go to: `http://LAPTOP-IP:3000`
3. Make sure they're on the same WiFi network

Example: `http://192.168.1.105:3000`

---

## Offline Mode

If internet goes down:
- The portal still works
- Uploads save locally first
- When internet returns, they sync to Google Drive automatically

---

You're all set! Each laptop becomes its own upload station, all feeding into your central Google Drive. 🎉




