"use strict";
const BaseController_1 = require("../BaseController");
const COA = require("@motionpicture/coa-service");
const PurchaseSession = require("../../models/Purchase/PurchaseModel");
class PurchaseController extends BaseController_1.default {
    constructor(req, res, next) {
        super(req, res, next);
        this.init();
    }
    init() {
        if (!this.req.session)
            return this.next(new Error('session is undefined'));
        this.purchaseModel = new PurchaseSession.PurchaseModel(this.req.session['purchase']);
    }
    deleteSession() {
        if (!this.req.session)
            return;
        delete this.req.session['purchaseInfo'];
        delete this.req.session['reserveSeats'];
        delete this.req.session['reserveTickets'];
        delete this.req.session['updateReserve'];
        delete this.req.session['gmoTokenObject'];
    }
    getScreenStateReserve() {
        COA.getStateReserveSeatInterface.call(this.req.body).then((result) => {
            this.res.json({
                err: null,
                result: result
            });
        }, (err) => {
            this.res.json({
                err: err,
                result: null
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PurchaseController;
