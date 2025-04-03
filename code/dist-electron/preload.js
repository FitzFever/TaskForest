"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const api = {
  // 应用控制
  quit: () => electron.ipcRenderer.invoke("app:quit"),
  minimize: () => electron.ipcRenderer.invoke("app:minimize"),
  maximize: () => electron.ipcRenderer.invoke("app:maximize"),
  // 版本信息
  getVersion: () => electron.ipcRenderer.invoke("app:version"),
  // 系统状态
  getPlatform: () => process.platform,
  isDev: () => process.env.NODE_ENV === "development"
};
electron.contextBridge.exposeInMainWorld("electron", api);
exports.api = api;
