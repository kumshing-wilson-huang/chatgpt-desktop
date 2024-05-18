const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, Menu, session } = require('electron');

// 设置应用名称
const appName = 'ChatGPT'; // 修改为你的应用名称
app.setName(appName); // 这通常对 Mac 左上角菜单无效，但在构建时有效

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
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'assets', 'icon.icns'), // 设置图标
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true
        }
    });

    // 创建菜单
    const menuTemplate = getMenuTemplate(localeData);
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // 加载index.html
    mainWindow.loadFile('index.html');
}

// 获取菜单模板
function getMenuTemplate(localeData) {
    const template = [
        {
            label: localeData.File.label,
            submenu: [
                {
                    label: localeData.File.Open,
                    click: () => {
                        console.log('Open clicked');
                        // 在这里添加你的打开文件逻辑
                    }
                },
                {
                    label: localeData.File.Save,
                    click: () => {
                        console.log('Save clicked');
                        // 在这里添加你的保存文件逻辑
                    }
                },
                { type: 'separator' },
                {
                    label: localeData.File.Exit,
                    click: () => {
                        app.quit();
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
                    label: localeData.Help['Learn More'],
                    click: async () => {
                        const { shell } = require('electron');
                        await shell.openExternal('https://electronjs.org');
                    }
                },
                {
                    label: localeData.Help['Set Proxy'],
                    click: () => {
                        setProxy();
                    }
                }
            ]
        }
    ];

    // 如果是 MacOS，添加应用菜单项
    if (process.platform === 'darwin') {
        template.unshift({
            label: appName, // 使用自定义的应用名称
            submenu: [
                { role: 'about', label: `关于 ${appName}` },
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
    // 设置 Dock 图标
    if (process.platform === 'darwin') {
        const iconPath = path.join(__dirname, 'assets', 'chatgpt.icns');
        console.log(iconPath)
        app.dock.setIcon(iconPath);
    }

    createWindow();
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
