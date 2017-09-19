/**
 * 購入券種選択
 * @namespace Purchase.TicketModule
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import TicketForm from '../../forms/Purchase/TicketForm';
import { AuthModel } from '../../models/Auth/AuthModel';
import { IReserveTicket, PurchaseModel } from '../../models/Purchase/PurchaseModel';
import * as ErrorUtilModule from '../Util/ErrorUtilModule';
import * as InputModule from './InputModule';
const log = debug('SSKTS:Purchase.TicketModule');

/**
 * 券種選択
 * @memberof Purchase.TicketModule
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function render(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session === undefined) throw ErrorUtilModule.ErrorType.Property;
        if (req.session.purchase === undefined) throw ErrorUtilModule.ErrorType.Expire;
        const purchaseModel = new PurchaseModel(req.session.purchase);
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        if (purchaseModel.individualScreeningEvent === null) throw ErrorUtilModule.ErrorType.Property;
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ErrorType.Expire;
        if (!purchaseModel.accessAuth(PurchaseModel.TICKET_STATE)) throw ErrorUtilModule.ErrorType.Access;

        if (authModel.isMember()) {
            if (purchaseModel.profile === null) {
                const contacts = await sasaki.service.person(options).getContacts({
                    personId: 'me'
                });
                log('会員情報取得', contacts);
                purchaseModel.profile = {
                    familyName: contacts.familyName,
                    givenName: contacts.givenName,
                    email: contacts.email,
                    emailConfirm: contacts.email,
                    telephone: contacts.telephone.replace(/\-/g, '')
                };
            }
            if (purchaseModel.creditCards.length === 0) {
                const creditCards = await sasaki.service.person(options).findCreditCards({
                    personId: 'me'
                });
                log('会員クレジット情報取得', purchaseModel.creditCards);
                purchaseModel.creditCards = creditCards.filter((creditCard) => {
                    // GMO定数へ変更
                    return (creditCard.deleteFlag === '0');
                });
            }
        }

        //券種取得
        res.locals.error = '';
        res.locals.salesTickets = purchaseModel.getSalesTickets(req);
        res.locals.purchaseModel = purchaseModel;
        res.locals.step = PurchaseModel.TICKET_STATE;
        //セッション更新
        purchaseModel.save(req.session);
        //券種選択表示
        res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });

        return;
    } catch (err) {
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
        next(error);

        return;
    }
}

/**
 * 選択チケット
 * @interface ISelectTicket
 */
export interface ISelectTicket {
    /**
     * 座席セクション
     */
    section: string;
    /**
     * 座席番号
     */
    seatCode: string;
    /**
     * チケットコード
     */
    ticketCode: string;
    /**
     * チケット名
     */
    ticketName: string;
    /**
     * 販売単価
     */
    salePrice: number;
    /**
     * メガネ有り無し
     */
    glasses: boolean;
    /**
     * メガネ加算単価
     */
    addPriceGlasses: number;
    /**
     * ムビチケ購入番号
     */
    mvtkNum: string;
}

