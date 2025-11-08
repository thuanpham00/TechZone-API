"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const message_1 = require("../constant/message");
const database_services_1 = __importDefault(require("./database.services"));
const favourite_cart_order_schema_1 = require("../models/schema/favourite_cart.order.schema");
const mongodb_1 = require("mongodb");
const enum_1 = require("../constant/enum");
class OrderServices {
    async getOrder(user_id) {
        const orderUserId = await database_services_1.default.order.findOne({ user_id: new mongodb_1.ObjectId(user_id) });
        if (orderUserId === null) {
            return {
                result: [],
                total: 0
            };
        }
        const result = await database_services_1.default.order
            .aggregate([
            {
                $match: {
                    user_id: new mongodb_1.ObjectId(user_id)
                }
            },
            {
                $sort: {
                    created_at: -1
                }
            }
        ])
            .toArray();
        const total = result.length;
        return {
            result,
            total
        };
    }
    async createOrder(user_id, body) {
        const productOrder = body.products.map((item) => ({
            ...item,
            product_id: new mongodb_1.ObjectId(item.product_id)
        }));
        const { customer_info, totalAmount, note, shipping_fee, subTotal, type_order, voucher_id, voucher_code, discount_amount } = body;
        // Nếu có voucher, validate và tăng used_count
        if (voucher_id && voucher_code) {
            await database_services_1.default.vouchers.updateOne({ _id: new mongodb_1.ObjectId(voucher_id) }, {
                $inc: { used_count: 1 },
                $currentDate: { updated_at: true }
            });
        }
        const [order] = await Promise.all([
            database_services_1.default.order.insertOne(new favourite_cart_order_schema_1.Order({
                user_id: new mongodb_1.ObjectId(user_id),
                customer_info,
                products: productOrder,
                subTotal,
                shipping_fee,
                totalAmount,
                status: type_order === enum_1.TypeOrder.cod ? enum_1.OrderStatus.pending : enum_1.OrderStatus.loading,
                note,
                type_order,
                voucher_id: voucher_id ? new mongodb_1.ObjectId(voucher_id) : undefined,
                voucher_code: voucher_code || undefined,
                discount_amount: discount_amount || 0
            }))
        ]);
        return order.insertedId;
    }
    async updateStatusOrder(id, status) {
        await database_services_1.default.order.updateOne({ _id: new mongodb_1.ObjectId(id) }, {
            $set: {
                status: status === 0 ? enum_1.OrderStatus.cancelled : enum_1.OrderStatus.delivered
            },
            $push: {
                status_history: {
                    status: status === 0 ? enum_1.OrderStatus.cancelled : enum_1.OrderStatus.delivered,
                    updated_at: new Date()
                }
            },
            $currentDate: { updated_at: true }
        });
        return {
            message: status === 0 ? message_1.OrderMessage.CANCEL_ORDER_IS_SUCCESS : message_1.OrderMessage.RECEIVE_ORDER_IS_SUCCESS
        };
    }
}
const orderServices = new OrderServices();
exports.default = orderServices;
