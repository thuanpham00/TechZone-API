"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderCODController = exports.callBackVnpayController = exports.createPaymentController = void 0;
const config_1 = require("../utils/config");
const crypto_1 = __importDefault(require("crypto"));
const database_services_1 = __importDefault(require("../services/database.services"));
const mongodb_1 = require("mongodb");
const enum_1 = require("../constant/enum");
const order_services_1 = __importDefault(require("../services/order.services"));
const email_schema_1 = require("../models/schema/email.schema");
const ses_1 = require("../utils/ses");
const common_1 = require("../utils/common");
const dayjs_1 = __importDefault(require("dayjs"));
const createPaymentController = async (req, res, next) => {
    const ipAddr = req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    const tmnCode = config_1.envConfig.vnp_TmnCode;
    const secretKey = config_1.envConfig.vnp_HashSecret;
    let vnpUrl = config_1.envConfig.vnp_Url;
    const returnUrl = config_1.envConfig.vnp_ReturnUrl;
    const date = new Date();
    const createDate = date
        .toISOString()
        .replace(/[-T:\.Z]/g, "")
        .slice(0, 14);
    // lấy order body từ FE
    const { customer_info, totalAmount, note, shipping_fee, subTotal, products, type_order, voucher_id, voucher_code, discount_amount } = req.body;
    const { user_id } = req.decode_authorization;
    const orderResult = await order_services_1.default.createOrder(user_id, {
        customer_info,
        totalAmount,
        note,
        shipping_fee,
        subTotal,
        products,
        type_order,
        voucher_id,
        voucher_code,
        discount_amount
    });
    const insertedId = orderResult; // id order
    const vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: insertedId.toString(),
        vnp_OrderInfo: `Thanh toán đơn hàng #${insertedId}`,
        vnp_OrderType: {
            vnp_name_customer: customer_info.name
        },
        vnp_Amount: (totalAmount * 100).toString(),
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate
    };
    const signData = new URLSearchParams(sortObject(vnp_Params)).toString();
    const hmac = crypto_1.default.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + new URLSearchParams(vnp_Params).toString();
    res.json({ url: vnpUrl });
};
exports.createPaymentController = createPaymentController;
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
        sorted[key] = obj[key];
    });
    return sorted;
}
const callBackVnpayController = async (req, res, next) => {
    const { orderId } = req.body;
    const findOrder = await database_services_1.default.order.findOne({ _id: new mongodb_1.ObjectId(orderId) });
    if (findOrder) {
        const productOrder = findOrder.products.map((item) => ({
            ...item,
            product_id: new mongodb_1.ObjectId(item.product_id)
        }));
        // cập nhật giỏ hàng
        await Promise.all([
            database_services_1.default.cart.updateOne({
                user_id: findOrder.user_id
            }, {
                $pull: {
                    products: {
                        product_id: { $in: productOrder.map((id) => new mongodb_1.ObjectId(id.product_id)) }
                    }
                }
            }), // cập nhật số lượng tồn của sản phẩm và lượt mua
            ...productOrder.map((item) => {
                database_services_1.default.product.updateOne({
                    _id: new mongodb_1.ObjectId(item.product_id)
                }, {
                    $inc: { stock: -item.quantity, sold: item.quantity }
                });
            })
        ]);
        const cartUser = await database_services_1.default.cart.findOne({ user_id: new mongodb_1.ObjectId(findOrder.user_id) });
        if (cartUser?.products.length === 0) {
            await database_services_1.default.cart.deleteOne({ user_id: new mongodb_1.ObjectId(findOrder.user_id) });
        }
        const today = new Date();
        const formattedDate = (0, dayjs_1.default)(today).format("HH:mm DD/MM/YYYY");
        const bodyEmailSend = {
            id: findOrder._id,
            customerName: findOrder.customer_info.name,
            customerPhone: findOrder.customer_info.phone,
            shippingAddress: findOrder.customer_info.address,
            totalAmount: (0, common_1.formatCurrency)(findOrder.totalAmount),
            createdAt: formattedDate
        };
        const [sendMail] = await Promise.all([
            (0, ses_1.sendNotificationOrderBuyCustomer)(findOrder.customer_info.email, bodyEmailSend),
            database_services_1.default.order.updateOne({ _id: new mongodb_1.ObjectId(findOrder._id) }, {
                $set: {
                    status: enum_1.OrderStatus.pending
                },
                $currentDate: { updated_at: true }
            })
        ]);
        const resendId = sendMail.data?.id;
        await database_services_1.default.emailLog.insertOne(new email_schema_1.EmailLog({
            to: findOrder.customer_info.email,
            subject: `Đặt hàng thành công - TECHZONE xác nhận đơn hàng #${findOrder._id}`,
            type: enum_1.TypeEmailResend.orderConfirmation,
            status: enum_1.StatusEmailResend.sent,
            resend_id: resendId
        }));
        res.json({
            message: "Cập nhật trạng thái đơn hàng thành công"
        });
        return;
    }
    res.json({
        message: "Không tìm thấy đơn hàng"
    });
    return;
};
exports.callBackVnpayController = callBackVnpayController;
const createOrderCODController = async (req, res, next) => {
    const { customer_info, totalAmount, note, shipping_fee, subTotal, products, type_order, voucher_id, voucher_code, discount_amount } = req.body;
    const { user_id } = req.decode_authorization;
    const orderID = await order_services_1.default.createOrder(user_id, {
        customer_info,
        totalAmount,
        note,
        shipping_fee,
        subTotal,
        products,
        type_order,
        voucher_id,
        voucher_code,
        discount_amount
    });
    // cập nhật giỏ hàng
    await Promise.all([
        database_services_1.default.cart.updateOne({
            user_id: new mongodb_1.ObjectId(user_id)
        }, {
            $pull: {
                products: {
                    product_id: { $in: products.map((id) => new mongodb_1.ObjectId(id.product_id)) }
                }
            }
        }), // cập nhật số lượng tồn của sản phẩm và lượt mua
        ...products.map((item) => {
            database_services_1.default.product.updateOne({
                _id: new mongodb_1.ObjectId(item.product_id)
            }, {
                $inc: { stock: -item.quantity, sold: item.quantity }
            });
        })
    ]);
    const cartUser = await database_services_1.default.cart.findOne({ user_id: new mongodb_1.ObjectId(user_id) });
    if (cartUser?.products.length === 0) {
        await database_services_1.default.cart.deleteOne({ user_id: new mongodb_1.ObjectId(user_id) });
    }
    const today = new Date();
    const formattedDate = (0, dayjs_1.default)(today).format("HH:mm DD/MM/YYYY");
    const bodyEmailSend = {
        id: orderID,
        customerName: customer_info.name,
        customerPhone: customer_info.phone,
        shippingAddress: customer_info.address,
        totalAmount: (0, common_1.formatCurrency)(totalAmount),
        createdAt: formattedDate
    };
    const [sendMail] = await Promise.all([
        (0, ses_1.sendNotificationOrderBuyCustomer)(customer_info.email, bodyEmailSend),
        database_services_1.default.order.updateOne({ _id: new mongodb_1.ObjectId(orderID) }, {
            $set: {
                status: enum_1.OrderStatus.pending
            },
            $currentDate: { updated_at: true }
        })
    ]);
    const resendId = sendMail.data?.id;
    await database_services_1.default.emailLog.insertOne(new email_schema_1.EmailLog({
        to: customer_info.email,
        subject: `Đặt hàng thành công - TECHZONE xác nhận đơn hàng #${orderID}`,
        type: enum_1.TypeEmailResend.orderConfirmation,
        status: enum_1.StatusEmailResend.sent,
        resend_id: resendId
    }));
    const findOrder = await database_services_1.default.order.findOne({ _id: new mongodb_1.ObjectId(orderID) });
    res.json({
        message: "Tạo đơn hàng thành công",
        findOrder
    });
};
exports.createOrderCODController = createOrderCODController;
/**
 *
Ngân hàng	NCB
Số thẻ	9704198526191432198
Tên chủ thẻ	NGUYEN VAN A
Ngày phát hành	07/15
Mật khẩu OTP	123456
 */
