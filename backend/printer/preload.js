const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electron', {
  printerApi: {
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    print: (options) => ipcRenderer.invoke('print', options)
  }
});