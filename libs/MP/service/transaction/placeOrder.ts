/**
 * 注文取引サービス
 *
 * @namespace service.transaction.placeOrder
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as httpStatus from 'http-status';
import apiRequest from '../../apiRequest';

import OAuth2client from '../../auth/oAuth2client';

/**
 * 取引を開始する
 * 開始できない場合(混雑中など)、nullが返されます。
 */
export async function start(args: {
    auth: OAuth2client;
    expires: Date; // 取引期限
    sellerId: string; // ショップID
}): Promise<sskts.factory.transaction.ITransaction> {
    return await apiRequest({
        uri: '/transactions/placeOrder/start',
        method: 'POST',
        expectedStatusCodes: [httpStatus.NOT_FOUND, httpStatus.OK],
        auth: { bearer: await args.auth.getAccessToken() },
        body: {
            expires: args.expires.valueOf(),
            sellerId: args.sellerId
        }
    });
}

export interface IOffer {
    seatSection: string;
    seatNumber: string;
    ticket: {
        ticketCode: string;
        stdPrice: number;
        addPrice: number;
        disPrice: number;
        salePrice: number;
        mvtkAppPrice: number;
        ticketCount: number;
        seatNum: string;
        addGlasses: number;
        kbnEisyahousiki: string;
        mvtkNum: string;
        mvtkKbnDenshiken: string;
        mvtkKbnMaeuriken: string;
        mvtkKbnKensyu: string;
        mvtkSalesPrice: number;
    };
}

/**
 * 取引に座席予約を追加する
 */
export async function createSeatReservationAuthorization(args: {
    auth: OAuth2client;
    transactionId: string;
    eventIdentifier: string;
    offers: IOffer[];
}): Promise<sskts.factory.authorization.seatReservation.IAuthorization> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/seatReservationAuthorization`,
        method: 'POST',
        expectedStatusCodes: [httpStatus.CREATED],
        auth: { bearer: await args.auth.getAccessToken() },
        body: {
            eventIdentifier: args.eventIdentifier,
            offers: args.offers
        }
    });
}

/**
 * 座席予約取消
 */
export async function cancelSeatReservationAuthorization(args: {
    auth: OAuth2client;
    transactionId: string;
    authorizationId: string;
}): Promise<void> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/seatReservationAuthorization/${args.authorizationId}`,
        method: 'DELETE',
        expectedStatusCodes: [httpStatus.NO_CONTENT],
        auth: { bearer: await args.auth.getAccessToken() }
    });
}

export interface ICreditCardRaw {
    cardNo: string;
    expire: string;
    securityCode: string;
}
export type ICreditCardTokenized = string; // トークン決済の場合こちら
export interface ICreditCardOfMember {
    cardSeq: number;
    cardPass?: string;
}
export type ICreditCard = ICreditCardRaw | ICreditCardTokenized | ICreditCardOfMember;

/**
 * クレジットカードのオーソリを取得する
 */
export async function createCreditCardAuthorization(args: {
    auth: OAuth2client;
    transactionId: string;
    orderId: string;
    amount: number;
    method: string;
    creditCard: sskts.service.transaction.placeOrder.ICreditCard4authorization;
}): Promise<sskts.factory.authorization.gmo.IAuthorization> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/paymentInfos/creditCard`,
        method: 'POST',
        expectedStatusCodes: [httpStatus.CREATED],
        auth: { bearer: await args.auth.getAccessToken() },
        body: {
            orderId: args.orderId,
            amount: args.amount,
            method: args.method,
            creditCard: args.creditCard
        }
    });
}

/**
 * クレジットカードオーソリ取消
 */
export async function cancelCreditCardAuthorization(args: {
    auth: OAuth2client;
    transactionId: string;
    authorizationId: string;
}): Promise<void> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/paymentInfos/creditCard/${args.authorizationId}`,
        method: 'DELETE',
        expectedStatusCodes: [httpStatus.NO_CONTENT],
        auth: { bearer: await args.auth.getAccessToken() }
    });
}

export type IMvtk = sskts.factory.authorization.mvtk.IResult & {
    price: number;
};

/**
 * 決済方法として、ムビチケを追加する
 */
export async function createMvtkAuthorization(args: {
    auth: OAuth2client;
    transactionId: string;
    mvtk: IMvtk;
}): Promise<sskts.factory.authorization.mvtk.IAuthorization> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/paymentInfos/mvtk`,
        method: 'POST',
        expectedStatusCodes: [httpStatus.CREATED],
        auth: { bearer: await args.auth.getAccessToken() },
        body: args.mvtk
    });
}

/**
 * ムビチケ取消
 */
export async function cancelMvtkAuthorization(args: {
    auth: OAuth2client;
    transactionId: string;
    authorizationId: string;
}): Promise<void> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/paymentInfos/mvtk/${args.authorizationId}`,
        method: 'DELETE',
        expectedStatusCodes: [httpStatus.NO_CONTENT],
        auth: { bearer: await args.auth.getAccessToken() }
    });
}

export interface IAgentProfile {
    givenName: string;
    familyName: string;
    telephone: string;
    email: string;
}

/**
 * 購入者情報登録
 */
export async function setAgentProfile(args: {
    auth: OAuth2client;
    transactionId: string;
    profile: IAgentProfile;
}): Promise<void> {
    await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/agent/profile`,
        method: 'PUT',
        expectedStatusCodes: [httpStatus.NO_CONTENT],
        auth: { bearer: await args.auth.getAccessToken() },
        body: args.profile
    });
}

/**
 * 取引確定
 */
export async function confirm(args: {
    auth: OAuth2client;
    transactionId: string;
}): Promise<sskts.factory.order.IOrder> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/confirm`,
        method: 'POST',
        expectedStatusCodes: [httpStatus.CREATED],
        auth: { bearer: await args.auth.getAccessToken() }
    });
}

export interface IEmailNotification {
    // tslint:disable-next-line:no-reserved-keywords
    from: string;
    to: string;
    subject: string;
    content: string;
}

/**
 * 確定した取引に関して、購入者にメール通知を送信する
 */
export async function sendEmailNotification(args: {
    auth: OAuth2client;
    transactionId: string;
    emailNotification: IEmailNotification
}): Promise<sskts.factory.order.IOrder> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/tasks/sendEmailNotification`,
        method: 'POST',
        expectedStatusCodes: [httpStatus.NO_CONTENT],
        auth: { bearer: await args.auth.getAccessToken() },
        body: args.emailNotification
    });
}
