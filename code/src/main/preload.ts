import { contextBridge, ipcRenderer } from 'electron';

// 暴露给渲染进程的 API
export const api = {
  // 应用控制
  quit: () => ipcRenderer.invoke('app:quit'),
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),

  // 版本信息
  getVersion: () => ipcRenderer.invoke('app:version'),

  // 系统状态
  getPlatform: () => process.platform,
  isDev: () => process.env.NODE_ENV === 'development',
};

// 使用 contextBridge 暴露 API
contextBridge.exposeInMainWorld('electron', api); 