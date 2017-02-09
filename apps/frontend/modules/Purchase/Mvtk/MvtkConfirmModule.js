"use strict";
const PurchaseSession = require("../../../models/Purchase/PurchaseModel");
var Module;
(function (Module) {
    function index(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        res.locals['error'] = null;
        res.locals['step'] = 2;
        return res.render('purchase/mvtk/confirm');
    }
    Module.index = index;
    function submit(req, res, next) {
        if (!req.session)
            return next(req.__('common.error.property'));
        let purchaseModel = new PurchaseSession.PurchaseModel(req.session['purchase']);
        if (!purchaseModel.transactionMP)
            return next(new Error(req.__('common.error.property')));
        if (req.body.transaction_id !== purchaseModel.transactionMP._id)
            return next(new Error(req.__('common.error.access')));
        return res.redirect('/purchase/input');
    }
    Module.submit = submit;
})(Module = exports.Module || (exports.Module = {}));
