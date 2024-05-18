const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, Menu, session, ipcMain } = require('electron');

let mainWindow;
// 设置应用名称
const appName = 'ChatGPT'; // 修改为你的应用名称

// 语言选择，默认为英语
let language = app.getLocale(); // 获取系统语言
if (!language) language = 'zh-CN';
const localeFilePath = path.join(__dirname, `locales/${language}.json`);
const localeData = JSON.parse(fs.readFileSync(localeFilePath, 'utf8'));

// 启用 electron-reload 进行热重载
require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'assets', 'icon.icns'), // 设置图标
        // fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true
        }
    });

    // 创建菜单
    const menuTemplate = getMenuTemplate(localeData);
    // 在 macOS 上，添加一个空白菜单项以维持菜单的一致性
    if (process.platform === 'darwin') {
        menuTemplate.unshift({
            label: null,
            submenu: [],
            visible: false // 将应用菜单项设置为不可见
        });
    }
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // 加载index.html
    mainWindow.loadFile('index.html');
}

/**
 * 创建关于窗口
 */
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        width: 400,
        height: 300,
        title: 'About',
        resizable: false,  // 禁止调整窗口大小
        minimizable: false, // 禁止最小化
        maximizable: false, // 禁止最大化
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    aboutWindow.loadFile('about.html'); // 加载自定义的关于页面

    // 传递语言包数据给 about.html
    aboutWindow.webContents.on('did-finish-load', () => {
        aboutWindow.webContents.send('set-locale', localeData);
    });
}

function createSetProxyWindow() {
    const setProxyWindow = new BrowserWindow({
        width: 400,
        height: 300,
        title: 'Set Proxy',
        resizable: false,
        minimizable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    setProxyWindow.loadFile('setProxy.html');

    ipcMain.handle('set-proxy', async (event, proxyUrl) => {
        try {
            await mainWindow.webContents.session.setProxy({ proxyRules: proxyUrl });
            dialog.showMessageBox({
                type: 'info',
                message: 'Proxy set successfully',
                buttons: ['OK']
            });
        } catch (error) {
            dialog.showErrorBox('Failed to set proxy', error.message);
        }
    });
}

// 获取菜单模板
function getMenuTemplate(localeData) {
    const template = [
        {
            label: localeData.Settings.label,
            submenu: [
                {
                    label: localeData.Settings['Set Proxy'],
                    click: () => {
                        createSetProxyWindow();
                    }
                }
            ]
        },
        {
            label: localeData.Edit.label,
            submenu: [
                { role: 'undo', label: localeData.Edit.undo },
                { role: 'redo', label: localeData.Edit.redo },
                { type: 'separator' },
                { role: 'cut', label: localeData.Edit.cut },
                { role: 'copy', label: localeData.Edit.copy },
                { role: 'paste', label: localeData.Edit.paste },
                { role: 'delete', label: localeData.Edit.delete },
                { type: 'separator' },
                { role: 'selectAll', label: localeData.Edit.selectAll }
            ]
        },
        {
            label: localeData.View.label,
            submenu: [
                { role: 'reload', label: localeData.View.reload },
                { role: 'forcereload', label: localeData.View.forcereload },
                // 打开开发工具
                //{ role: 'toggledevtools', label: localeData.View.toggledevtools },
                { type: 'separator' },
                { role: 'resetzoom', label: localeData.View.resetzoom },
                { role: 'zoomin', label: localeData.View.zoomin },
                { role: 'zoomout', label: localeData.View.zoomout },
                { type: 'separator' },
                { role: 'togglefullscreen', label: localeData.View.togglefullscreen }
            ]
        },
        {
            role: "window",
            label: localeData.Window.label,
            submenu: [
                { role: 'minimize', label: localeData.Window.minimize },
                { role: 'close', label: localeData.Window.close }
            ]
        }/* 暂时隐藏了解更多,
        {
            label: localeData.Help.label,
            submenu: [
                {
                    label: localeData.Help['Learn More'],
                    click: async () => {
                        const { shell } = require('electron');
                        await shell.openExternal('https://electronjs.org');
                    }
                }
            ]
        }*/
    ];

    // 如果是 MacOS，添加应用菜单项
    if (process.platform === 'darwin') {
        template.unshift({
            label: appName, // 使用自定义的应用名称
            submenu: [
                { label: `关于 ${appName}`, click: createAboutWindow },
                { type: 'separator' },
                // 打开服务菜单
                //{ role: 'services', submenu: [] },
                { type: 'separator' },
                { role: 'hide', label: `隐藏 ${appName}` },
                { role: 'hideothers', label: '隐藏其他' },
                { role: 'unhide', label: '取消隐藏' },
                { type: 'separator' },
                { role: 'quit', label: `退出 ${appName}` }
            ]
        });

        // 在视图菜单中添加窗口菜单
        const windowMenu = template.find(item => item.role === 'window');
        if (!windowMenu) {
            template.push({
                role: 'window',
                submenu: [
                    { role: 'minimize', label: '最小化' },
                    { role: 'zoom', label: '缩放' },
                    { type: 'separator' },
                    { role: 'front', label: '全部移到前面' }
                ]
            });
        }
    }

    return template;
}

// 设置代理函数
function setProxy() {
    const proxyRules = 'http://your-proxy-server:port'; // 修改为你的代理服务器和端口
    session.defaultSession.setProxy({ proxyRules })
        .then(() => {
            console.log('Proxy set successfully');
        })
        .catch(err => {
            console.error('Failed to set proxy', err);
        });
}

// 在应用就绪时设置Dock图标
app.on('ready', () => {
    createWindow();
    if (mainWindow) {
        mainWindow.maximize(); // 将窗口最大化
        // mainWindow.setFullScreen(true); // 或者将窗口设置为全屏
    }
    // 设置 Dock 图标
    if (process.platform === 'darwin') {
        const iconPath = path.join(__dirname, 'assets', 'chatgpt.png');
        app.dock.setIcon(iconPath);
    }
    app.setName(appName);
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
