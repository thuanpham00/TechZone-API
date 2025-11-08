"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableVouchers = void 0;
const voucherServices_1 = __importDefault(require("../services/voucherServices"));
const getAvailableVouchers = async (req, res) => {
    const orderValue = Number(req.query.order_value) || 0;
    const vouchers = await voucherServices_1.default.getAvailableVouchers(orderValue);
    res.json({
        message: "Get available vouchers successfully",
        data: vouchers
    });
};
exports.getAvailableVouchers = getAvailableVouchers;
