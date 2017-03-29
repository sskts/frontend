/**
 * 購入券種選択
 * @namespace Purchase.TicketModule
 */
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
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const debug = require("debug");
const MP = require("../../../../libs/MP");
const TicketForm_1 = require("../../forms/Purchase/TicketForm");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const log = debug('SSKTS ');
/**
 * 券種選択
 * @memberOf Purchase.TicketModule
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
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.TICKET_STATE))
                throw ErrorUtilModule.ERROR_ACCESS;
            if (purchaseModel.performance === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            //券種取得
            const salesTicketsResult = yield getSalesTickets(req, purchaseModel);
            const performance = purchaseModel.performance;
            res.locals.tickets = salesTicketsResult;
            res.locals.performance = performance;
            res.locals.reserveSeats = purchaseModel.reserveSeats;
            res.locals.reserveTickets = purchaseModel.reserveTickets;
            res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
            res.locals.transactionId = purchaseModel.transactionMP.id;
            //セッション更新
            req.session.purchase = purchaseModel.toSession();
            //券種選択表示
            res.render('purchase/ticket');
            return;
        }
        catch (err) {
            next(ErrorUtilModule.getError(req, err));
            return;
        }
    });
}
exports.index = index;
/**
 * 券種決定
 * @memberOf Purchase.TicketModule
 * @function select
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function select(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.session === undefined)
                throw ErrorUtilModule.ERROR_PROPERTY;
            if (req.session.purchase === undefined)
                throw ErrorUtilModule.ERROR_EXPIRE;
            const purchaseModel = new PurchaseSession.PurchaseModel(req.session.purchase);
            if (purchaseModel.transactionMP === null)
                throw ErrorUtilModule.ERROR_PROPERTY;
            //取引id確認
            if (req.body.transaction_id !== purchaseModel.transactionMP.id)
                throw ErrorUtilModule.ERROR_ACCESS;
            try {
                //バリデーション
                TicketForm_1.default(req);
                const validationResult = yield req.getValidationResult();
                if (validationResult.isEmpty()) {
                    const reserveTickets = JSON.parse(req.body.reserve_tickets);
                    purchaseModel.reserveTickets = yield ticketValidation(req, purchaseModel, reserveTickets);
                    log('券種検証');
                    yield upDateAuthorization(purchaseModel);
                    log('オーソリ追加');
                    req.session.purchase = purchaseModel.toSession();
                    log('セッション更新');
                    res.redirect('/purchase/input');
                    return;
                }
            }
            catch (err) {
                if (err === ErrorUtilModule.ERROR_VALIDATION) {
                    try {
                        const salesTicketsResult = yield getSalesTickets(req, purchaseModel);
                        log('券種取得');
                        const performance = purchaseModel.performance;
                        res.locals.tickets = salesTicketsResult;
                        res.locals.performance = performance;
                        res.locals.reserveSeats = purchaseModel.reserveSeats;
                        res.locals.reserveTickets = JSON.parse(req.body.reserve_tickets);
                        res.locals.step = PurchaseSession.PurchaseModel.TICKET_STATE;
                        res.locals.transactionId = purchaseModel.transactionMP.id;
                        res.render('purchase/ticket');
                        return;
                    }
                    catch (err) {
                        throw err;
                    }
                }
                throw err;
            }
        }
        catch (err) {
            next(ErrorUtilModule.getError(req, err));
            return;
        }
    });
}
exports.select = select;
/**
 * 券種リスト取得
 * @memberOf Purchase.TicketModule
 * @function getSalesTickets
 * @param {Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<SalesTicket[]>}
 */
