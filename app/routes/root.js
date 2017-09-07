/**
 * ルーティングRoot
 */
"use strict";
const express = require("express");
const SignInModule = require("../modules/Auth/SignInModule");
const ScreenModule = require("../modules/Screen/ScreenModule");
const UtilModule = require("../modules/Util/UtilModule");
const rootRouter = express.Router();
if (process.env.VIEW_TYPE !== UtilModule.VIEW.Fixed) {
    rootRouter.get('/signIn', SignInModule.index);
}
if (process.env.VIEW_TYPE !== UtilModule.VIEW.Fixed
    && (process.env.NODE_ENV === UtilModule.ENV.Development || process.env.NODE_ENV === UtilModule.ENV.Test)) {
    // index
    rootRouter.get('/', (_, res) => { res.redirect('/purchase/performances'); });
    // 再起動
    rootRouter.get('/500', () => { process.exit(1); });
    // スクリーンテスト
    rootRouter.get('/screen', ScreenModule.index);
    rootRouter.post('/screen', ScreenModule.getScreenStateReserve);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rootRouter;
