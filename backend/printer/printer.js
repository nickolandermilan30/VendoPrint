const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const electronPrinter = require('electron-printer');

let mainWindow;

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, 
    },
  });


  mainWindow.loadURL('http://localhost:5173'); 

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle application ready event
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Handle window-all-closed event
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handler to get available printers
ipcMain.handle('get-printers', async () => {
  try {
    // Get the list of available printers
    const printers = electronPrinter.getPrinters();
    return printers;
  } catch (error) {
    console.error('Error fetching printers:', error);
    return [];
  }
});

// IPC handler for printing a file
ipcMain.handle('print-file', async (event, filePath) => {
  try {
    const printJob = electronPrinter.print(filePath, { printer: 'yourPrinterName' });
    return printJob;
  } catch (error) {
    console.error('Error printing file:', error);
    return { success: false, error: error.message };
  }
});