function getSalesTickets(req, purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (purchaseModel.performance === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        const result = [];
        //コアAPI券種取得
        const performance = purchaseModel.performance;
        const salesTickets = yield COA.ReserveService.salesTicket({
            theater_code: performance.attributes.theater.id,
            date_jouei: performance.attributes.day,
            title_code: purchaseModel.performanceCOA.titleCode,
            title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
            time_begin: performance.attributes.time_start
            // screen_code: performance.screen.id,
        });
        for (const ticket of salesTickets) {
            result.push({
                ticket_code: ticket.ticket_code,
                ticket_name: ticket.ticket_name,
                ticket_name_kana: ticket.ticket_name_kana,
                ticket_name_eng: ticket.ticket_name_eng,
                std_price: ticket.std_price,
                add_price: ticket.add_price,
                sale_price: ticket.sale_price,
                ticket_note: ticket.ticket_note,
                add_price_glasses: 0,
                mvtk_num: null,
                glasses: false // メガネ有無
            });
        }
        if (purchaseModel.mvtk === null)
            return result;
        // ムビチケ情報からチケット情報へ変換
        const mvtkTickets = [];
        for (const mvtk of purchaseModel.mvtk) {
            for (let i = 0; i < Number(mvtk.ykknInfo.ykknKnshbtsmiNum); i += 1) {
                mvtkTickets.push({
                    ticket_code: mvtk.ticket.ticket_code,
                    ticket_name: mvtk.ticket.ticket_name,
                    ticket_name_kana: mvtk.ticket.ticket_name_kana,
                    ticket_name_eng: mvtk.ticket.ticket_name_eng,
                    std_price: 0,
                    add_price: mvtk.ticket.add_price,
                    sale_price: mvtk.ticket.add_price,
                    ticket_note: req.__('common.mvtk_code') + mvtk.code,
                    add_price_glasses: mvtk.ticket.add_price_glasses,
                    mvtk_num: mvtk.code,
                    glasses: false // メガネ有無
                });
                if (mvtk.ticket.add_price_glasses > 0) {
                    mvtkTickets.push({
                        ticket_code: mvtk.ticket.ticket_code,
                        ticket_name: `${mvtk.ticket.ticket_name}${req.__('common.glasses')}`,
                        ticket_name_kana: mvtk.ticket.ticket_name_kana,
                        ticket_name_eng: mvtk.ticket.ticket_name_eng,
                        std_price: 0,
                        add_price: mvtk.ticket.add_price,
                        sale_price: mvtk.ticket.add_price + mvtk.ticket.add_price_glasses,
                        ticket_note: req.__('common.mvtk_code') + mvtk.code,
                        add_price_glasses: mvtk.ticket.add_price_glasses,
                        mvtk_num: mvtk.code,
                        glasses: true // メガネ有無
                    });
                }
            }
        }
        return mvtkTickets.concat(result);
    });
}
/**
 * 券種検証
 * @memberOf Purchase.TicketModule
 * @function ticketValidation
 * @param {Request} req
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @param {PurchaseSession.ReserveTicket[]} reserveTickets
 * @returns {Promise<void>}
 */
