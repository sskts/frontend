/**
 * MPサービス
 * @namespace MP
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as debug from 'debug';
import * as HTTPStatus from 'http-status';
import * as request from 'request-promise-native';

const log = debug('SSKTS');
const endPoint = process.env.MP_ENDPOINT;

/**
 * 時間切れ
 * @const timeout
 */
const timeout = 10000;

/**
 * 言語
 * @interface ILanguage
 */
export interface ILanguage {
    en: string;
    ja: string;
}

/**
 * 劇場詳細
 * @interface ITheater
 */
export interface ITheater {
    id: string;
    attributes: {
        address: ILanguage;
        name: ILanguage;
        name_kana: string;
        gmo: IGMOInfo;
        websites: IWebsites[];
    };
}

/**
 * GMO情報
 * @interface IGMOInfo
 */
export interface IGMOInfo {
    site_id: string;
    shop_id: string;
    shop_pass: string;
}

/**
 * サイト情報
 * @interface IWebsites
 */
export interface IWebsites {
    group: string;
    name: ILanguage;
    url: string;
}

/**
 * スクリーン詳細
 * @interface IScreen
 */
export interface IScreen {
    id: string;
    attributes: {
        coa_screen_code: string;
        name: ILanguage;
        seats_numbers_by_seat_grade: any[];
        sections: ISection[];
        theater: string;
    };
}

/**
 * セクション
 * @interface ISection
 */
export interface ISection {
    code: string;
    name: ILanguage;
    seats: ISeat[];
}

/**
 * 座席
 * @interface ISeat
 */
export interface ISeat {
    code: string;
}

/**
 * 作品詳細
 * @interface IFilm
 */
export interface IFilm {
    id: string;
    attributes: {
        coa_title_branch_num: string;
        coa_title_code: string;
        created_at: string;
        date_end: string;
        date_start: string;
        film_branch_code: string;
        film_group: string;
        kbn_eirin: string;
        kbn_eizou: string;
        kbn_jimakufukikae: string;
        kbn_joueihousiki: string;
        minutes: number;
        name: ILanguage;
        name_kana: string;
        name_original: string;
        name_short: string;
        theater: string;
        flg_mvtk_use: string;
        date_mvtk_begin: string;
    };
}

/**
 * パフォーマンス詳細
 * @interface IPerformance
 */
export interface IPerformance {
    id: string;
    attributes: {
        canceled: boolean,
        day: string,
        film: {
            id: string;
            name: ILanguage;
            name_kana: string;
            name_short: string;
            name_original: string;
            minutes: number;
        },
        screen: {
            id: string;
            name: ILanguage;
        },
        theater: {
            id: string;
            name: ILanguage;
        },
        time_end: string;
        time_start: string;
        coa_trailer_time: number;
        coa_kbn_service: string;
        coa_kbn_acoustic: string;
        coa_name_service_day: string;
        coa_available_num: string;
        coa_rsv_start_date: string;
        coa_rsv_end_date: string;
        coa_flg_early_booking: string;
    };
}

/**
 * エラー
 * @function errorHandler
 * @param {any} response
 * @requires {void}
 */
function errorHandler(response: any): void {
    if (response.statusCode === HTTPStatus.NOT_FOUND) {
        console.error('NOT_FOUND');
        throw new Error('NOT_FOUND');
    }
    let message: string = '';
    if (response.body.errors !== undefined && Array.isArray(response.body.errors)) {
        for (const error of response.body.errors) {
            if (error.description !== undefined) {
                message = error.description;
                break;
            }
        }
        console.error(response.body.errors);
    }
    throw new Error(message);
}

/**
 * アクセストークン取得
 * @memberOf MP
 * @function oauthToken
 * @requires {Promise<Performance[]>}
 */
