import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { AwsCognitoService } from '../../../services/aws-cognito/aws-cognito.service';
import { ErrorService } from '../../../services/error/error.service';
import { PurchaseService } from '../../../services/purchase/purchase.service';
import { SasakiService } from '../../../services/sasaki/sasaki.service';
import { SaveType, StorageService } from '../../../services/storage/storage.service';
import { UserService } from '../../../services/user/user.service';

@Component({
    selector: 'app-purchase-transaction',
    templateUrl: './purchase-transaction.component.html',
    styleUrls: ['./purchase-transaction.component.scss']
})
export class PurchaseTransactionComponent implements OnInit {
    public parameters: {
        /**
         * パフォーマンスId
         */
        performanceId?: string;
        /**
         * WAITER許可証トークン
         */
        passportToken?: string;
        /**
         * awsCognitoIdentityId
         */
        identityId?: string;
        /**
         * ネイティブアプリ
         */
        native?: boolean;
        /**
         * 会員
         */
        member?: boolean;
    };
    constructor(
        private storage: StorageService,
        private router: Router,
        private sasaki: SasakiService,
        private purchase: PurchaseService,
        private error: ErrorService,
        private awsCognito: AwsCognitoService,
        private user: UserService
    ) { }

    /**
     * 初期化
     */
    public async ngOnInit() {
        try {
            this.parameters = this.storage.load('parameters', SaveType.Session);
            if (!this.parametersChack()) {
                throw new Error('parameters is undefined');
            }
            this.user.data.native = (this.parameters.native !== undefined)
                ? this.parameters.native
                : false;
            this.user.data.member = (this.parameters.member !== undefined)
                ? this.parameters.member
                : false;
            this.user.save();
            // ticketアプリテスト
            // this.parameters.identityId = 'ap-northeast-1:c93ad6a4-47e6-4023-a078-2a9ea80c15c9';
            if (this.parameters.identityId !== undefined) {
                await this.awsCognito.authenticateWithDeviceId(this.parameters.identityId);
            }
            await this.sasaki.getServices();
            // イベント情報取得
            const individualScreeningEvent = await this.sasaki.event.findIndividualScreeningEvent({
                identifier: (<string>this.parameters.performanceId)
            });
            // 開始可能日判定
            if (!this.purchase.isSalse(individualScreeningEvent)) {
                throw new Error('Unable to start sales');
            }
            const END_TIME = 30;
            // 終了可能日判定
            if (moment().add(END_TIME, 'minutes').unix() > moment(individualScreeningEvent.startDate).unix()) {
                throw new Error('unable to end sales');
            }
            if (this.purchase.data.transaction !== undefined && this.purchase.isExpired()) {
                // 取引期限切れなら購入情報削除
                this.purchase.reset();
            }
            if (this.user.isNative()) {
                // アプリなら購入情報削除
                this.purchase.reset();
            }
            if (this.purchase.data.tmpSeatReservationAuthorization !== undefined) {
                // 重複確認へ
                this.storage.save('individualScreeningEvent', individualScreeningEvent, SaveType.Session);
                this.router.navigate([`/purchase/overlap`]);

                return;
            }

            await this.purchase.transactionStartProcess({
                passportToken: <string>this.parameters.passportToken,
                individualScreeningEvent: individualScreeningEvent
            });
            this.storage.remove('parameters', SaveType.Session);
            this.router.navigate(['/purchase/seat'], { replaceUrl: true });
        } catch (err) {
            this.error.redirect(err);
        }
    }

    /**
     * @method parametersChack
     * @requires {boolean}
     */
    private parametersChack(): boolean {
        let result = true;
        if (this.parameters.passportToken === undefined
            || this.parameters.performanceId === undefined) {
            result = false;
        }

        return result;
    }

}
