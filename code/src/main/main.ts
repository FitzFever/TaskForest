import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 加载应用
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // 打开开发者工具
  if (is.dev) {
    mainWindow.webContents.openDevTools();
  }

  // 当窗口准备好时显示
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });
}

// 当 Electron 完成初始化时创建窗口
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 设置应用协议
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('taskforest', process.execPath, [
      join(__dirname, process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient('taskforest');
}

// IPC 通信处理
ipcMain.handle('app:quit', () => {
  app.quit();
});

ipcMain.handle('app:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('app:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.restore();
  } else {
    mainWindow?.maximize();
  }
}); 