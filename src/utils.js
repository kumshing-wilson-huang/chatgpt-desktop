/**
 * 工具类
 *
 * @type {{}}
 */
const { app, ipcMain } = require('electron');

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
    }
}
