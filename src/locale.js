const path = require('path');
const fs = require('fs');
const { app } = require('electron');


// 语言选择，默认为中文
let language = app.getLocale(); // 获取系统语言
if (!language) language = 'zh-CN';
const localeFilePath = path.join(__dirname, `locales/${language}.json`);
const localeData = JSON.parse(fs.readFileSync(localeFilePath, 'utf8'));
module.exports = (keys, params) => {
    let lang = localeData;
    if(keys) {
        let fieldArr = keys;
        if(typeof keys === 'string') {
            fieldArr = keys.split('.');
        }

        for(let i in fieldArr) {
            lang = lang[fieldArr[i]];
        }
        // console.log(field, lang);

        if(params) {
            // 替换参数
            for(let i in params) {
                lang = lang.replace(`{${i}}`, params[i]);
            }
        }
    }

    return lang;
};
