const path = require('path');
const fs = require('fs');
const { app, autoUpdater } = require('electron');

// 自动更新处理函数
function checkForUpdates() {
    // 更新服务器的 URL
    const updateServerUrl = 'http://127.0.0.1:8080/latest.json';

    // 设置自动更新的配置
    autoUpdater.setFeedURL({
        provider: 'generic',
        url: updateServerUrl
    });

    // 监听更新事件
    autoUpdater.on('checking-for-update', () => {
        console.log('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
        console.log('Update available:', info);
    });

    autoUpdater.on('update-not-available', () => {
        console.log('Update not available');
    });

    autoUpdater.on('error', (err) => {
        console.error('Error in autoUpdater:', err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
        console.log('Download progress:', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
        console.log('Update downloaded:', info);
    });

    // 模拟检查更新
    autoUpdater.checkForUpdates();

    // 模拟下载更新
    setTimeout(() => {
        autoUpdater.emit('update-available', {
            version: '1.1.0', // 新版本号
            releaseNotes: 'Release notes for version 1.1.0',
            releaseName: 'Version 1.1.0',
            releaseDate: new Date().toISOString(),
            updateUrl: updateServerUrl
        });

        setTimeout(() => {
            autoUpdater.emit('update-downloaded', {
                version: '1.1.0',
                releaseNotes: 'Release notes for version 1.1.0',
                releaseName: 'Version 1.1.0',
                releaseDate: new Date().toISOString(),
                updateUrl: updateServerUrl
            });
        }, 5000); // 模拟下载时间
    }, 5000); // 模拟检查更新时间
}

module.exports = checkForUpdates;
