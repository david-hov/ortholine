import { app, BrowserWindow } from 'electron';
import path from 'path';
import { config } from 'dotenv';
const { globalShortcut } = require('electron');

config();
declare const APP_WINDOW_WEBPACK_ENTRY: string;
declare const APP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow: BrowserWindow;
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#1f252c',
        show: false,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'assets/images/logo.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            preload: APP_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    mainWindow.loadURL(APP_WINDOW_WEBPACK_ENTRY);
    mainWindow.maximize();
    mainWindow.webContents.addListener('new-window', (event, url) => {
        event.preventDefault();
    });
    return mainWindow;
};

app.on('ready', async () => {
    var reload = () => {
        mainWindow.loadURL(APP_WINDOW_WEBPACK_ENTRY)
    }
    mainWindow = createWindow();
    globalShortcut.register('F5', reload);
    globalShortcut.register('CommandOrControl+R', reload);
    mainWindow.on('closed', () => {
        app.quit();
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});