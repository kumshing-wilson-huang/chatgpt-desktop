/**
 * 在preload.js文件中编写预加载代码（如果需要，可以为空文件）：
 */
const { contextBridge, ipcRenderer } = require('electron');
console.log("Preload script loaded.");

contextBridge.exposeInMainWorld('electron', {
    requestLocale: () => {
        // console.log("Requesting locale...");
        ipcRenderer.send('request-locale');
    },
    onSetLocale: (callback) => {
        // console.log("Setting up locale listener...");
        ipcRenderer.on('set-locale', (event, localeData) => {
            // console.log("Locale data received in preload:", localeData);
            callback(localeData);
        });
    }
});