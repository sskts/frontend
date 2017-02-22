import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as MP from '../../../../libs/MP';

/**
 * 購入セッション
 */

/**
 * ReserveTicket
 * @interface ReserveTicket
 */
export interface ReserveTicket {
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
    ticket_name_ja: string;
    /**
     * チケット名（英）
     */
    ticket_name_en: string;
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
     * todo
     */
    dis_price: number;
    /**
     * 販売単価(標準単価＋加算単価)
     */
    sale_price: number;

}

/**
 * Input
 * @interface Input
 */
export interface Input {
    /**
     * せい
     */
    last_name_hira: string;
    /**
     * めい
     */
    first_name_hira: string;
    /**
     * メールアドレス
     */
    mail_addr: string;
    /**
     * メールアドレス確認
     */
    mail_confirm: string;
    /**
     * 電話番号
     */
    tel_num: string;
    /**
     * 利用規約
     */
    agree: string;

}

/**
 * GMO
 * @interface GMO
 */
export interface GMO {
    /**
     * トークン
     */
    token: string;
}

/**
 * Ticket
 * @interface Ticket
 */
export interface Ticket {
    /**
     * チケット番号
     */
    ticket_code: string;
    /**
     * 標準単価
     */
    std_price: number;
    /**
     * 加算単価
     */
    add_price: number;
    /**
     * 割引額
     */
    dis_price: number;
    /**
     * 金額
     */
    sale_price: number;
    /**
     * ムビチケ計上単価
     */
    mvtk_app_price: number;
    /**
     * 枚数
     */
    ticket_count: number;
    /**
     * 座席番号
     */
    // tslint:disable-next-line:trailing-comma
    seat_num: string;
}

/**
 * 購入セッション
 * @class PurchaseModel
 */
export class PurchaseModel {
    public static SEAT_STATE = 0;
    public static TICKET_STATE = 1;
    public static INPUT_STATE = 2;
    public static CONFIRM_STATE = 3;
    public static COMPLETE_STATE = 4;

    /**
     * パフォーマンス
     */
    public performance: MP.Performance | null;
    /**
     * COA仮予約
     */
    public reserveSeats: COA.reserveSeatsTemporarilyInterface.Result | null;
    /**
     * 予約チケット
     */
    public reserveTickets: ReserveTicket[] | null;
    /**
     * 入力情報
     */
    public input: Input | null;
    /**
     * GMO TOKEN情報
     */
    public gmo: GMO | null;
    /**
     * COA本予約
     */
    public updateReserve: COA.updateReserveInterface.Result | null;
    /**
     * 取引MP
     */
    public transactionMP: MP.TransactionStartResult | null;
    /**
     * 取引GMO
     */
    public transactionGMO: GMO.CreditService.EntryTranResult | null;
    /**
     * COAオーソリ
     */
    public authorizationCOA: MP.AddCOAAuthorizationResult | null;
    /**
     * GMOオーソリ
     */
    public authorizationGMO: MP.AddGMOAuthorizationResult | null;
    /**
     * オーダーID
     */
    public orderId: string | null;
    /**
     * 有効期限
     */
    public expired: number | null;

    /**
     * @memberOf PurchaseModel
     * @constructor
     * @param {any} session
     */
    constructor(session: any) {
        if (!session) {
            session = {};
        }

        this.performance = (session.performance) ? session.performance : null;
        this.reserveSeats = (session.reserveSeats) ? session.reserveSeats : null;
        this.reserveTickets = (session.reserveTickets) ? session.reserveTickets : null;
        this.input = (session.input) ? session.input : null;
        this.gmo = (session.gmo) ? session.gmo : null;
        this.updateReserve = (session.updateReserve) ? session.updateReserve : null;
        this.transactionMP = (session.transactionMP) ? session.transactionMP : null;
        this.transactionGMO = (session.transactionGMO) ? session.transactionGMO : null;
        this.authorizationCOA = (session.authorizationCOA) ? session.authorizationCOA : null;
        this.authorizationGMO = (session.authorizationGMO) ? session.authorizationGMO : null;
        this.orderId = (session.orderId) ? session.orderId : null;
        this.expired = (session.expired) ? session.expired : null;
    }

