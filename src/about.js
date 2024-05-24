/**
 * 关于我们界面
 */
const { BrowserWindow } = require('electron');
const createAboutWindow = () => {
    const windowStatus = (global.CONFIGS.IS_DEV ? true : false);
    const aboutWindow = new BrowserWindow({
        width: 500,
        height: 300,
        title: 'About',
        icon: global.CONFIGS.iconPath, // 设置图标
        autoHideMenuBar: true, // 这里设置为 true 来隐藏菜单栏
        resizable: windowStatus,  // 禁止调整窗口大小
        minimizable: windowStatus, // 禁止最小化
        maximizable: windowStatus, // 禁止最大化
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
        aboutWindow.webContents.openDevTools();
    }

    aboutWindow.loadFile('./src/about.html'); // 加载自定义的关于页面
    return aboutWindow;
}
module.exports = createAboutWindow;