function ticketValidation(req, purchaseModel, reserveTickets) {
    return __awaiter(this, void 0, void 0, function* () {
        if (purchaseModel.performance === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        const result = [];
        //コアAPI券種取得
        const performance = purchaseModel.performance;
        const salesTickets = yield COA.ReserveService.salesTicket({
            theater_code: performance.attributes.theater.id,
            date_jouei: performance.attributes.day,
            title_code: purchaseModel.performanceCOA.titleCode,
            title_branch_num: purchaseModel.performanceCOA.titleBranchNum,
            time_begin: performance.attributes.time_start
            // screen_code: performance.screen.id,
        });
        for (const ticket of reserveTickets) {
            if (ticket.mvtk_num !== null) {
                // ムビチケ
                if (purchaseModel.mvtk === null)
                    throw ErrorUtilModule.ERROR_PROPERTY;
                const mvtkTicket = purchaseModel.mvtk.find((value) => {
                    return (value.code === ticket.mvtk_num && value.ticket.ticket_code === ticket.ticket_code);
                });
                if (mvtkTicket === undefined)
                    throw ErrorUtilModule.ERROR_ACCESS;
                result.push({
                    section: ticket.section,
                    seat_code: ticket.seat_code,
                    ticket_code: mvtkTicket.ticket.ticket_code,
                    ticket_name: (ticket.glasses)
                        ? `${mvtkTicket.ticket.ticket_name}${req.__('common.glasses')}`
                        : mvtkTicket.ticket.ticket_name,
                    ticket_name_eng: mvtkTicket.ticket.ticket_name_eng,
                    ticket_name_kana: mvtkTicket.ticket.ticket_name_kana,
                    std_price: 0,
                    add_price: mvtkTicket.ticket.add_price,
                    dis_price: 0,
                    sale_price: (ticket.glasses)
                        ? mvtkTicket.ticket.add_price + mvtkTicket.ticket.add_price_glasses
                        : mvtkTicket.ticket.add_price,
                    add_price_glasses: mvtkTicket.ticket.add_price_glasses,
                    glasses: ticket.glasses,
                    mvtk_num: mvtkTicket.code // ムビチケ購入番号
                });
            }
            else {
                // 通常券種
                const salesTicket = salesTickets.find((value) => {
                    return (value.ticket_code === ticket.ticket_code);
                });
                if (salesTicket === undefined)
                    throw ErrorUtilModule.ERROR_ACCESS;
                // 制限単位、人数制限判定
                const sameTickets = reserveTickets.filter((value) => {
                    return (value.ticket_code === salesTicket.ticket_code);
                });
                if (sameTickets.length === 0)
                    throw ErrorUtilModule.ERROR_ACCESS;
                if (salesTicket.limit_unit === '001') {
                    if (sameTickets.length % salesTicket.limit_count !== 0) {
                        throw ErrorUtilModule.ERROR_VALIDATION;
                    }
                }
                else if (salesTicket.limit_unit === '002') {
                    if (sameTickets.length < salesTicket.limit_count) {
                        throw ErrorUtilModule.ERROR_VALIDATION;
                    }
                }
                result.push({
                    section: ticket.section,
                    seat_code: ticket.seat_code,
                    ticket_code: salesTicket.ticket_code,
                    ticket_name: salesTicket.ticket_name,
                    ticket_name_eng: salesTicket.ticket_name_eng,
                    ticket_name_kana: salesTicket.ticket_name_kana,
                    std_price: salesTicket.std_price,
                    add_price: salesTicket.add_price,
                    dis_price: 0,
                    sale_price: salesTicket.sale_price,
                    add_price_glasses: ticket.add_price_glasses,
                    glasses: ticket.glasses,
                    mvtk_num: ticket.mvtk_num // ムビチケ購入番号
                });
            }
        }
        return result;
    });
}
/**
 * オーソリ追加
 * @memberOf Purchase.TicketModule
 * @function upDateAuthorization
 * @param {PurchaseSession.PurchaseModel} purchaseModel
 * @returns {Promise<void>}
 */
function upDateAuthorization(purchaseModel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (purchaseModel.transactionMP === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performance === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveSeats === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.reserveTickets === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.authorizationCOA === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        if (purchaseModel.performanceCOA === null)
            throw ErrorUtilModule.ERROR_PROPERTY;
        // COAオーソリ削除
        yield MP.removeCOAAuthorization({
            transactionId: purchaseModel.transactionMP.id,
            coaAuthorizationId: purchaseModel.authorizationCOA.id
        });
        log('MPCOAオーソリ削除');
        if (purchaseModel.transactionGMO !== null
            && purchaseModel.authorizationGMO !== null
            && purchaseModel.orderId !== null
            && purchaseModel.theater !== null) {
            //GMOオーソリあり
            const gmoShopId = purchaseModel.theater.attributes.gmo_shop_id;
            const gmoShopPassword = purchaseModel.theater.attributes.gmo_shop_pass;
            //GMOオーソリ取消
            yield GMO.CreditService.alterTran({
                shopId: gmoShopId,
                shopPass: gmoShopPassword,
                accessId: purchaseModel.transactionGMO.accessId,
                accessPass: purchaseModel.transactionGMO.accessPass,
                jobCd: GMO.Util.JOB_CD_VOID
            });
            log('GMOオーソリ取消');
            // GMOオーソリ削除
            yield MP.removeGMOAuthorization({
                transactionId: purchaseModel.transactionMP.id,
                gmoAuthorizationId: purchaseModel.authorizationGMO.id
            });
            log('GMOオーソリ削除');
        }
        //COAオーソリ追加
        const coaAuthorizationResult = yield MP.addCOAAuthorization({
            transaction: purchaseModel.transactionMP,
            reserveSeatsTemporarilyResult: purchaseModel.reserveSeats,
            salesTicketResults: purchaseModel.reserveTickets,
            performance: purchaseModel.performance,
            performanceCOA: purchaseModel.performanceCOA,
            price: purchaseModel.getReserveAmount()
        });
        log('MPCOAオーソリ追加', coaAuthorizationResult);
        purchaseModel.authorizationCOA = coaAuthorizationResult;
    });
}
