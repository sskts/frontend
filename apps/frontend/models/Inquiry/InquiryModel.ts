import COA = require("@motionpicture/coa-service");
import MP = require('../../../../libs/MP');



/**
 * ログイン情報
 */
export interface Login {
    /** 劇場コード */
    theater_code: string,
    /** 購入番号 */
    reserve_num: string,
    /** 電話番号*/
    tel_num: string,
}

/**
 * 照会セッション
 */
export class InquiryModel {
    /**取引MPId */
    public transactionId: string | null;
    /**パフォーマンス */
    public performance: MP.Performance | null;
    /**COA照会情報 */
    public stateReserve: COA.stateReserveInterface.Result | null;
    /**予約チケット */
    public login: Login | null;
    

    constructor(session: any) {
        if (!session) {
            session = {};
        }
        this.transactionId = (session.transactionId) ? session.transactionId : null;
        this.performance = (session.performance) ? session.performance : null;
        this.stateReserve = (session.stateReserve) ? session.stateReserve : null;
        this.login = (session.login) ? session.login : null;
        
    }

    /**
     * セッションObjectへ変換
     */
    public formatToSession(): {
        transactionId: string | null,
        performance: MP.Performance | null,
        stateReserve: COA.stateReserveInterface.Result | null,
        login: Login | null,
    } {

        return {
            transactionId: (this.transactionId) ? this.transactionId : null,
            performance: (this.performance) ? this.performance : null,
            stateReserve: (this.stateReserve) ? this.stateReserve : null,
            login: (this.login) ? this.login : null,
        };
    }


    
}
