"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  // 获取应用版本
  getAppVersion: () => electron.ipcRenderer.invoke("get-app-version")
  // 任务相关方法将在后续实现
  // ...
};
electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
electron.contextBridge.exposeInMainWorld("api", api);
