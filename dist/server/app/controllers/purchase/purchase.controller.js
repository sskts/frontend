"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 購入
 */
const COA = require("@motionpicture/coa-service");
const debug = require("debug");
const base_controller_1 = require("../base/base.controller");
const log = debug('sskts-frontend:purchase');
/**
 * 座席ステータス取得
 * @function getSeatState
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function getSeatState(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        log('getSeatState');
        try {
            const args = req.query;
            const service = new COA.service.Reserve({
                endpoint: process.env.COA_ENDPOINT,
                auth: new COA.auth.RefreshToken({
                    endpoint: process.env.COA_ENDPOINT,
                    refreshToken: process.env.COA_REFRESH_TOKEN
                })
            });
            const result = yield service.stateReserveSeat(args);
            res.json(result);
        }
        catch (err) {
            base_controller_1.errorProsess(res, err);
        }
    });
}
exports.getSeatState = getSeatState;
/**
 * ムビチケチケットコード取得
 * @function mvtkTicketcode
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function mvtkTicketcode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        log('mvtkTicketcode');
        try {
            const args = req.body;
            const service = new COA.service.Master({
                endpoint: process.env.COA_ENDPOINT,
                auth: new COA.auth.RefreshToken({
                    endpoint: process.env.COA_ENDPOINT,
                    refreshToken: process.env.COA_REFRESH_TOKEN
                })
            });
            const result = yield service.mvtkTicketcode(args);
            res.json(result);
        }
        catch (err) {
            base_controller_1.errorProsess(res, err);
        }
    });
}
exports.mvtkTicketcode = mvtkTicketcode;
/**
 * CSチケットチケットコード取得
 */
function mgTicketcode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        log('mgTicketcode');
        try {
            const args = req.body;
            const service = new COA.service.Master({
                endpoint: process.env.COA_ENDPOINT,
                auth: new COA.auth.RefreshToken({
                    endpoint: process.env.COA_ENDPOINT,
                    refreshToken: process.env.COA_REFRESH_TOKEN
                })
            });
            const result = yield service.mgtkTicketcode(args);
            res.json(result);
        }
        catch (err) {
            base_controller_1.errorProsess(res, err);
        }
    });
}
exports.mgTicketcode = mgTicketcode;
