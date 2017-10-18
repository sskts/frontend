"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 重複予約
 * @namespace Purchase.OverlapModule
 */
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const debug = require("debug");
const HTTPStatus = require("http-status");
const AuthModel_1 = require("../../models/Auth/AuthModel");
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule_1 = require("../Util/ErrorUtilModule");
const log = debug('SSKTS:Purchase.OverlapModule');
/**
 * 仮予約重複
 * @memberof Purchase.OverlapModule
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function render(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (req.params.id === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            if (purchaseModel.individualScreeningEvent === null)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            // イベント情報取得
            const individualScreeningEvent = yield sasaki.service.event(options).findIndividualScreeningEvent({
                identifier: req.params.id
            });
            log('イベント情報取得', individualScreeningEvent);
            res.locals.after = individualScreeningEvent;
            res.locals.before = purchaseModel.individualScreeningEvent;
            res.render('purchase/overlap');
        }
        catch (err) {
            next(err);
        }
    });
}
exports.render = render;
/**
 * 新規予約へ
 * @memberof Purchase.OverlapModule
 * @function newReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function newReserve(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            const authModel = new AuthModel_1.AuthModel(req.session.auth);
            const options = {
                endpoint: process.env.SSKTS_API_ENDPOINT,
                auth: authModel.create()
            };
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.transaction !== null
                && purchaseModel.seatReservationAuthorization !== null
                && !purchaseModel.isExpired()) {
                try {
                    // COA仮予約削除
                    yield sasaki.service.transaction.placeOrder(options).cancelSeatReservationAuthorization({
                        transactionId: purchaseModel.transaction.id,
                        actionId: purchaseModel.seatReservationAuthorization.id
                    });
                    log('COA仮予約削除');
                }
                catch (err) {
                    log('COA仮予約削除失敗', err);
                }
            }
            //購入スタートへ
            delete req.session.purchase;
            res.redirect(`/purchase?id=${req.body.performanceId}`);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.newReserve = newReserve;
/**
 * 前回の予約へ
 * @memberof Purchase.OverlapModule
 * @function prevReserve
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function prevReserve(req, res, next) {
    if (req.session === undefined) {
        next(new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property));
        return;
    }
    //座席選択へ
    res.redirect(`/purchase/seat/${req.body.performanceId}/`);
    return;
}
exports.prevReserve = prevReserve;
