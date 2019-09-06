"use strict";
/**
 * ルーティングAPI
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const master = require("../controllers/master/master.controller");
const router = express.Router();
router.get('/getSalesTickets', master.getSalesTickets);
router.get('/getTickets', master.getTickets);
router.get('/getScreens', master.getScreens);
exports.default = router;
