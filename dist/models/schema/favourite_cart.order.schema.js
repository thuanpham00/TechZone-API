"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = exports.Cart = exports.Favourite = void 0;
const mongodb_1 = require("mongodb");
const enum_1 = require("../../constant/enum");
class Favourite {
    _id;
    user_id;
    products;
    created_at;
    updated_at;
    constructor(favourite) {
        const date = new Date();
        this._id = favourite._id || new mongodb_1.ObjectId();
        this.user_id = favourite.user_id;
        this.products = favourite.products;
        this.created_at = favourite.created_at || date;
        this.updated_at = favourite.updated_at || date;
    }
}
exports.Favourite = Favourite;
class Cart {
    _id;
    user_id;
    products;
    created_at;
    updated_at;
    constructor(cart) {
        const date = new Date();
        this._id = cart._id || new mongodb_1.ObjectId();
        this.user_id = cart.user_id;
        this.products = cart.products;
        this.created_at = cart.created_at || date;
        this.updated_at = cart.updated_at || date;
    }
}
exports.Cart = Cart;
class Order {
    _id;
    user_id;
    customer_info;
    products;
    subTotal;
    shipping_fee;
    discount_amount; // Số tiền giảm từ 1 voucher
    voucher_id; // ID của 1 voucher duy nhất
    voucher_code; // Mã voucher
    totalAmount;
    type_order;
    status;
    status_history;
    note;
    created_at;
    updated_at;
    constructor(order) {
        const date = new Date();
        this._id = order._id || new mongodb_1.ObjectId();
        this.user_id = order.user_id;
        this.customer_info = {
            name: order.customer_info.name,
            phone: order.customer_info.phone,
            address: order.customer_info.address,
            email: order.customer_info.email
        };
        this.products = order.products;
        this.shipping_fee = order.shipping_fee;
        this.discount_amount = order.discount_amount || 0;
        this.voucher_id = order.voucher_id;
        this.voucher_code = order.voucher_code;
        this.subTotal = order.subTotal;
        this.totalAmount = order.totalAmount;
        this.status = order.status || enum_1.OrderStatus.pending;
        this.type_order = order.type_order || enum_1.TypeOrder.vnpay;
        this.status_history = order.status_history || [];
        this.note = order.note || "";
        this.created_at = order.created_at || date;
        this.updated_at = order.updated_at || date;
    }
}
exports.Order = Order;
