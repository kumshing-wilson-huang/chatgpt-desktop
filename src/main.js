const path = require('path');
const { app, BrowserWindow, Menu, ipcMain, dialog, session } = require('electron');
const localeData = require('./locale');
const Store = require('electron-store');
const checkForUpdates = require('./upgrade');
const createAboutWindow = require('./about');
const { createSetProxyWindow, setProxyConfig } = require('./setProxy');
const store = new Store();
let mainWindow = null;

// 挂载全局变量
global.CONFIGS = {
    IS_DEV: false,
    iconPath: path.join(__dirname, 'assets', 'chatgpt.png'),
    preload: path.join(__dirname, 'preload.js')
}

/*
// 启用 electron-reload 进行热重载
require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
}); */



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
        },
        {
            label: localeData.Help.label,
            submenu: [
                {
                    label: localeData.Help['Check for updates'],
                    click: async () => {
                        // 检查更新
                        checkForUpdates();
                    }
                }
            ]
        }
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
    } else {
        template.unshift({
            label: localeData.AppName.title, // 使用自定义的应用名称
            submenu: [
                { label: localeData.AppName.label, click: createAboutWindow },
                { type: 'separator' },
                { role: 'quit', label: localeData.AppName.quit }
            ]
        });
    }

    return template;
}

/**
 * 创建主窗口
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: global.CONFIGS.iconPath, // 设置图标
        title: localeData.AppName.title,
        // fullscreen: true,
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
    mainWindow.loadFile('./src/index.html');

    // 监听窗口关闭事件
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    global.CONFIGS.mainWindow = mainWindow;

    return mainWindow;
}



// 在应用就绪时设置Dock图标
app.on('ready', () => {
    app.setName(localeData.AppName.title);

    // 设置 Dock 图标
    // console.log(iconPath)
    if (process.platform === 'darwin') {
        app.dock.setIcon(global.CONFIGS.iconPath);
    }

    // 在主进程中监听渲染进程发送的 'request-locale' 事件，并将本地化数据 localeData 发送给渲染进程
    ipcMain.on('request-locale', (event) => {
        event.sender.send('set-locale', localeData);
    });

    // 监听 'show-custom-dialog' 事件并处理传递的参数
    ipcMain.on('show-custom-dialog', (event, options) => {
        //console.log(event, options)
        if(options && (typeof options == 'string')) {
            options = { message: options };
        }
        if(!options) options = {};
        if(!options.icon) {
            options.icon = global.CONFIGS.iconPath;
        }
        if(!options.type) {
            options.type = 'info';
        }
        if(!options.title) {
            options.title = localeData.Dialog.title;
        }
        let buttons = [ localeData.Dialog.OK ];
        if(options.buttons && (options.buttons.length > 0)) {
            options.buttons = buttons.concat(options.buttons);
        } else {
            options.buttons = buttons;
        }
        //console.log(options)
        dialog.showMessageBox(options);
    });

    // 监听 'save-proxy-configs' 事件并处理传递的参数
    ipcMain.on('save-proxy-configs', (event, configs) => {
        // console.log(configs)
        store.set('proxyConfig', configs);
        setProxyConfig(configs);
        // 发送触发 callback 的事件给渲染进程
        event.sender.send('save-configs', configs);
    });

    // 获取版本号给渲染进程
    ipcMain.handle('get-app-version', async () => {
        return app.getVersion();
    });

    // 设置代理配置
    const proxyConfig = store.get('proxyConfig');
    // console.log(proxyConfig);
    if(proxyConfig && (Object.keys(proxyConfig).length > 0)) {
        //console.log('setProxyConfig');
        setProxyConfig(proxyConfig);
    }

    createWindow();
    // 检查更新
    checkForUpdates();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 从最小化窗口返回窗口时
app.on('activate', () => {
    //console.log('activate');
    // 如果主窗口不存在，则创建主窗口
    if (!mainWindow) {
        createWindow();
    }

    // mainWindow.webContents.reload();
});
