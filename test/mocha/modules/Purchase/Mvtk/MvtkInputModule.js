"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * MvtkInputModuleテスト
 */
const COA = require("@motionpicture/coa-service");
const MVTK = require("@motionpicture/mvtk-service");
const assert = require("assert");
const moment = require("moment");
const sinon = require("sinon");
const MvtkInputForm = require("../../../../../app/forms/Purchase/Mvtk/MvtkInputForm");
const MvtkInputModule = require("../../../../../app/modules/Purchase/Mvtk/MvtkInputModule");
describe('MvtkInputModule', () => {
    it('render 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {}
                },
                mvtk: []
            }
        };
        const res = {
            locals: {},
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield MvtkInputModule.render(req, res, next);
        assert(res.render.calledOnce);
    }));
    it('render エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield MvtkInputModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('select 正常', () => __awaiter(this, void 0, void 0, function* () {
        const mvtkInputForm = sinon.stub(MvtkInputForm, 'default').returns({});
        const purchaseNumberAuth = sinon.stub(MVTK, 'createPurchaseNumberAuthService').returns({
            purchaseNumberAuth: () => {
                return Promise.resolve([{
                        knyknrNo: '',
                        ykknInfo: [{}]
                    }]);
            }
        });
        const mvtkTicketcode = sinon.stub(COA.services.master, 'mvtkTicketcode').returns(Promise.resolve({}));
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: '',
                            dateJouei: ''
                        }
                    }
                },
                mvtk: []
            },
            body: {
                transactionId: '',
                mvtk: JSON.stringify([{ code: '', password: '' }])
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    }
                });
            }
        };
        const res = {
            locals: {},
            redirect: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield MvtkInputModule.select(req, res, next);
        assert(res.redirect.calledOnce);
        mvtkInputForm.restore();
        purchaseNumberAuth.restore();
        mvtkTicketcode.restore();
    }));
    it('select エラー1', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: undefined,
                mvtk: JSON.stringify([{ code: '1', password: '1' }])
            }
        };
        const res = {};
        const next = sinon.spy();
        yield MvtkInputModule.select(req, res, next);
        assert(next.calledOnce);
    }));
    it('select エラー2', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {};
        const next = sinon.spy();
        yield MvtkInputModule.select(req, res, next);
        assert(next.calledOnce);
    }));
});