/**
 * 券種決定
 * @memberof Purchase.TicketModule
 * @function ticketSelect
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:cyclomatic-complexity
// tslint:disable-next-line:max-func-body-length
export async function ticketSelect(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new ErrorUtilModule.AppError(ErrorUtilModule.ErrorType.Property, undefined));

        return;
    }
    try {
        const authModel = new AuthModel(req.session.auth);
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        if (req.session.purchase === undefined) throw ErrorUtilModule.ErrorType.Expire;
        const purchaseModel = new PurchaseModel(req.session.purchase);
        if (purchaseModel.isExpired()) throw ErrorUtilModule.ErrorType.Expire;
        if (purchaseModel.transaction === null) throw ErrorUtilModule.ErrorType.Property;
        if (purchaseModel.individualScreeningEvent === null) throw ErrorUtilModule.ErrorType.Property;
        if (purchaseModel.seatReservationAuthorization === null) throw ErrorUtilModule.ErrorType.Property;

        //取引id確認
        if (req.body.transactionId !== purchaseModel.transaction.id) throw ErrorUtilModule.ErrorType.Access;
        //バリデーション
        TicketForm(req);
        const validationResult = await req.getValidationResult();
        if (validationResult.isEmpty()) {
            const selectTickets: ISelectTicket[] = JSON.parse(req.body.reserveTickets);
            purchaseModel.reserveTickets = await ticketValidation(req, res, purchaseModel, selectTickets);
            log('券種検証');
            // COAオーソリ削除
            await sasaki.service.transaction.placeOrder(options).cancelSeatReservationAuthorization({
                transactionId: purchaseModel.transaction.id,
                authorizationId: purchaseModel.seatReservationAuthorization.id
            });
            log('SSKTSCOAオーソリ削除');
            //COAオーソリ追加
            const createSeatReservationAuthorizationArgs = {
                transactionId: purchaseModel.transaction.id,
                eventIdentifier: purchaseModel.individualScreeningEvent.identifier,
                offers: (<IReserveTicket[]>purchaseModel.reserveTickets).map((reserveTicket) => {
                    return {
                        seatSection: reserveTicket.section,
                        seatNumber: reserveTicket.seatCode,
                        ticketInfo: {
                            ticketCode: reserveTicket.ticketCode,
                            ticketName: reserveTicket.ticketName,
                            ticketNameEng: reserveTicket.ticketNameEng,
                            ticketNameKana: reserveTicket.ticketNameKana,
                            stdPrice: reserveTicket.stdPrice,
                            addPrice: reserveTicket.addPrice,
                            disPrice: reserveTicket.disPrice,
                            salePrice: reserveTicket.salePrice,
                            mvtkAppPrice: reserveTicket.mvtkAppPrice,
                            ticketCount: 1,
                            seatNum: reserveTicket.seatCode,
                            addGlasses: reserveTicket.addPriceGlasses,
                            kbnEisyahousiki: reserveTicket.kbnEisyahousiki,
                            mvtkNum: reserveTicket.mvtkNum,
                            mvtkKbnDenshiken: reserveTicket.mvtkKbnDenshiken,
                            mvtkKbnMaeuriken: reserveTicket.mvtkKbnKensyu,
                            mvtkKbnKensyu: reserveTicket.mvtkKbnKensyu,
                            mvtkSalesPrice: reserveTicket.mvtkSalesPrice
                        }
                    };
                })
            };
            log('SSKTSCOAオーソリ追加IN', createSeatReservationAuthorizationArgs.offers[0]);
            purchaseModel.seatReservationAuthorization = await sasaki.service.transaction.placeOrder(options)
                .createSeatReservationAuthorization(createSeatReservationAuthorizationArgs);
            if (purchaseModel.seatReservationAuthorization === null) throw ErrorUtilModule.ErrorType.Property;
            log('SSKTSCOAオーソリ追加', purchaseModel.seatReservationAuthorization);
            if (purchaseModel.mvtkAuthorization !== null) {
                await sasaki.service.transaction.placeOrder(options).cancelMvtkAuthorization({
                    transactionId: purchaseModel.transaction.id,
                    authorizationId: purchaseModel.mvtkAuthorization.id
                });
                log('SSKTSムビチケオーソリ削除');
            }
            if (purchaseModel.mvtk.length > 0 && purchaseModel.isReserveMvtkTicket()) {
                // 購入管理番号情報
                const mvtkSeatInfoSync = purchaseModel.getMvtkSeatInfoSync();
                log('購入管理番号情報', mvtkSeatInfoSync);
                if (mvtkSeatInfoSync === null) throw ErrorUtilModule.ErrorType.Access;
                const createMvtkAuthorizationArgs = {
                    transactionId: purchaseModel.transaction.id,
                    mvtk: {
                        price: purchaseModel.getMvtkPrice(),
                        transactionId: purchaseModel.transaction.id,
                        seatInfoSyncIn: mvtkSeatInfoSync
                    }
                };
                log('SSKTSムビチケオーソリ追加IN', createMvtkAuthorizationArgs);
                purchaseModel.mvtkAuthorization = await sasaki.service.transaction.placeOrder(options)
                    .createMvtkAuthorization(createMvtkAuthorizationArgs);
                log('SSKTSムビチケオーソリ追加', purchaseModel.mvtkAuthorization);
            }
            purchaseModel.save(req.session);
            log('セッション更新');

            if (authModel.isMember() && purchaseModel.getReserveAmount() === 0) {
                // 情報入力スキップ
                await InputModule.purchaserInformationRegistrationOfMember(req, res, next);
            } else {
                res.redirect('/purchase/input');
            }
        } else {
            throw ErrorUtilModule.ErrorType.Access;
        }
    } catch (err) {
        if (err === ErrorUtilModule.ErrorType.Validation) {
            if (req.session.purchase === undefined) throw ErrorUtilModule.ErrorType.Expire;
            const purchaseModel = new PurchaseModel(req.session.purchase);
            if (purchaseModel.individualScreeningEvent === null) throw ErrorUtilModule.ErrorType.Property;
            res.locals.error = '';
            res.locals.salesTickets = purchaseModel.getSalesTickets(req);
            res.locals.purchaseModel = purchaseModel;
            res.locals.step = PurchaseModel.TICKET_STATE;
            res.render('purchase/ticket', { layout: 'layouts/purchase/layout' });

            return;
        }
        const error = (err instanceof Error) ? err : new ErrorUtilModule.AppError(err, undefined);
        next(error);
    }
}

/**
 * 券種検証
 * @memberof Purchase.TicketModule
 * @function ticketValidation
 * @param {Request} req
 * @param {PurchaseModel} purchaseModel
 * @param {ISelectTicket[]} rselectTickets
 * @returns {Promise<void>}
 */
