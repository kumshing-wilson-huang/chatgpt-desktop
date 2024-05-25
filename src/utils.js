/**
 * 其它工具类
 *
 * @type {{}}
 */
const { app, ipcMain, dialog } = require('electron');
const L = require('./locale');

module.exports = {
    /**
     * 因为ChatGPT在间隔一段时间内token会过期，
     * 所以在长时间无操作的情况下需要刷新下页面才能继续使用
     *
     * @param window
     * @param idleTimeOut
     */
    startCheckIdleTimer (window, idleTimeOut) {
        // console.log('startIdleTimer');
        global.CONFIGS.idleTime = 0;
        global.CONFIGS.IDLE_TIMEOUT = idleTimeOut;
        // 每秒钟增加一次 idleTime
        if(global.CONFIGS.timer) clearInterval(global.CONFIGS.timer);
        global.CONFIGS.timer = setInterval(() => {
            global.CONFIGS.idleTime++;
            //console.log(global.CONFIGS.idleTime);
            // 判断窗口是否处于带焦点状态，但暂时不支持一直在焦点又长时间没操作的情况
            const isFocused = window.isFocused();
            if(isFocused) {
                if (global.CONFIGS.idleTime >= global.CONFIGS.IDLE_TIMEOUT) {
                    if(global.CONFIGS.mainWindow) {
                        global.CONFIGS.mainWindow.reload();
                    }
                    //console.log('reload');
                }
                global.CONFIGS.idleTime = 0; // 刷新页面后重置 idleTime
            }
        }, 1000);
    },

    /**
     * 显示自定义的提示框
     * @param options
     * @returns {*}
     */
    showCustomDialog(options) {
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
            options.title = L('Dialog.title');
        }
        let buttons = [ L('Dialog.OK') ];
        if(options.buttons && (options.buttons.length > 0)) {
            options.buttons = buttons.concat(options.buttons);
        } else {
            options.buttons = buttons;
        }
        //console.log(options)
        return dialog.showMessageBox(options);
    }
}
