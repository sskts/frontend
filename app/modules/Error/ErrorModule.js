"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const HTTPStatus = require("http-status");
const logger_1 = require("../../middlewares/logger");
const ErrorUtilModule = require("../Util/ErrorUtilModule");
const log = debug('SSKTS:Error.ErrorModule');
/**
 * Not Found
 * @memberof ErrorModule
 * @function notFoundRender
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
function notFoundRender(req, res, _) {
    const status = HTTPStatus.NOT_FOUND;
    if (req.xhr) {
        res.status(status).send({ error: 'Not Found.' });
    }
    else {
        res.status(status).render('error/notFound');
    }
    return;
}
exports.notFoundRender = notFoundRender;
/**
 * エラーページ
 * @memberof ErrorModule
 * @function errorRender
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function errorRender(err, req, res, _) {
    let status = HTTPStatus.INTERNAL_SERVER_ERROR;
    let msg = err.message;
    if (err instanceof ErrorUtilModule.AppError) {
        log('APPエラー', err);
        switch (err.code) {
            case ErrorUtilModule.ErrorType.Property:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.badRequest');
                err.message = 'Error Property';
                break;
            case ErrorUtilModule.ErrorType.Access:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.badRequest');
                err.message = 'Error Access';
                break;
            case ErrorUtilModule.ErrorType.Validation:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.badRequest');
                err.message = 'Error Validation';
                break;
            case ErrorUtilModule.ErrorType.Expire:
                // 期限切れのときもstatusが400になっている。200に変更するべき？
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.expire');
                err.message = 'Error Expire';
                break;
            default:
                status = HTTPStatus.INTERNAL_SERVER_ERROR;
                msg = err.message;
                logger_1.default.error('SSKTS-APP:ErrorModule ErrorUtilModule.AppError', status, err);
                break;
        }
    }
    else if (err.hasOwnProperty('errors')) {
        log('APIエラー', err);
        switch (err.code) {
            case HTTPStatus.BAD_REQUEST:
                status = HTTPStatus.BAD_REQUEST;
                msg = req.__('common.error.badRequest');
                break;
            case HTTPStatus.UNAUTHORIZED:
                status = HTTPStatus.UNAUTHORIZED;
                msg = req.__('common.error.unauthorized');
                break;
            case HTTPStatus.FORBIDDEN:
                status = HTTPStatus.FORBIDDEN;
                msg = req.__('common.error.forbidden');
                break;
            case HTTPStatus.NOT_FOUND:
                status = HTTPStatus.NOT_FOUND;
                msg = req.__('common.error.notFound');
                break;
            case HTTPStatus.SERVICE_UNAVAILABLE:
                status = HTTPStatus.SERVICE_UNAVAILABLE;
                msg = req.__('common.error.serviceUnavailable');
                logger_1.default.error('SSKTS-APP:ErrorModule', 'sasaki.transporters.RequestError', status, err);
                break;
            default:
                status = HTTPStatus.INTERNAL_SERVER_ERROR;
                msg = req.__('common.error.internalServerError');
                logger_1.default.error('SSKTS-APP:ErrorModule', 'sasaki.transporters.RequestError', status, err);
                break;
        }
    }
    else {
        log('Error');
        status = HTTPStatus.INTERNAL_SERVER_ERROR;
        msg = req.__('common.error.internalServerError');
        logger_1.default.error('SSKTS-APP:ErrorModule', 'Error', status, err);
    }
    if (req.session !== undefined) {
        delete req.session.purchase;
        delete req.session.mvtk;
        delete req.session.complete;
        delete req.session.auth;
    }
    /**
     * エラーメッセージ
     * Property: プロパティが無い
     * Access: 不正なアクセス
     * Validation: 不正な値のPOST
     * Expire: 有効期限切れ
     * ExternalModule: 外部モジュールエラー
     */
    if (req.xhr) {
        res.status(status).send({ error: 'Something failed.' });
    }
    else {
        res.locals.message = msg;
        res.locals.error = err;
        res.status(status).render('error/error');
    }
    return;
}
exports.errorRender = errorRender;
