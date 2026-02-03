# School100 - EvolveOne

A self-hosted student work upload portal with no external dependencies like Google Drive. Students can upload their work directly without needing any account or sign-in.

## Features

✅ **No Sign-In Required** - Students just enter their name and upload  
✅ **Organised by Key Stage** - Separate folders for KS3 and KS4 uploads  
✅ **Drag & Drop Support** - Modern, intuitive file upload interface  
✅ **File Size Limits** - 50MB maximum per file to prevent abuse  
✅ **Multiple File Types** - Accepts PDFs, Word, PowerPoint, Excel, images, and text files  
✅ **Resources Section** - Teachers can share materials with students  
✅ **Fully Responsive** - Works on desktops, tablets, and mobile devices  

## Quick Start

### Step 1: Install Node.js

If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/) (choose the LTS version).

### Step 2: Install Dependencies

Open your terminal, navigate to this folder, and run:

```bash
npm install
```

### Step 3: Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## Desktop App (Windows + Mac) - Electron (Optional)

If you want this to be a **normal app** students can install (no Cursor, no Node required), you can package it with Electron.

### 1) Install dependencies (one-time on the build machine)

```bash
npm install
```

### 2) Run the desktop app locally (for testing)

```bash
npm run electron
```

### 3) Build installers

- **On a Mac** (builds a `.dmg`):

```bash
npm run dist
```

- **On Windows** (builds a `.exe` installer):

```bash
npm run dist
```

Outputs are created in the `dist/` folder.

> Note: you typically build the Windows installer on Windows, and the Mac installer on a Mac.

## Sharing as a ZIP (students download → unzip → launch)

If you want students to **download a zip** and then **launch the app with a click**, use the ZIP build outputs in `dist/`.

### What you share

- **Mac students**: share the **`.zip`** file from `dist/` (it contains `School100.app`)
- **Windows students**: share the **`.zip`** file from `dist/` (it contains the portable app)

### What students do

1. Download the zip
2. Unzip it
3. Launch:
   - **Mac**: open `School100.app`
   - **Windows**: run the app `.exe` inside the unzipped folder

> Note: if Windows SmartScreen or macOS Gatekeeper blocks the first run, that’s normal for unsigned apps.

### Step 4: Access the Portal

Open your web browser and visit:
- `http://localhost:3000` - For students on the same computer
- `http://YOUR-IP-ADDRESS:3000` - For students on other devices on the same network

To find your IP address:
- **Mac**: System Preferences → Network → Your connection → Look for "IP Address"
- **Windows**: Open Command Prompt and type `ipconfig`, look for "IPv4 Address"

## File Structure

```
School100/
├── server.js              # Backend server
├── package.json           # Dependencies
├── public/               # Frontend files
│   ├── index.html        # Main page
│   ├── styles.css        # Styling
│   └── app.js            # Client-side JavaScript
└── uploads/              # Uploaded files (created automatically)
    ├── ks3/              # KS3 student uploads
    ├── ks4/              # KS4 student uploads
    └── resources/        # Shared resources
```

## How Students Use It

1. **Choose their Key Stage** - Click KS3 or KS4 button
2. **Enter their name** - So you can identify their work
3. **Upload their file** - Either drag & drop or click to browse
4. **Submit** - File is automatically organised into the correct folder

## How Teachers Use It

### Adding Resources

To share resources with students:
1. Place files directly in the `uploads/resources/` folder
2. Students can view and download them through the "King Trust Resources" section

### Accessing Uploaded Work

Student uploads are stored in:
- `uploads/ks3/` - For KS3 student work
- `uploads/ks4/` - For KS4 student work

Files are named: `timestamp-studentname-filename.ext`

For example: `1737379200000-john_smith-geography_project.pdf`

## Running on School Network

### Option 1: Single Computer Access
Run the server on one computer and have students access it via that computer's IP address on your local network.

### Option 2: Dedicated Server (Recommended)
For a permanent solution:
1. Set up a dedicated computer or Raspberry Pi as a server
2. Configure it to run the application on startup
3. Give students a simple URL or bookmark to access it

### Security Considerations

- This is designed for **local network use only** (within your school)
- Do NOT expose this directly to the internet without additional security measures
- Consider adding password protection if needed
- Regularly back up the `uploads/` folder
- Set up automatic file size monitoring to prevent storage issues

## Customisation

### Change the Port

Edit `server.js` and change:
```javascript
const PORT = 3000;
```

### Adjust File Size Limit

Edit `server.js` and modify:
```javascript
limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
}
```

### Add More File Types

Edit the `allowedTypes` array in `server.js`:
```javascript
const allowedTypes = [
    'image/jpeg',
    'application/pdf',
    // Add more MIME types here
];
```

## Troubleshooting

**Students can't access the portal from other devices:**
- Check that all devices are on the same network
- Verify the firewall isn't blocking port 3000
- Make sure you're using the correct IP address

**File uploads failing:**
- Check available disk space
- Verify file size is under 50MB
- Ensure the file type is supported

**Server won't start:**
- Make sure Node.js is installed correctly
- Try running `npm install` again
- Check if port 3000 is already in use

## Support

For issues or questions:
- Check the `uploads/` folder permissions
- Review the terminal output for error messages
- Ensure all dependencies are installed

---

© 2026 EvolveOne Education




