"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const config = require("config");
const COA = require("@motionpicture/coa-service");
const MP = require("../../../../libs/MP");
const GMO = require("@motionpicture/gmo-service");
var Module;
(function (Module) {
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!req.params || !req.params['id'])
            return next(new Error(req.__('common.error.access')));
        if (!purchaseModel.performance)
            throw new Error(req.__('common.error.property'));
        MP.getPerformance.call({
            id: req.params['id']
        }).then((result) => {
            res.locals['performances'] = {
                after: result,
                before: purchaseModel.performance,
            };
            return res.render('purchase/overlap');
        }, (err) => {
            return next(new Error(err.message));
        });
    }
    Module.index = index;
    function newReserve(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        removeReserve(req, purchaseModel).then(() => {
            if (!req.session)
                return next(req.__('common.error.property'));
            delete req.session['purchase'];
            return res.redirect('/purchase/' + req.body.performance_id + '/transaction');
        }, (err) => {
            return next(new Error(err.message));
        });
    }
    Module.newReserve = newReserve;
    function prevReserve(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        return res.redirect('/purchase/seat/' + req.body.performance_id + '/');
    }
    Module.prevReserve = prevReserve;
    function removeReserve(req, purchaseModel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!purchaseModel.performance)
                throw new Error(req.__('common.error.property'));
            if (!purchaseModel.transactionMP)
                throw new Error(req.__('common.error.property'));
            if (!purchaseModel.reserveSeats)
                throw new Error(req.__('common.error.property'));
            if (!purchaseModel.authorizationCOA)
                throw new Error(req.__('common.error.property'));
            let performance = purchaseModel.performance;
            let reserveSeats = purchaseModel.reserveSeats;
            yield COA.deleteTmpReserveInterface.call({
                theater_code: performance.attributes.theater._id,
                date_jouei: performance.attributes.day,
                title_code: performance.attributes.film.coa_title_code,
                title_branch_num: performance.attributes.film.coa_title_branch_num,
                time_begin: performance.attributes.time_start,
                tmp_reserve_num: reserveSeats.tmp_reserve_num,
            });
            console.log('COA仮予約削除');
            yield MP.removeCOAAuthorization.call({
                transactionId: purchaseModel.transactionMP._id,
                coaAuthorizationId: purchaseModel.authorizationCOA._id
            });
            console.log('COAオーソリ削除');
            if (purchaseModel.transactionGMO
                && purchaseModel.authorizationGMO
                && purchaseModel.orderId) {
                yield GMO.CreditService.alterTranInterface.call({
                    shop_id: config.get('gmo_shop_id'),
                    shop_pass: config.get('gmo_shop_password'),
                    access_id: purchaseModel.transactionGMO.access_id,
                    access_pass: purchaseModel.transactionGMO.access_pass,
                    job_cd: GMO.Util.JOB_CD_VOID
                });
                console.log('GMOオーソリ取消');
                yield MP.removeGMOAuthorization.call({
                    transactionId: purchaseModel.transactionMP._id,
                    gmoAuthorizationId: purchaseModel.authorizationGMO._id,
                });
                console.log('GMOオーソリ削除');
            }
        });
    }
})(Module = exports.Module || (exports.Module = {}));
