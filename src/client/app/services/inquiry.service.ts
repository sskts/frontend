import { Injectable } from '@angular/core';
import { factory } from '@cinerino/sdk';
import { CinerinoService } from './cinerino.service';
import { SaveType, StorageService } from './storage.service';


export interface IInquiryData {
    /**
     * 注文
     */
    order?: factory.order.IOrder;
    /**
     * 販売者
     */
    seller?: factory.chevre.seller.ISeller;
}


@Injectable({
    providedIn: 'root'
})
export class InquiryService {

    public data: IInquiryData;

    constructor(
        private storage: StorageService,
        private sasakiService: CinerinoService
    ) {
        this.load();
    }

    /**
     * 読み込み
     * @method load
     */
    public load() {
        const data: IInquiryData | null = this.storage.load('inquiry', SaveType.Session);
        if (data === null) {
            this.data = {};

            return;
        }
        this.data = data;
    }

    /**
     * 保存
     * @method save
     */
    public save() {
        this.storage.save('inquiry', this.data, SaveType.Session);
    }

    /**
     * リセット
     * @method reset
     */
    public reset() {
        this.data = {};
        this.save();
    }

    /**
     * 販売者検索
     */
    public async searchSeller(branchCode: string) {
        await this.sasakiService.getServices();
        const result = await this.sasakiService.seller.search({
            branchCode: { $eq: branchCode }
        });
        return result;
    }

    /**
     * 照会
     */
    public async findByOrderInquiryKey(params: {
        theaterCode: string;
        confirmationNumber: string;
        telephone: string;
    }) {
        await this.sasakiService.getServices();
        const findResult = await this.sasakiService.order.findByOrderInquiryKey4sskts(params);
        const order = (Array.isArray(findResult)) ? findResult[0] : findResult;
        return order;
    }

}
