"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voucher_controllers_1 = require("../controllers/voucher.controllers");
const handlers_1 = require("../utils/handlers");
const voucherRoute = (0, express_1.Router)();
/**
 * Description: get bộ lọc theo danh mục
 * Path: /available
 * Method: GET
 */
voucherRoute.get("/available", (0, handlers_1.wrapRequestHandler)(voucher_controllers_1.getAvailableVouchers));
exports.default = voucherRoute;