// tslint:disable-next-line:cyclomatic-complexity
// tslint:disable-next-line:max-func-body-length
async function ticketValidation(
    req: Request,
    res: Response,
    purchaseModel: PurchaseModel,
    selectTickets: ISelectTicket[]
): Promise<IReserveTicket[]> {
    if (purchaseModel.salesTickets === null) throw ErrorUtilModule.ErrorType.Property;

    const result: IReserveTicket[] = [];
    //コアAPI券種取得
    const salesTickets = purchaseModel.salesTickets;

    for (const ticket of selectTickets) {
        if (ticket.mvtkNum !== '') {
            // ムビチケ
            if (purchaseModel.mvtk === null) throw ErrorUtilModule.ErrorType.Property;
            const mvtkTicket = purchaseModel.mvtk.find((value) => {
                return (value.code === ticket.mvtkNum && value.ticket.ticketCode === ticket.ticketCode);
            });
            if (mvtkTicket === undefined) throw ErrorUtilModule.ErrorType.Access;
            const reserveTicket: IReserveTicket = {
                section: ticket.section,
                seatCode: ticket.seatCode,
                ticketCode: mvtkTicket.ticket.ticketCode, // チケットコード
                ticketName: (ticket.glasses)
                    ? `${mvtkTicket.ticket.ticketName}${req.__('common.glasses')}`
                    : mvtkTicket.ticket.ticketName, // チケット名
                ticketNameEng: mvtkTicket.ticket.ticketNameEng, // チケット名（英）
                ticketNameKana: mvtkTicket.ticket.ticketNameKana, // チケット名（カナ）
                stdPrice: 0, // 標準単価
                addPrice: mvtkTicket.ticket.addPrice, // 加算単価
                disPrice: 0, // 割引額
                salePrice: (ticket.glasses)
                    ? (<number>mvtkTicket.ticket.addPrice) + (<number>mvtkTicket.ticket.addPriceGlasses)
                    : mvtkTicket.ticket.addPrice, // 販売単価
                ticketNote: '',
                addPriceGlasses: (ticket.glasses)
                    ? mvtkTicket.ticket.addPriceGlasses
                    : 0, // メガネ単価
                glasses: ticket.glasses, // メガネ有り無し
                mvtkAppPrice: Number(mvtkTicket.ykknInfo.kijUnip), // ムビチケ計上単価
                kbnEisyahousiki: mvtkTicket.ykknInfo.eishhshkTyp, // ムビチケ映写方式区分
                mvtkNum: mvtkTicket.code, // ムビチケ購入管理番号
                mvtkKbnDenshiken: mvtkTicket.ykknInfo.dnshKmTyp, // ムビチケ電子券区分
                mvtkKbnMaeuriken: mvtkTicket.ykknInfo.znkkkytsknGkjknTyp, // ムビチケ前売券区分
                mvtkKbnKensyu: mvtkTicket.ykknInfo.ykknshTyp, // ムビチケ券種区分
                mvtkSalesPrice: Number(mvtkTicket.ykknInfo.knshknhmbiUnip) // ムビチケ販売単価
            };
            result.push(reserveTicket);
        } else {
            // 通常券種
            const salesTicket = salesTickets.find((value) => {
                return (value.ticketCode === ticket.ticketCode);
            });
            if (salesTicket === undefined) throw ErrorUtilModule.ErrorType.Access;
            // 制限単位、人数制限判定
            const mismatchTickets: string[] = [];
            const sameTickets = selectTickets.filter((value) => {
                return (value.ticketCode === salesTicket.ticketCode);
            });
            if (sameTickets.length === 0) throw ErrorUtilModule.ErrorType.Access;
            if (salesTicket.limitUnit === '001') {
                if (sameTickets.length % salesTicket.limitCount !== 0) {
                    if (mismatchTickets.indexOf(ticket.ticketCode) === -1) {
                        mismatchTickets.push(ticket.ticketCode);
                    }
                }
            } else if (salesTicket.limitUnit === '002') {
                if (sameTickets.length < salesTicket.limitCount) {
                    if (mismatchTickets.indexOf(ticket.ticketCode) === -1) {
                        mismatchTickets.push(ticket.ticketCode);
                    }
                }
            }

            if (mismatchTickets.length > 0) {
                res.locals.error = JSON.stringify(mismatchTickets);
                throw ErrorUtilModule.ErrorType.Validation;
            }

            result.push({
                section: ticket.section, // 座席セクション
                seatCode: ticket.seatCode, // 座席番号
                ticketCode: salesTicket.ticketCode, // チケットコード
                ticketName: (ticket.glasses)
                    ? `${salesTicket.ticketName}${req.__('common.glasses')}`
                    : salesTicket.ticketName, // チケット名
                ticketNameEng: salesTicket.ticketNameEng, // チケット名（英）
                ticketNameKana: salesTicket.ticketNameKana, // チケット名（カナ）
                stdPrice: salesTicket.stdPrice, // 標準単価
                addPrice: salesTicket.addPrice, // 加算単価
                disPrice: 0, // 割引額
                salePrice: (ticket.glasses)
                    ? (<number>salesTicket.salePrice) + (<number>salesTicket.addGlasses)
                    : salesTicket.salePrice, // 販売単価
                ticketNote: salesTicket.ticketNote,
                addPriceGlasses: (ticket.glasses)
                    ? salesTicket.addGlasses
                    : 0, // メガネ単価
                glasses: ticket.glasses, // メガネ有り無し
                mvtkAppPrice: 0, // ムビチケ計上単価
                kbnEisyahousiki: '00', // ムビチケ映写方式区分
                mvtkNum: '', // ムビチケ購入管理番号
                mvtkKbnDenshiken: '00', // ムビチケ電子券区分
                mvtkKbnMaeuriken: '00', // ムビチケ前売券区分
                mvtkKbnKensyu: '00', // ムビチケ券種区分
                mvtkSalesPrice: 0 // ムビチケ販売単価
            });
        }
    }

    return result;
}
