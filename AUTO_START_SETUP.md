# Auto-Start Setup for macOS

This guide helps you set up School100 to start automatically when the computer boots up.

## Option 1: Simple Launch Agent (Recommended)

### Step 1: Create a startup script

Create a file called `start-server.sh` in your School100 folder:

```bash
#!/bin/bash
cd "/path/to/School100"
npm start
```

(Replace `/path/to/` with the actual path)

### Step 2: Make it executable

```bash
chmod +x start-server.sh
```

### Step 3: Add to Login Items

1. Open **System Settings** → **General** → **Login Items**
2. Click the **+** button under "Open at Login"
3. Navigate to `start-server.sh` and add it

## Option 2: Using launchd (More Advanced)

Create a file: `~/Library/LaunchAgents/com.evolveone.studentworkarea.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.evolveone.studentworkarea</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/path/to/School100/server.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>/path/to/School100</string>
    <key>StandardOutPath</key>
    <string>/tmp/studentworkarea.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/studentworkarea.error.log</string>
</dict>
</plist>
```

Load it:
```bash
launchctl load ~/Library/LaunchAgents/com.evolveone.studentworkarea.plist
```

## Option 3: Simple Login Script

1. Open **Automator**
2. Choose **Application**
3. Add action: **Run Shell Script**
4. Paste:
   ```bash
   cd "/path/to/School100"
   npm start
   ```
5. Save as "Start Student Portal"
6. Add to Login Items (System Settings → Login Items)

---

## Testing

After setup, restart the computer and check:
1. The server starts automatically
2. Go to http://localhost:3000
3. Should see the upload portal

---

## Stopping Auto-Start

If you need to disable it:

**Option 1**: System Settings → Login Items → Remove the item

**Option 2 (launchd)**: 
```bash
launchctl unload ~/Library/LaunchAgents/com.evolveone.studentworkarea.plist
```

---

This ensures the portal is always ready when students need it! 🚀




