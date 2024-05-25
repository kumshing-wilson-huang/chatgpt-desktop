/**
 * 自动更新处理函数 todo
 * shasum -a 512 updates/ChatGPT\ Desktop-1.1.0-mac.zip
 * http-server -p 8080 -c-1 ./updates
 */
const { app, autoUpdater } = require('electron');
const L = require('./locale');
const log = require('electron-log');
const utils = require('./utils');
// 设置日志
log.transports.file.level = 'info';

// 设置更新服务器的地址
autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'kumshing-wilson-huang',
    repo: 'chatgpt-desktop',
    updateType: 'release', // 使用 updateType 选项而不是 releaseType
    url: 'https://github.com/kumshing-wilson-huang/chatgpt-desktop/releases/latest'
});

// 监听更新状态
autoUpdater.on('update-available', (info) => {
    utils.showCustomDialog({
        icon: global.CONFIGS.iconPath,
        type: 'info',
        title: L('Upgrade.title'),
        message: L('Upgrade.available', { version: info.version }),
    });
});

autoUpdater.on('update-downloaded', () => {
    utils.showCustomDialog({
        icon: global.CONFIGS.iconPath,
        type: 'info',
        title: L('Upgrade.title'),
        message: L('Upgrade.title'),
    });
});

autoUpdater.on('error', (error) => {
    utils.showCustomDialog({
        icon: global.CONFIGS.iconPath,
        type: 'error',
        title: L('Upgrade.title'),
        message: L('Upgrade.error', { error: error.toString() }),
    });
});

module.exports = () => {
    return false; // todo
    autoUpdater.checkForUpdates();
}
