const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// 自动更新处理函数
function checkForUpdates() {
    autoUpdater.checkForUpdatesAndNotify();
}

// 监听更新事件
autoUpdater.on('update-available', (info) => {
    log.info('Update available.');
});

autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded; will install in 5 seconds');
    setTimeout(() => {
        autoUpdater.quitAndInstall();
    }, 5000);
});

autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater. ' + err);
});

autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
});

autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available.');
});

module.exports = checkForUpdates;
