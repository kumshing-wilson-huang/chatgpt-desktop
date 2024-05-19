const path = require('path');
const fs = require('fs');
const { app } = require('electron');


// 语言选择，默认为中文
let language = app.getLocale(); // 获取系统语言
if (!language) language = 'zh-CN';
const localeFilePath = path.join(__dirname, `locales/${language}.json`);
const localeData = JSON.parse(fs.readFileSync(localeFilePath, 'utf8'));
module.exports = localeData;