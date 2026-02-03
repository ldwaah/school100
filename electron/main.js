const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;
let serverRef = null;

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    backgroundColor: '#0b1220',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Start the Express server on a free port and point the window to it.
  // Store uploads in a writable OS-specific directory (Electron userData).
  process.env.UPLOAD_BASE_DIR = path.join(app.getPath('userData'), 'uploads');
  process.env.PORT = '0';

  const { startServer } = require(path.join(__dirname, '..', 'server.js'));
  const { server, port } = await startServer({ port: 0, quiet: true });
  serverRef = server;

  await mainWindow.loadURL(`http://127.0.0.1:${port}/`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

app.whenReady().then(createMainWindow).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start Electron app:', err);
  app.quit();
});

app.on('before-quit', () => {
  try {
    if (serverRef) serverRef.close();
  } catch (_) {
    // ignore
  }
});


