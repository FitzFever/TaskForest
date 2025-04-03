"use strict";
const require$$0 = require("electron");
const path = require("path");
var dist = {};
Object.defineProperty(dist, "__esModule", { value: true });
var electron = require$$0;
const is = {
  dev: !electron.app.isPackaged
};
const platform = {
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
};
const electronApp = {
  setAppUserModelId(id) {
    if (platform.isWindows)
      electron.app.setAppUserModelId(is.dev ? process.execPath : id);
  },
  setAutoLaunch(auto) {
    if (platform.isLinux)
      return false;
    const isOpenAtLogin = () => {
      return electron.app.getLoginItemSettings().openAtLogin;
    };
    if (isOpenAtLogin() !== auto) {
      electron.app.setLoginItemSettings({
        openAtLogin: auto,
        path: process.execPath
      });
      return isOpenAtLogin() === auto;
    } else {
      return true;
    }
  },
  skipProxy() {
    return electron.session.defaultSession.setProxy({ mode: "direct" });
  }
};
let listeners = [];
let handlers = [];
const ipcHelper = {
  handle(channel, listener) {
    handlers.push(channel);
    electron.ipcMain.handle(channel, listener);
  },
  on(channel, listener) {
    listeners.push(channel);
    electron.ipcMain.on(channel, listener);
    return this;
  },
  removeAllListeners() {
    listeners.forEach((c) => electron.ipcMain.removeAllListeners(c));
    listeners = [];
    return this;
  },
  removeAllHandlers() {
    handlers.forEach((c) => electron.ipcMain.removeHandler(c));
    handlers = [];
  },
  removeListeners(channels) {
    channels.forEach((c) => electron.ipcMain.removeAllListeners(c));
    return this;
  },
  removeHandlers(channels) {
    channels.forEach((c) => electron.ipcMain.removeHandler(c));
  }
};
const optimizer = {
  watchWindowShortcuts(window, shortcutOptions) {
    if (!window)
      return;
    const { webContents } = window;
    const { escToCloseWindow = false, zoom = false } = shortcutOptions || {};
    webContents.on("before-input-event", (event, input) => {
      if (input.type === "keyDown") {
        if (!is.dev) {
          if (input.key === "r" && (input.control || input.meta))
            event.preventDefault();
        } else {
          if (input.code === "F12") {
            if (webContents.isDevToolsOpened()) {
              webContents.closeDevTools();
            } else {
              webContents.openDevTools({ mode: "undocked" });
              console.log("Open dev tool...");
            }
          }
        }
        if (escToCloseWindow) {
          if (input.code === "Escape" && input.key !== "Process") {
            window.close();
            event.preventDefault();
          }
        }
        if (!zoom) {
          if (input.code === "Minus" && (input.control || input.meta))
            event.preventDefault();
          if (input.code === "Equal" && input.shift && (input.control || input.meta))
            event.preventDefault();
        }
      }
    });
  },
  registerFramelessWindowIpc() {
    electron.ipcMain.on("win:invoke", (event, action) => {
      const win = electron.BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (action === "show") {
          win.show();
        } else if (action === "showInactive") {
          win.showInactive();
        } else if (action === "min") {
          win.minimize();
        } else if (action === "max") {
          const isMaximized = win.isMaximized();
          if (isMaximized) {
            win.unmaximize();
          } else {
            win.maximize();
          }
        } else if (action === "close") {
          win.close();
        }
      }
    });
  }
};
dist.electronApp = electronApp;
dist.ipcHelper = ipcHelper;
var is_1 = dist.is = is;
dist.optimizer = optimizer;
dist.platform = platform;
let mainWindow = null;
function createWindow() {
  mainWindow = new require$$0.BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (is_1.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  if (is_1.dev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on("ready-to-show", () => {
    mainWindow == null ? void 0 : mainWindow.show();
  });
}
require$$0.app.whenReady().then(() => {
  createWindow();
  require$$0.app.on("activate", () => {
    if (require$$0.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
require$$0.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    require$$0.app.quit();
  }
});
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    require$$0.app.setAsDefaultProtocolClient("taskforest", process.execPath, [
      path.join(__dirname, process.argv[1])
    ]);
  }
} else {
  require$$0.app.setAsDefaultProtocolClient("taskforest");
}
require$$0.ipcMain.handle("app:quit", () => {
  require$$0.app.quit();
});
require$$0.ipcMain.handle("app:minimize", () => {
  mainWindow == null ? void 0 : mainWindow.minimize();
});
require$$0.ipcMain.handle("app:maximize", () => {
  if (mainWindow == null ? void 0 : mainWindow.isMaximized()) {
    mainWindow.restore();
  } else {
    mainWindow == null ? void 0 : mainWindow.maximize();
  }
});