    /**
     * セッションObjectへ変換
     * @memberOf PurchaseModel
     * @method formatToSession
     * @returns {Object} result
     */
    public formatToSession(): {
        performance: MP.Performance | null,
        reserveSeats: COA.reserveSeatsTemporarilyInterface.Result | null,
        reserveTickets: ReserveTicket[] | null,
        input: Input | null,
        gmo: GMO | null,
        updateReserve: COA.updateReserveInterface.Result | null,
        transactionMP: MP.TransactionStartResult | null,
        transactionGMO: GMO.CreditService.EntryTranResult | null,
        authorizationCOA: MP.AddCOAAuthorizationResult | null,
        authorizationGMO: MP.AddGMOAuthorizationResult | null,
        orderId: string | null,
        expired: number | null
    } {
        return {
            performance: (this.performance) ? this.performance : null,
            reserveSeats: (this.reserveSeats) ? this.reserveSeats : null,
            reserveTickets: (this.reserveTickets) ? this.reserveTickets : null,
            input: (this.input) ? this.input : null,
            gmo: (this.gmo) ? this.gmo : null,
            updateReserve: (this.updateReserve) ? this.updateReserve : null,
            transactionMP: (this.transactionMP) ? this.transactionMP : null,
            transactionGMO: (this.transactionGMO) ? this.transactionGMO : null,
            authorizationCOA: (this.authorizationCOA) ? this.authorizationCOA : null,
            authorizationGMO: (this.authorizationGMO) ? this.authorizationGMO : null,
            orderId: (this.orderId) ? this.orderId : null,
            expired: (this.expired) ? this.expired : null
        };
    }

    /**
     * ステータス確認
     * @memberOf PurchaseModel
     * @method accessAuth
     * @param {number} value
     * @returns {boolean}
     */
    public accessAuth(value: number): boolean {
        let result: boolean = false;
        if (value === PurchaseModel.SEAT_STATE) {
            if (this.transactionMP) result = true;
        } else if (value === PurchaseModel.TICKET_STATE) {
            if (this.transactionMP && this.performance && this.reserveSeats) result = true;
        } else if (value === PurchaseModel.INPUT_STATE) {
            if (this.transactionMP && this.performance && this.reserveSeats && this.reserveTickets) result = true;
        } else if (value === PurchaseModel.CONFIRM_STATE) {
            if (this.transactionMP && this.performance && this.reserveSeats && this.reserveTickets && this.input && this.gmo) result = true;
        } else if (value === PurchaseModel.COMPLETE_STATE) {
            result = true;
        }
        return result;
    }

    /**
     * 合計金額取得
     * @memberOf PurchaseModel
     * @method getReserveAmount
     * @returns {number}
     */
    public getReserveAmount(): number {
        const reserveTickets = this.reserveTickets;
        let amount = 0;
        if (!reserveTickets) return amount;
        for (const ticket of reserveTickets) {
            amount += ticket.sale_price;
        }
        return amount;
    }

    /**
     * チケットリスト返却
     * @memberOf PurchaseModel
     * @method getTicketList
     * @returns {Ticket[]}
     */
    public getTicketList(): Ticket[] {
        const results = [];
        if (!this.reserveTickets) return [];
        for (const ticket of this.reserveTickets) {
            results.push({
                ticket_code: ticket.ticket_code,
                std_price: ticket.std_price,
                add_price: ticket.add_price,
                dis_price: 0,
                sale_price: ticket.sale_price,
                ticket_count: 1,
                mvtk_app_price: 0,
                seat_num: ticket.seat_code
            });
        }
        return results;
    }

    /**
     * 座席文言返却
     * @memberOf PurchaseModel
     * @method seatToString
     * @returns {string}
     */
    public seatToString(): string {
        if (!this.reserveSeats) return '';
        const seats = [];
        for (const seat of this.reserveSeats.list_tmp_reserve) {
            seats.push(seat.seat_num);
        }
        return seats.join('、');
    }

    /**
     * 券種文言返却
     * @memberOf PurchaseModel
     * @method ticketToString
     * @returns {string}
     */
    public ticketToString(): string {
        if (!this.reserveSeats) return '';
        if (!this.reserveTickets) return '';
        const ticketObj: any = {};
        const tickets = [];
        for (const ticket of this.reserveTickets) {
            if (ticketObj[ticket.ticket_code]) {
                ticketObj[ticket.ticket_code].length = ticketObj[ticket.ticket_code].length + 1;
            } 　else {
                ticketObj[ticket.ticket_code] = {
                    name: ticket.ticket_name_ja,
                    length: 1
                };
            }
        }
        for (const key of Object.keys(ticketObj)) {
            const ticket = ticketObj[key];
            tickets.push(`${ticket.name} × ${ticket.length}`);
        }

        return tickets.join('、');
    }
}
