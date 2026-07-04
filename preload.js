const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  platform: process.platform,
  version: '2.0.0',

  // Updates
  checkUpdates: () => ipcRenderer.invoke('check-updates'),

  // Logs
  getLogs: () => ipcRenderer.invoke('get-logs'),
  openLogsFolder: () => ipcRenderer.invoke('open-logs-folder'),

  // Error reporting
  sendErrorReport: (data) => ipcRenderer.invoke('send-error-report', data),

  // Print
  print: () => ipcRenderer.invoke('print'),

  // Version
  getVersion: () => ipcRenderer.invoke('get-version'),
})
