const { BrowserWindow, session } = require('electron');
const Store = require('electron-store');
const store = new Store();
let setProxyWindow = null;

function createSetProxyWindow() {
    const windowStatus = (global.CONFIGS.IS_DEV ? true : false);
    setProxyWindow = new BrowserWindow({
        width: 500,
        height: 300,
        title: 'Set Proxy',
        icon: global.CONFIGS.iconPath, // 设置图标
        resizable: windowStatus,  // 禁止调整窗口大小
        minimizable: windowStatus, // 禁止最小化
        maximizable: windowStatus, // 禁止最大化
        autoHideMenuBar: true, // 这里设置为 true 来隐藏菜单栏
        webPreferences: {
            preload: global.CONFIGS.preload,
            nodeIntegration: true,
            contextIsolation: true,
            webviewTag: true,
            devTools: (global.CONFIGS.IS_DEV ? true : false)
        }
    });

    // 打开开发者工具
    if (global.CONFIGS.IS_DEV) {
        setProxyWindow.webContents.openDevTools();
    }

    setProxyWindow.loadFile('./src/setProxy.html');

    // 设置本地存储的例子
    setProxyWindow.webContents.on('did-finish-load', () => {
        let proxyConfig = store.get('proxyConfig');
        proxyConfig = JSON.stringify(proxyConfig);
        // console.log(proxyConfig)
        const script = `
            localStorage.setItem('Proxy', '${proxyConfig}');
        `;
        setProxyWindow.webContents.executeJavaScript(script).then(() => {
            console.log('LocalStorage set for setProxy.html');
        }).catch((error) => {
            console.error('Error setting LocalStorage for setProxy.html:', error);
        });
    });

    return setProxyWindow;
}

// 设置代理配置
async function setProxyConfig(proxyConfig) {
    const { proxyType, proxyUrl, proxyPort, proxyDomain, proxyUsername, proxyPassword } = proxyConfig;
    let proxyRules;

    // 处理不同类型的代理
    if (proxyType === 'socks5' || proxyType === 'socks4') {
        proxyRules = `${proxyType}://${proxyUrl}:${proxyPort}`;
    } else {
        proxyRules = `${proxyType}=${proxyUrl}:${proxyPort};https=${proxyUrl}:${proxyPort}`;
    }

    const proxyCredentials = proxyUsername && proxyPassword ? `${proxyUsername}:${proxyPassword}` : null;

    // 设置代理
    await session.defaultSession.setProxy({
        proxyRules,
        proxyBypassRules: '<-loopback>'
    });

    // 如果代理需要认证
    if (proxyCredentials) {
        session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
            details.requestHeaders['Proxy-Authorization'] = 'Basic ' + Buffer.from(proxyCredentials).toString('base64');
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });
    }

    // 设置完后关闭设置窗口并刷新主窗口webview
    if (setProxyWindow) {
        setProxyWindow.close();
        global.CONFIGS.mainWindow && global.CONFIGS.mainWindow.webContents.reload();
    }
}

module.exports = { createSetProxyWindow, setProxyConfig };
