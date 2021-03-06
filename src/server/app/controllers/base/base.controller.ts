/**
 * base
 */

import * as debug from 'debug';
import { Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { AuthModel } from '../../models/auth/auth.model';
import { getEndpoint } from '../authorize/authorize.controller';

const log = debug('sskts-frontend:base');

/**
 * オプション取得
 * @function getOptions
 * @param {Request} req
 */
export function getOptions(req: Request) {
    log('getOptions');

    const authModel = new AuthModel((<Express.Session>req.session).auth);
    const options = {
        endpoint: getEndpoint(req),
        auth: authModel.create()
    };
    authModel.save(req.session);

    return options;
}

/**
 * エラー
 * @function error
 * @param {Response} res
 * @param {any} err
 */
export function errorProsess(res: Response, err: any) {
    log('errorProsess', err);
    if (err.code !== undefined) {
        res.status(err.code);
    } else {
        res.status(httpStatus.BAD_REQUEST);
    }
    res.json({ err: err, message: err.message, name: err.name, code: err.code });
}
