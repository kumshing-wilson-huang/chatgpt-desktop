const path = require('path');
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const localeData = require('./locale');
const preload = path.join(__dirname, 'preload.js');
const Store = require('electron-store');
const store = new Store();
const IS_DEV = true;

// 启用 electron-reload 进行热重载
require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

// 获取主窗口菜单模板
function getMenuTemplate() {
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
            label: localeData.AppName.title, // 使用自定义的应用名称
            submenu: [
                { label: localeData.AppName.label, click: createAboutWindow },
                { type: 'separator' },
                // 打开服务菜单
                //{ role: 'services', submenu: [] },
                { type: 'separator' },
                { role: 'hide', label: localeData.AppName.hide },
                { role: 'hideothers', label: localeData.AppName.hideothers },
                { role: 'unhide', label: localeData.AppName.unhide },
                // 分隔线
                { type: 'separator' },
                { role: 'quit', label: localeData.AppName.quit }
            ]
        });

        // 在视图菜单中添加窗口菜单
        const windowMenu = template.find(item => item.role === 'window');
        if (!windowMenu) {
            template.push({
                role: 'window',
                submenu: [
                    { role: 'minimize', label: localeData.window.minimize },
                    { role: 'zoom', label: localeData.window.zoom },
                    { type: 'separator' },
                    { role: 'front', label: localeData.window.front }
                ]
            });
        }
    }

    return template;
}

/**
 * 创建主窗口
 */
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'assets', 'chatgpt.png'), // 设置图标
        // fullscreen: true,
        webPreferences: {
            preload: preload,
            nodeIntegration: true,
            contextIsolation: true,
            webviewTag: true
        }
    });

    // 打开开发者工具
    if (IS_DEV) {
        mainWindow.webContents.openDevTools();
    }


    // 创建菜单
    const menuTemplate = getMenuTemplate();
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
    mainWindow.maximize(); // 将窗口最大化

    // 加载index.html
    mainWindow.loadFile('index.html');

    return mainWindow;
}

/**
 * 创建关于窗口
 */
function createAboutWindow() {
    const windowStatus = (IS_DEV ? true : false);
    const aboutWindow = new BrowserWindow({
        width: 500,
        height: 300,
        title: 'About',
        resizable: windowStatus,  // 禁止调整窗口大小
        minimizable: windowStatus, // 禁止最小化
        maximizable: windowStatus, // 禁止最大化
        webPreferences: {
            preload: preload,
            nodeIntegration: true,
            contextIsolation: true,
            webviewTag: true,
        }
    });

    // 打开开发者工具
    if (IS_DEV) {
        //    aboutWindow.webContents.openDevTools();
    }

    aboutWindow.loadFile('about.html'); // 加载自定义的关于页面
    return aboutWindow;
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

    ipcMain.handle('set-proxy', async (event, { proxyUrl, proxyPort, proxyType }) => {
        try {
            // 保存代理配置
            store.set('proxyConfig', {
                proxyUrl: proxyUrl,
                proxyPort: proxyPort,
                proxyType: proxyType
            });
            dialog.showMessageBox({
                type: 'info',
                message: 'Proxy set successfully',
                buttons: ['OK']
            });
        } catch (error) {
            dialog.showErrorBox('Failed to set proxy', error.message);
        }
    });
    return setProxyWindow;
}


// 在应用就绪时设置Dock图标
app.on('ready', () => {
    // 在主进程中监听渲染进程发送的 'request-locale' 事件，并将本地化数据 localeData 发送给渲染进程
    ipcMain.on('request-locale', (event) => {
        event.sender.send('set-locale', localeData);
    });

    createWindow();

    // 设置 Dock 图标
    if (process.platform === 'darwin') {
        const iconPath = path.join(__dirname, 'assets', 'chatgpt.png');
        app.dock.setIcon(iconPath);
    }
    app.setName(localeData.AppName.title);
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
