"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
/**
 * テンプレート変数へ渡す
 * @memberOf Util.UtilModule
 * @function setLocals
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunctiont} next
 * @returns {void}
 */
// tslint:disable-next-line:variable-name
function setLocals(_req, res, next) {
    res.locals.escapeHtml = escapeHtml;
    res.locals.formatPrice = formatPrice;
    res.locals.moment = moment;
    res.locals.timeFormat = timeFormat;
    // tslint:disable-next-line:no-http-string
    res.locals.portalSite = 'http://www.cinemasunshine.co.jp';
    return next();
}
exports.setLocals = setLocals;
/**
 * 時間フォーマット
 * @memberOf Util.UtilModule
 * @function timeFormat
 * @param {string} str
 * @returns {string}
 */
function timeFormat(str) {
    if (typeof str !== 'string') {
        return str;
    }
    const start = 2;
    const end = 4;
    return `${str.slice(0, start)}:${str.slice(start, end)}`;
}
exports.timeFormat = timeFormat;
/**
 * HTMLエスケープ
 * @memberOf Util.UtilModule
 * @function escapeHtml
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    if (typeof str !== 'string') {
        return str;
    }
    const change = (match) => {
        const changeList = {
            '&': '&amp;',
            '\'': '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;'
        };
        return changeList[match];
    };
    return str.replace(/[&'`"<>]/g, change);
}
exports.escapeHtml = escapeHtml;
/**
 * カンマ区切りへ変換
 * @memberOf Util.UtilModule
 * @function formatPrice
 * @param {number} price
 * @returns {string}
 */
function formatPrice(price) {
    return String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}
exports.formatPrice = formatPrice;
/**
 * パフォーマンスID取得
 * @memberOf Util.UtilModule
 * @function getPerformanceId
 * @param {Object} args
 * @param {string} args.theaterCode
 * @param {string} args.day
 * @param {string} args.titleCode
 * @param {string} args.titleBranchNum
 * @param {string} args.screenCode
 * @param {string} args.timeBegin
 * @returns {string}
 */
function getPerformanceId(args) {
    return `${args.theaterCode}${args.day}${args.titleCode}${args.titleBranchNum}${args.screenCode}${args.timeBegin}`;
}
exports.getPerformanceId = getPerformanceId;
/**
 * ベース64エンコード
 * @memberOf Util.UtilModule
 * @function bace64Encode
 * @param {string} str
 * @returns {string}
 */
function bace64Encode(str) {
    return new Buffer(str).toString('base64');
}
exports.bace64Encode = bace64Encode;
/**
 * ベース64デコード
 * @memberOf Util.UtilModule
 * @function base64Decode
 * @param {string} str
 * @returns {string}
 */
function base64Decode(str) {
    return new Buffer(str, 'base64').toString();
}
exports.base64Decode = base64Decode;
/**
 * 興行会社コード
 * @const COMPANY_CODE
 */
exports.COMPANY_CODE = 'SSK000';