/**
 * 在preload.js文件中编写预加载代码（如果需要，可以为空文件）：
 */
const { contextBridge, ipcRenderer } = require('electron');
console.log("Preload script loaded.");


// 通过 contextBridge 将 IPC 方法暴露给渲染进程
contextBridge.exposeInMainWorld('electron', {
    // 请求语言包
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
    },
    /**
     * 自定义提示框
     * @param options
     * @returns {*}
     */
    showCustomDialog: (options) => ipcRenderer.send('show-custom-dialog', options),
    /**
     * 设置代理配置
     * @param configs
     * @param callback
     */
    saveProxyConfigs: (configs, callback) => {
        // 告诉主进程保存代理
        ipcRenderer.send('save-proxy-configs', configs);
        // 当主进程保存成功返回执行一个callback
        ipcRenderer.on('save-configs', (configs) => {
            callback(configs);
        });
    },
    /**
     * 获取APP版本
     *
     * @returns {Promise<string>}
     */
    getAppVersion: async () => {
        const appVersion = await ipcRenderer.invoke('get-app-version');
        //console.log(`App version: ${appVersion}`);
        return ('Version: ' + appVersion);
    }
});