export async function oauthToken(): Promise<string> {
    const response = await request.post({
        url: `${endPoint}/oauth/token`,
        body: {
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();

    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    log('oauthToken:', response.body.access_token);
    return response.body.access_token;
}

/**
 * 劇場取得
 * @memberOf MP
 * @function getTheater
 * @param {GetTheaterArgs} args
 * @requires {Promise<ITheater>}
 */
export async function getTheater(id: string): Promise<ITheater> {
    log('getTheater args:', id);
    const response = await request.get({
        url: `${endPoint}/theaters/${id}`,
        auth: { bearer: await oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    log('getTheater:', response.body.data);
    return response.body.data;
}

/**
 * スクリーン取得
 * @memberOf MP
 * @function getScreen
 * @param {GetScreenArgs} args
 * @requires {Promise<Screen>}
 */
export async function getScreen(id: string): Promise<IScreen> {
    log('getScreen args:', id);
    const response = await request.get({
        url: `${endPoint}/screens/${id}`,
        auth: { bearer: await oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    log('getScreen:', response.body.data);
    return response.body.data;
}

/**
 * 作品取得
 * @memberOf MP
 * @function getFilm
 * @param {GetFilmArgs} args
 * @requires {Promise<IFilm>}
 */
export async function getFilm(id: string): Promise<IFilm> {
    log('getFilm args:', id);
    const response = await request.get({
        url: `${endPoint}/films/${id}`,
        auth: { bearer: await oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    log('getFilm:', response.body.data);
    return response.body.data;
}

/**
 * パフォーマンス一覧取得
 * @memberOf MP
 * @function getPerformances
 * @param {string} theater 劇場コード
 * @param {string} day 日付
 * @requires {Promise<IPerformance[]>}
 */
export async function getPerformances(theater: string, day: string): Promise<IPerformance[]> {
    log('getPerformances args:', theater, day);
    const response = await request.get({
        url: `${endPoint}/performances`,
        auth: { bearer: await oauthToken() },
        qs: {
            theater: theater,
            day: day
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    // log('performances:', response.body.data);
    return response.body.data;
}

/**
 * パフォーマンス取得
 * @memberOf MP
 * @function getPerformance
 * @param {GetPerformanceArgs} args
 * @requires {Promise<IPerformance>}
 */
export async function getPerformance(id: string): Promise<IPerformance> {
    log('getPerformance args:', id);
    const response = await request.get({
        url: `${endPoint}/performances/${id}`,
        auth: { bearer: await oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    log('performance:', response.body.data);
    return response.body.data;
}

/**
 * 取引開始in
 * @memberOf MP
 * @interface ITransactionStartArgs
 */
export interface ITransactionStartArgs {
    expires_at: number;
}
/**
 * 取引開始out
 * @memberOf MP
 * @interface ITransactionStartResult
 */
export interface ITransactionStartResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
    attributes: {
        id: string,
        status: string,
        events: any[],
        owners: IOwner[],
        queues: any[],
        expired_at: string,
        inquiry_id: string,
        inquiry_pass: string,
        queues_status: string
    };
}

interface IOwner {
    id: string;
    group: string;
}

/**
 * 取引開始
 * @memberOf MP
 * @function transactionStart
 * @param {TransactionStartArgs} args
 * @returns {Promise<ITransactionStartResult>}
 */
export async function transactionStart(args: ITransactionStartArgs): Promise<ITransactionStartResult> {
    log('transactionStart args:', args);
    const response = await request.post({
        url: `${endPoint}/transactions/startIfPossible`,
        auth: { bearer: await oauthToken() },
        body: {
            expires_at: args.expires_at
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    log('--------------------transaction:', response.body);
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    const transaction = response.body.data;
    log('transaction:', transaction);

    return transaction;
}

/**
 * COAオーソリ追加in
 * @memberOf MP
 * @interface IAddCOAAuthorizationArgs
 */
export interface IAddCOAAuthorizationArgs {
    transaction: ITransactionStartResult;
    reserveSeatsTemporarilyResult: COA.ReserveService.IUpdTmpReserveSeatResult;
    salesTicketResults: IReserveTicket[];
    performance: IPerformance;
    performanceCOA: IPerformanceCOA;
    price: number;

}

/**
 * 予約チケット情報
 * @interface IReserveTicket
 */
export interface IReserveTicket {
    /**
     * 座席セクション
     */
    section: string;
    /**
     * 座席番号
     */
    seat_code: string;
    /**
     * チケットコード
     */
    ticket_code: string;
    /**
     * チケット名
     */
    ticket_name: string;
    /**
     * チケット名（英）
     */
    ticket_name_eng: string;
    /**
     * チケット名（カナ）
     */
    ticket_name_kana: string;
    /**
     * 標準単価
     */
    std_price: number;
    /**
     * 加算単価(３Ｄ，ＩＭＡＸ、４ＤＸ等の加算料金)
     */
    add_price: number;
    /**
     * 割引額
     */
    dis_price: number;
    /**
     * 販売単価(標準単価＋加算単価)
     */
    sale_price: number;
    /**
     * メガネ単価
     */
    add_price_glasses: number;
    /**
     * メガネ有り無し(現状ムビチケ)
     */
    glasses: boolean;
    /**
     * ムビチケ購入番号
     */
    mvtk_num: string | null;
    /**
     * ムビチケ計上単価
     */
    mvtk_app_price: number;
}

/**
 * COAオーソリ追加out
 * @memberOf MP
 * @interface IAddCOAAuthorizationResult
 */
export interface IAddCOAAuthorizationResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
}
/**
 * COAオーソリ追加
 * @memberOf MP
 * @function addCOAAuthorization
 * @param {IAddCOAAuthorizationArgs} args
 * @returns {Promise<IAddCOAAuthorizationResult>}
 */
export async function addCOAAuthorization(args: IAddCOAAuthorizationArgs): Promise<IAddCOAAuthorizationResult> {
    log('addCOAAuthorization args:', args);
    const promoterOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'PROMOTER');
    });
    const promoterOwnerId = (promoterOwner !== undefined) ? promoterOwner.id : null;
    const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'ANONYMOUS');
    });
    const anonymousOwnerId = (anonymousOwner !== undefined) ? anonymousOwner.id : null;

    const response = await request.post({
        url: `${endPoint}/transactions/${args.transaction.id}/authorizations/coaSeatReservation`,
        auth: { bearer: await oauthToken() },
        body: {
            owner_from: promoterOwnerId,
            owner_to: anonymousOwnerId,
            coa_tmp_reserve_num: args.reserveSeatsTemporarilyResult.tmp_reserve_num,
            coa_theater_code: args.performanceCOA.theaterCode,
            coa_date_jouei: args.performance.attributes.day,
            coa_title_code: args.performanceCOA.titleCode,
            coa_title_branch_num: args.performanceCOA.titleBranchNum,
            coa_time_begin: args.performance.attributes.time_start,
            coa_screen_code: args.performanceCOA.screenCode,
            seats: args.salesTicketResults.map((tmpReserve) => {
                return {
                    performance: args.performance.id,
                    section: tmpReserve.section,
                    seat_code: tmpReserve.seat_code,
                    ticket_code: tmpReserve.ticket_code,
                    ticket_name_ja: tmpReserve.ticket_name,
                    ticket_name_en: tmpReserve.ticket_name_eng,
                    ticket_name_kana: tmpReserve.ticket_name_kana,
                    std_price: tmpReserve.std_price,
                    add_price: tmpReserve.add_price,
                    dis_price: tmpReserve.dis_price,
                    sale_price: tmpReserve.sale_price,
                    mvtk_app_price: tmpReserve.mvtk_app_price,
                    add_glasses: tmpReserve.add_price_glasses
                };
            }),
            price: args.price
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);

    log('addCOAAuthorization result');
    return response.body.data;
}

/**
 * COAオーソリ削除in
 * @memberOf MP
 * @interface IRemoveCOAAuthorizationArgs
 */
export interface IRemoveCOAAuthorizationArgs {
    transactionId: string;
    coaAuthorizationId: string;
}
/**
 * COAオーソリ削除
 * @memberOf MP
 * @function removeCOAAuthorization
 * @param {IRemoveCOAAuthorizationArgs} args
 * @requires {Promise<void>}
 */
export async function removeCOAAuthorization(args: IRemoveCOAAuthorizationArgs): Promise<void> {
    log('removeCOAAuthorization args:', args);
    const response = await request.del({
        url: `${endPoint}/transactions/${args.transactionId}/authorizations/${args.coaAuthorizationId}`,
        auth: { bearer: await oauthToken() },
        body: {
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) errorHandler(response);

    log('addCOAAuthorization result');
}

/**
 * GMOオーソリ追加in
 * @memberOf MP
 * @interface AddGMOAuthorizationArgs
 */
export interface IAddGMOAuthorizationArgs {
    transaction: ITransactionStartResult;
    orderId: string;
    amount: number;
    entryTranResult: GMO.CreditService.EntryTranResult;
    gmoShopId: string;
    gmoShopPassword: string;
}
/**
 * GMOオーソリ追加out
 * @memberOf MP
 * @interface IAddGMOAuthorizationResult
 */
export interface IAddGMOAuthorizationResult {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    id: string;
}
/**
 * GMOオーソリ追加
 * @memberOf MP
 * @function addGMOAuthorization
 * @param {IAddGMOAuthorizationArgs} args
 * @requires {Promise<IAddGMOAuthorizationResult>}
 */
export async function addGMOAuthorization(args: IAddGMOAuthorizationArgs): Promise<IAddGMOAuthorizationResult> {
    log('addGMOAuthorization args:', args);
    const promoterOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'PROMOTER');
    });
    const promoterOwnerId = (promoterOwner !== undefined) ? promoterOwner.id : null;
    const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'ANONYMOUS');
    });
    const anonymousOwnerId = (anonymousOwner !== undefined) ? anonymousOwner.id : null;

    const response = await request.post({
        url: `${endPoint}/transactions/${args.transaction.id}/authorizations/gmo`,
        auth: { bearer: await oauthToken() },
        body: {
            owner_from: anonymousOwnerId,
            owner_to: promoterOwnerId,
            gmo_shop_id: args.gmoShopId,
            gmo_shop_pass: args.gmoShopPassword,
            gmo_order_id: args.orderId,
            gmo_amount: args.amount,
            gmo_access_id: args.entryTranResult.accessId,
            gmo_access_pass: args.entryTranResult.accessPass,
            gmo_job_cd: GMO.Util.JOB_CD_SALES,
            gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);

    log('addGMOAuthorization result:');
    return response.body.data;
}

/**
 * GMOオーソリ削除in
 * @memberOf MP
 * @interface IRemoveGMOAuthorizationArgs
 */
export interface IRemoveGMOAuthorizationArgs {
    transactionId: string;
    gmoAuthorizationId: string;
}
/**
 * GMOオーソリ削除
 * @memberOf MP
 * @function removeGMOAuthorization
 * @param {IRemoveGMOAuthorizationArgs} args
 * @returns {Promise<void>}
 */
export async function removeGMOAuthorization(args: IRemoveGMOAuthorizationArgs): Promise<void> {
    log('removeGMOAuthorization args:', args);
    const response = await request.del({
        url: `${endPoint}/transactions/${args.transactionId}/authorizations/${args.gmoAuthorizationId}`,
        auth: { bearer: await oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) errorHandler(response);

    log('removeGMOAuthorization result:');
}

/**
 * 購入者情報登録in
 * @memberOf MP
 * @interface OwnersAnonymousArgs
 */
export interface IOwnersAnonymousArgs {
    transactionId: string;
    name_first: string;
    name_last: string;
    tel: string;
    email: string;
}
/**
 * 購入者情報登録
 * @memberOf MP
 * @function ownersAnonymous
 * @param {IOwnersAnonymousArgs} args
 * @returns {Promise<void>}
 */
export async function ownersAnonymous(args: IOwnersAnonymousArgs): Promise<void> {
    log('ownersAnonymous args:', args);
    const response = await request.patch({
        url: `${endPoint}/transactions/${args.transactionId}/anonymousOwner`,
        auth: { bearer: await oauthToken() },
        body: {
            name_first: args.name_first,
            name_last: args.name_last,
            tel: args.tel,
            email: args.email
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) errorHandler(response);

    log('ownersAnonymous result:');
}

/**
 * 照会情報登録in
 * @memberOf MP
 * @interface ITransactionsEnableInquiryArgs
 */
export interface ITransactionsEnableInquiryArgs {
    transactionId: string;
    inquiry_theater: string;
    inquiry_id: number;
    inquiry_pass: string;
}
/**
 * 照会情報登録(購入番号と電話番号で照会する場合)
 * @memberOf MP
 * @function transactionsEnableInquiry
 * @param {ITransactionsEnableInquiryArgs} args
 * @returns {Promise<void>}
 */
export async function transactionsEnableInquiry(args: ITransactionsEnableInquiryArgs): Promise<void> {
    log('transactionsEnableInquiry args:', args);
    const response = await request.patch({
        url: `${endPoint}/transactions/${args.transactionId}/enableInquiry`,
        auth: { bearer: await oauthToken() },
        body: {
            inquiry_theater: args.inquiry_theater,
            inquiry_id: args.inquiry_id,
            inquiry_pass: args.inquiry_pass
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) errorHandler(response);

    log('transactionsEnableInquiry result:');
}

/**
 * 取引成立in
 * @memberOf MP
 * @interface ITransactionCloseArgs
 */
export interface ITransactionCloseArgs {
    transactionId: string;
}
/**
 * 取引成立
 * @memberOf MP
 * @function transactionClose
 * @param {ITransactionCloseArgs} args
 * @returns {Promise<void>}
 */
export async function transactionClose(args: ITransactionCloseArgs): Promise<void> {
    log('transactionClose args:', args);
    const response = await request.patch({
        url: `${endPoint}/transactions/${args.transactionId}/close`,
        auth: { bearer: await oauthToken() },
        body: {

        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) errorHandler(response);
    log('close result:');
}

/**
 * メール追加in
 * @memberOf MP
 * @interface IAddEmailArgs
 */
export interface IAddEmailArgs {
    transactionId: string;
    // tslint:disable-next-line:no-reserved-keywords
    from: string;
    to: string;
    subject: string;
    content: string;
}
/**
 * メール追加out
 * @memberOf MP
 * @interface IAddEmailResult
 */
export interface IAddEmailResult {
    id: string;
}
/**
 * メール追加
 * @memberOf MP
 * @function addEmail
 * @param {IAddEmailArgs} args
 * @returns {Promise<IAddEmailResult>}
 */
export async function addEmail(args: IAddEmailArgs): Promise<IAddEmailResult> {
    log('addEmail args:', args);
    const response = await request.post({
        url: `${endPoint}/transactions/${args.transactionId}/notifications/email`,
        auth: { bearer: await oauthToken() },
        body: {
            from: args.from,
            to: args.to,
            subject: args.subject,
            content: args.content
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    log('addEmail result:' + (<string>response.body.data));
    return response.body.data;
}

/**
 * メール削除in
 * @memberOf MP
 * @interface IRemoveEmailArgs
 */
export interface IRemoveEmailArgs {
    transactionId: string;
    emailId: string;
}
/**
 * メール削除
 * @memberOf MP
 * @function removeEmail
 * @param {IRemoveEmailArgs} args
 * @returns {Promise<void>}
 */
export async function removeEmail(args: IRemoveEmailArgs): Promise<void> {
    log('removeEmail args:', args);
    const response = await request.del({
        url: `${endPoint}/transactions/${args.transactionId}/notifications/${args.emailId}`,
        auth: { bearer: await oauthToken() },
        body: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.NO_CONTENT) errorHandler(response);
    log('removeEmail result:');
}

/**
 * 照会取引情報取得in
 * @memberOf MP
 * @interface makeInquiry
 */
export interface IMakeInquiryArgs {
    inquiry_theater: string;
    inquiry_id: number;
    inquiry_pass: string;
}
/**
 * 照会取引情報取得
 * @memberOf MP
 * @function makeInquiry
 * @param {IMakeInquiryArgs} args
 * @returns {Promise<string>}
 */
export async function makeInquiry(args: IMakeInquiryArgs): Promise<string> {
    log('makeInquiry args:', args);
    const response = await request.post({
        url: `${endPoint}/transactions/makeInquiry`,
        auth: { bearer: await oauthToken() },
        body: {
            inquiry_theater: args.inquiry_theater,
            inquiry_id: args.inquiry_id,
            inquiry_pass: args.inquiry_pass
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    log(response.body)
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    log('makeInquiry result:' + (<string>response.body.data));
    return response.body.data.id;
}

/**
 * CAO情報
 * @memberOf MP
 * @interface IPerformanceCOA
 */
export interface IPerformanceCOA {
    theaterCode: string;
    screenCode: string;
    titleCode: string;
    titleBranchNum: string;
    flgMvtkUse: string;
    dateMvtkBegin: string;
}

/**
 * COA情報取得
 * @memberOf MP
 * @function getPerformanceCOA
 * @param {string} theater 劇場id
 * @param {string} screenId スクリーンid
 * @param {string} filmId 作品id
 * @returns {Promise<ICOAPerformance>}
 */
export async function getPerformanceCOA(theaterId: string, screenId: string, filmId: string): Promise<IPerformanceCOA> {
    log('getPerformanceCOA args:', theaterId, screenId, filmId);
    const theater = await getTheater(theaterId);
    log('劇場取得');
    const screen = await getScreen(screenId);
    log('スクリーン取得');
    const film = await getFilm(filmId);
    log('作品取得');
    return {
        theaterCode: theater.id,
        screenCode: screen.attributes.coa_screen_code,
        titleCode: film.attributes.coa_title_code,
        titleBranchNum: film.attributes.coa_title_branch_num,
        flgMvtkUse: film.attributes.flg_mvtk_use,
        dateMvtkBegin: film.attributes.date_mvtk_begin
    };
}

/**
 * ムビチケ購入管理番号情報
 */
export interface IMvtkPurchaseNoInfo {
    KNYKNR_NO: string;
    PIN_CD: string;
    KNSH_INFO: IMvtkTicket[];
}

/**
 * ムビチケ券種情報
 */
export interface IMvtkTicket {
    KNSH_TYP: string;
    MI_NUM: string;
}

/**
 * ムビチケ座席情報
 */
export interface IMvtkSeat {
    ZSK_CD: string;
}

/**
 * 照会取引情報取得in
 * @interface IAuthorizationsMvtkArgs
 */
export interface IAuthorizationsMvtkArgs {
    transaction: ITransactionStartResult; // 取引情報
    amount: number; // 合計金額
    kgygishCd: string; // 興行会社コード
    yykDvcTyp: string; // 予約デバイス区分
    trkshFlg: string; // 取消フラグ
    kgygishSstmZskyykNo: string; // 興行会社システム座席予約番号
    kgygishUsrZskyykNo: string; // 興行会社ユーザー座席予約番号
    jeiDt: string; // 上映日時
    kijYmd: string; // 計上年月日
    stCd: string; // サイトコード
    screnCd: string; // スクリーンコード
    knyknrNoInfo: IMvtkPurchaseNoInfo[]; // 購入管理番号情報
    zskInfo: IMvtkSeat[]; // 座席情報（itemArray）
    skhnCd: string; // 作品コード

}
/**
 * 照会取引情報取得
 * @memberOf MP
 * @function makeInquiry
 * @param {IMakeInquiryArgs} args
 * @returns {Promise<void>}
 */
export async function authorizationsMvtk(args: IAuthorizationsMvtkArgs): Promise<void> {
    log('authorizationsMvtk args:', args);
    const promoterOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'PROMOTER');
    });
    const promoterOwnerId = (promoterOwner !== undefined) ? promoterOwner.id : null;
    const anonymousOwner = args.transaction.attributes.owners.find((owner) => {
        return (owner.group === 'ANONYMOUS');
    });
    const anonymousOwnerId = (anonymousOwner !== undefined) ? anonymousOwner.id : null;
    const response = await request.post({
        url: `${endPoint}/transactions/${args.transaction.id}/authorizations/mvtk`,
        auth: { bearer: await oauthToken() },
        body: {
            owner_from: anonymousOwnerId,
            owner_to: promoterOwnerId,
            price: args.amount,
            kgygish_cd: args.kgygishCd,
            yyk_dvc_typ: args.yykDvcTyp,
            trksh_flg: args.trkshFlg,
            kgygish_sstm_zskyyk_no: args.kgygishSstmZskyykNo,
            kgygish_usr_zskyyk_no: args.kgygishUsrZskyykNo,
            jei_dt: args.jeiDt,
            kij_ymd: args.kijYmd,
            st_cd: args.stCd,
            scren_cd: args.screnCd,
            knyknr_no_info: args.knyknrNoInfo.map((purchaseNoInfo) => {
                return {
                    knyknr_no: purchaseNoInfo.KNYKNR_NO,
                    pin_cd: purchaseNoInfo.PIN_CD,
                    knsh_info: purchaseNoInfo.KNSH_INFO.map((ticketInfo) => {
                        return { knsh_typ: ticketInfo.KNSH_TYP, mi_num: ticketInfo.MI_NUM };
                    })
                };
            }),
            zsk_info: args.zskInfo.map((seat) => {
                return { zsk_cd: seat.ZSK_CD };
            }),
            skhn_cd: args.screnCd
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        timeout: timeout
    }).promise();
    if (response.statusCode !== HTTPStatus.OK) errorHandler(response);
    log('authorizationsMvtk result:');
    return;
}
