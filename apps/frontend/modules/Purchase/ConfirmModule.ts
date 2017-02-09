import express = require('express');
import PurchaseSession = require('../../models/Purchase/PurchaseModel');
import COA = require("@motionpicture/coa-service");
import MP = require('../../../../libs/MP');
import moment = require('moment');

export namespace Module {
    /**
     * 購入者内容確認
     */
    export function index(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.accessAuth(PurchaseSession.PurchaseModel.CONFIRM_STATE)) return next(new Error(req.__('common.error.access')));
        if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));

        //購入者内容確認表示
        res.locals['gmoTokenObject'] = (purchaseModel.gmo) ? purchaseModel.gmo : null;
        res.locals['input'] = purchaseModel.input;
        res.locals['performance'] = purchaseModel.performance;
        res.locals['reserveSeats'] = purchaseModel.reserveSeats;
        res.locals['reserveTickets'] = purchaseModel.reserveTickets;
        res.locals['step'] = PurchaseSession.PurchaseModel.CONFIRM_STATE;
        res.locals['price'] = purchaseModel.getReserveAmount();
        res.locals['updateReserve'] = null;
        res.locals['error'] = null;
        res.locals['transactionId'] = purchaseModel.transactionMP._id;
        

        //セッション更新
        if (!req.session) return next(req.__('common.error.property'));
        req.session['purchase'] = purchaseModel.formatToSession();

        return res.render('purchase/confirm');

    }

    /**
     * 座席本予約
     */
    async function updateReserve(req: express.Request, purchaseModel: PurchaseSession.PurchaseModel): Promise<void> {
        if (!purchaseModel.performance) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.reserveSeats) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.input) throw new Error(req.__('common.error.property'));
        if (!purchaseModel.transactionMP) throw Error(req.__('common.error.property'));
        if (!purchaseModel.expired) throw Error(req.__('common.error.property'));
        //購入期限切れ
        if (purchaseModel.expired < moment().add(5, 'minutes').unix()) {
            throw {
                error: new Error(req.__('common.error.expire')),
                type: 'expired'
            };
        }

        
            

        let performance = purchaseModel.performance;
        let reserveSeats = purchaseModel.reserveSeats;
        let input = purchaseModel.input;

        try {
            // COA本予約
            purchaseModel.updateReserve = await COA.updateReserveInterface.call({
                /** 施設コード */
                theater_code: performance.attributes.theater._id,
                /** 上映日 */
                date_jouei: performance.attributes.day,
                /** 作品コード */
                title_code: performance.attributes.film.coa_title_code,
                /** 作品枝番 */
                title_branch_num: performance.attributes.film.coa_title_branch_num,
                /** 上映時刻 */
                time_begin: performance.attributes.time_start,
                /** 座席チケット仮予約番号 */
                tmp_reserve_num: reserveSeats.tmp_reserve_num,
                /** 予約者名 */
                reserve_name: `${input.last_name_hira}　${input.first_name_hira}`,
                /** 予約者名（かな） */
                reserve_name_jkana: `${input.last_name_hira}　${input.first_name_hira}`,
                /** 電話番号 */
                tel_num: input.tel_num,
                /** メールアドレス */
                mail_addr: input.mail_addr,
                /** 予約金額 */
                reserve_amount: purchaseModel.getReserveAmount(),
                /** 価格情報リスト */
                list_ticket: purchaseModel.getTicketList(),
            });
            console.log('COA本予約', purchaseModel.updateReserve);
        } catch (err) {
            throw {
                error: new Error(err.message),
                type: 'updateReserve'
            };
        }

        // MP購入者情報登録
        await MP.ownersAnonymous.call({
            transactionId: purchaseModel.transactionMP._id,
            name_first: input.first_name_hira,
            name_last: input.last_name_hira,
            tel: input.tel_num,
            email: input.mail_addr,
        });
        console.log('MP購入者情報登録');

        // MP照会情報登録
        await MP.transactionsEnableInquiry.call({
            transactionId: purchaseModel.transactionMP._id,
            inquiry_theater: purchaseModel.performance.attributes.theater._id,
            inquiry_id: purchaseModel.updateReserve.reserve_num,
            inquiry_pass: purchaseModel.input.tel_num,
        });
        console.log('MP照会情報登録');

        
        // MPメール登録
        await MP.addEmail.call({
            transactionId: purchaseModel.transactionMP._id,
            from: 'noreply@localhost',
            to: purchaseModel.input.mail_addr,
            subject: '購入完了',
            content: `購入完了\n
この度はご購入いただき誠にありがとうございます。`,
        });
        console.log('MPメール登録');

        // MP取引成立
        await MP.transactionClose.call({
            transactionId: purchaseModel.transactionMP._id,
        });
        console.log('MP取引成立');
    }


    /**
     * 購入確定
     */
    export function purchase(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (!req.session) return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP) return next(new Error(req.__('common.error.property')));
        
        //取引id確認
        if (req.body.transaction_id !== purchaseModel.transactionMP._id) return next(new Error(req.__('common.error.access')));

        updateReserve(req, purchaseModel).then(() => {
            //購入情報をセッションへ
            if (!req.session) throw req.__('common.error.property');
            req.session['complete'] = {
                updateReserve: purchaseModel.updateReserve,
                performance: purchaseModel.performance,
                input: purchaseModel.input,
                reserveSeats: purchaseModel.reserveSeats,
                reserveTickets: purchaseModel.reserveTickets,
                price: purchaseModel.getReserveAmount()
            };

            //購入セッション削除
            delete req.session['purchase'];

            //購入完了情報を返す
            return res.json({
                err: null,
                redirect: false,
                result: req.session['complete'].updateReserve,
                type: null
            });
        }, (err) => {
            //購入完了情報を返す
            return res.json({
                err: (err.error) ? err.error.message : err.message,
                redirect: (err.error) ? false : true,
                result: null,
                type: (err.type) ? err.type : null,
            });
        });
    }
}