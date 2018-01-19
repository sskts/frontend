import { Injectable } from '@angular/core';
import * as COA from '@motionpicture/coa-service';
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as moment from 'moment';
import { TimeFormatPipe } from '../../pipes/time-format/time-format.pipe';
import { SaveType, StorageService } from '../storage/storage.service';
export type IIndividualScreeningEvent = sasaki.factory.event.individualScreeningEvent.IEventWithOffer;

@Injectable()
export class PurchaseService {

    public data: Idata;

    constructor(
        private storage: StorageService
    ) {
        this.load();
    }

    /**
     * 読み込み
     * @method load
     */
    public load() {
        const data: Idata | null = this.storage.load('purchase', SaveType.Local);
        if (data === null) {
            this.data = {
                orderCount: 0
            };

            return;
        }
        this.data = data;
    }

    /**
     * 保存
     * @method save
     */
    public save() {
        this.storage.save('purchase', this.data, SaveType.Local);
    }

    /**
     * リセット
     * @method reset
     */
    public reset() {
        this.data = {
            orderCount: 0
        };
        this.save();
    }

    /**
     * 販売可能時間判定
     * @method isSalseTime
     * @param {IIndividualScreeningEvent} screeningEvent
     * @returns {boolean}
     */
    public isSalseTime(screeningEvent: IIndividualScreeningEvent): boolean {
        const END_TIME = 30; // 30分前

        return (moment().unix() < moment(screeningEvent.startDate).subtract(END_TIME, 'minutes').unix());
    }

    /**
     * 販売可能判定
     * @method isSalse
     * @param {IIndividualScreeningEvent} screeningEvent
     * @returns {boolean}
     */
    public isSalse(screeningEvent: IIndividualScreeningEvent): boolean {
        const PRE_SALE = '1'; // 先行販売

        return (moment(screeningEvent.coaInfo.rsvStartDate).unix() <= moment().unix()
            || screeningEvent.coaInfo.flgEarlyBooking === PRE_SALE);
    }

    /**
     * 劇場名取得
     * @method getTheaterName
     * @returns {string}
     */
    public getTheaterName() {
        const individualScreeningEvent = <IIndividualScreeningEvent>this.data.individualScreeningEvent;

        return individualScreeningEvent.superEvent.location.name.ja;
    }

    /**
     * スクリーン名取得
     * @method getScreenName
     * @returns {string}
     */
    public getScreenName() {
        const individualScreeningEvent = <IIndividualScreeningEvent>this.data.individualScreeningEvent;

        return individualScreeningEvent.location.name.ja;
    }

    /**
     * 作品名取得
     * @method getTitle
     * @returns {string}
     */
    public getTitle() {
        const individualScreeningEvent = <IIndividualScreeningEvent>this.data.individualScreeningEvent;

        return individualScreeningEvent.workPerformed.name;
    }

    /**
     * 鑑賞日取得
     * @method getAppreciationDate
     * @returns {string}
     */
    public getAppreciationDate() {
        const individualScreeningEvent = <IIndividualScreeningEvent>this.data.individualScreeningEvent;
        moment.locale('ja');

        return moment(individualScreeningEvent.startDate).format('YYYY年MM月DD日(ddd)');
    }

    /**
     * 上映開始時間取得
     * @method getStartDate
     * @returns {string}
     */
    public getStartDate() {
        const individualScreeningEvent = <IIndividualScreeningEvent>this.data.individualScreeningEvent;
        const timeFormat = new TimeFormatPipe();

        return timeFormat.transform(
            individualScreeningEvent.coaInfo.dateJouei,
            individualScreeningEvent.startDate
        );
    }

    /**
     * 上映終了取得
     * @method getEndDate
     * @returns {string}
     */
    public getEndDate() {
        const individualScreeningEvent = <IIndividualScreeningEvent>this.data.individualScreeningEvent;
        const timeFormat = new TimeFormatPipe();

        return timeFormat.transform(
            individualScreeningEvent.coaInfo.dateJouei,
            individualScreeningEvent.endDate
        );
    }

}

interface Idata {
    /**
     * 取引
     */
    transaction?: sasaki.factory.transaction.placeOrder.ITransaction;
    /**
     * 上映イベント
     */
    individualScreeningEvent?: IIndividualScreeningEvent;
    /**
     * 劇場ショップ
     */
    movieTheaterOrganization?: sasaki.factory.organization.movieTheater.IPublicFields;
    /**
     * 販売可能チケット情報
     */
    salesTickets?: ISalesTicket[];
    /**
     * 予約座席
     */
    seatReservationAuthorization?: sasaki.factory.action.authorize.seatReservation.IAction;
    /**
     * 予約座席(仮)
     */
    tmpSeatReservationAuthorization?: sasaki.factory.action.authorize.seatReservation.IAction;
    /**
     * GMOオーダーID
     */
    orderId?: string;
    /**
     * GMOオーダー回数
     */
    orderCount: number;
}

export interface ISalesTicket extends COA.services.reserve.ISalesTicketResult {
    glasses: boolean;
    mvtkNum: string;
}
