const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectNextjsFolder: () => ipcRenderer.invoke('select-nextjs-folder'),
  convertNextjsToApk: (folderPath) => ipcRenderer.invoke('convert-nextjs-to-apk', folderPath),
  onConversionStatus: (callback) => ipcRenderer.on('conversion-status', callback),
  checkRequirements: () => ipcRenderer.invoke('check-requirements'),
  signApk: (params) => ipcRenderer.invoke('sign-apk', params)
});
