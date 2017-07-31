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
const debug = require("debug");
const moment = require("moment");
const MP = require("../../../libs/MP/sskts-api");
const PurchaseModel_1 = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const log = debug('SSKTS:Purchase.PerformancesModule');
/**
 * パフォーマンス一覧表示
 * @memberof Purchase.PerformancesModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function index(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            const purchaseModel = new PurchaseModel_1.PurchaseModel(req.session.purchase);
            if (purchaseModel.seatReservationAuthorization !== null) {
                yield MP.service.transaction.placeOrder.cancelSeatReservationAuthorization({
                    auth: yield UtilModule.createAuth(req),
                    transactionId: purchaseModel.transaction.id,
                    authorizationId: purchaseModel.seatReservationAuthorization.id
                });
                log('仮予約削除');
            }
            // セッション削除
            delete req.session.purchase;
            delete req.session.mvtk;
            delete req.session.complete;
            delete req.session.auth;
            if (process.env.VIEW_TYPE === undefined) {
                res.locals.movieTheaters = yield MP.service.organization.searchMovieTheaters({
                    auth: yield UtilModule.createAuth(req)
                });
                log(res.locals.movieTheaters);
            }
            res.locals.step = PurchaseModel_1.PurchaseModel.PERFORMANCE_STATE;
            res.render('purchase/performances', { layout: 'layouts/purchase/layout' });
        }
        catch (err) {
            const error = (err instanceof Error)
                ? new ErrorUtilModule.CustomError(ErrorUtilModule.ERROR_EXTERNAL_MODULE, err.message)
                : new ErrorUtilModule.CustomError(err, undefined);
            next(error);
            return;
        }
    });
}
exports.index = index;
/**
 * パフォーマンスリスト取得
 * @memberof Purchase.PerformancesModule
 * @function getPerformances
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function getPerformances(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 上映イベント検索
            const individualScreeningEvents = yield MP.service.event.searchIndividualScreeningEvent({
                auth: yield UtilModule.createAuth(req),
                searchConditions: {
                    theater: req.body.theater,
                    day: moment(req.body.day).format('YYYYMMDD')
                }
            });
            log('上映イベント検索');
            res.json({ error: null, result: individualScreeningEvents });
        }
        catch (err) {
            res.json({ error: err, result: null });
        }
    });
}
exports.getPerformances = getPerformances;
