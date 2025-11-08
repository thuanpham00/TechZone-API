"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Voucher = void 0;
const mongodb_1 = require("mongodb");
const enum_1 = require("../../constant/enum");
class Voucher {
    _id;
    code;
    description;
    type;
    value;
    max_discount;
    min_order_value;
    usage_limit;
    used_count;
    start_date;
    end_date;
    status;
    created_at;
    updated_at;
    constructor(voucher) {
        const date = new Date();
        this._id = voucher._id || new mongodb_1.ObjectId();
        this.code = voucher.code;
        this.description = voucher.description || "";
        this.type = voucher.type;
        this.value = voucher.value;
        this.max_discount = voucher.max_discount;
        this.min_order_value = voucher.min_order_value;
        this.usage_limit = voucher.usage_limit;
        this.used_count = voucher.used_count || 0;
        this.start_date = voucher.start_date;
        this.end_date = voucher.end_date;
        this.status = voucher.status || enum_1.VoucherStatus.active;
        this.created_at = voucher.created_at || date;
        this.updated_at = voucher.updated_at || date;
    }
}
exports.Voucher = Voucher;
