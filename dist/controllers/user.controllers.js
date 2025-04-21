"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMeController = exports.getMeController = exports.changePasswordController = exports.resetPasswordController = exports.verifyPasswordController = exports.forgotPasswordController = exports.resendEmailVerifyController = exports.verifyEmailController = exports.refreshTokenController = exports.logoutController = exports.loginGoogleController = exports.loginController = exports.registerController = void 0;
const mongodb_1 = require("mongodb");
const enum_1 = require("../constant/enum");
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const message_1 = require("../constant/message");
const errors_1 = require("../models/errors");
const database_services_1 = __importDefault(require("../services/database.services"));
const user_services_1 = require("../services/user.services");
const config_1 = require("../utils/config");
const registerController = async (req, res, next) => {
    const { accessToken, refreshToken, user } = await user_services_1.userServices.register(req.body);
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        // secure: true, // chỉ cho phép cookie gửi qua kết nối HTTPS
        sameSite: "strict",
        maxAge: 100 * 24 * 60 * 60 * 1000, // Đồng bộ thời gian sống cookie (100 ngày)
        path: "/"
    });
    res.json({
        message: message_1.UserMessage.REGISTER_IS_SUCCESS,
        result: {
            accessToken,
            user
        }
    });
};
exports.registerController = registerController;
const loginController = async (req, res, next) => {
    const { user } = req;
    const user_id = user._id?.toString();
    const verify = user.verify;
    const role = user.role;
    const { accessToken, refreshToken, user: userInfo } = await user_services_1.userServices.login({ user_id, verify, role });
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true, // chặn client javascript không thể truy cập
        // secure: true, // chỉ cho phép cookie gửi qua kết nối HTTPS
        sameSite: "strict",
        maxAge: 100 * 24 * 60 * 60 * 1000, // Đồng bộ thời gian sống cookie (100 ngày)
        path: "/"
    });
    // client gọi api xuống server và server tạo cookie trả về và lưu vào trình duyệt tự động (client phải nằm trong ds cho phép của server)
    res.json({
        message: message_1.UserMessage.LOGIN_IS_SUCCESS,
        result: {
            accessToken,
            userInfo
        }
    });
};
exports.loginController = loginController;
const loginGoogleController = async (req, res) => {
    const { code } = req.query;
    const { accessToken, refreshToken, newUser, verify, name } = await user_services_1.userServices.loginGoogle(code);
    const url = `${config_1.envConfig.client_redirect_callback}?access_token=${accessToken}&newUser=${newUser}&verify=${verify}&name=${name}`;
    // RT luu cookie tại backEnd
    // AT luu localStorage tại frontEnd
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true, // chỉ cho phép cookie gửi qua kết nối HTTPS
        sameSite: "strict",
        maxAge: 100 * 24 * 60 * 60 * 1000, // Đồng bộ thời gian sống cookie (100 ngày)
        path: "/"
    });
    res.redirect(url);
};
exports.loginGoogleController = loginGoogleController;
const logoutController = async (req, res, next) => {
    const { user_id } = req.decode_authorization;
    const refresh_token = req.cookies.refresh_token; // lấy cookie từ server
    const result = await user_services_1.userServices.logout({ user_id, refresh_token });
    res.clearCookie("refresh_token", {
        httpOnly: true,
        sameSite: "strict",
        path: "/"
    });
    res.json({
        message: result.message
    });
};
exports.logoutController = logoutController;
const refreshTokenController = async (req, res, next) => {
    // lấy exp (thời gian hết hạn của Token cũ) -> tạo token mới (giữ exp của token cũ)
    const { user_id, verify, exp, role } = req.decode_refreshToken;
    const { refresh_token } = req.cookies;
    const { accessToken, refreshToken: refresh_token_new } = await user_services_1.userServices.refreshToken({
        token: refresh_token,
        user_id: user_id,
        verify: verify,
        role: role,
        exp: exp
    });
    res.cookie("refresh_token", refresh_token_new, {
        httpOnly: true,
        // secure: true,
        sameSite: "strict",
        maxAge: 100 * 24 * 60 * 60 * 1000, // Đồng bộ thời gian sống cookie (100 ngày)
        path: "/"
    });
    res.json({
        message: message_1.UserMessage.REFRESH_TOKEN_IS_SUCCESS,
        result: {
            accessToken
        }
    });
};
exports.refreshTokenController = refreshTokenController;
const verifyEmailController = async (req, res, next) => {
    const { user_id, role } = req.decode_emailVerifyToken;
    const user = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if (!user) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_NOT_FOUND,
            status: httpStatus_1.default.NOTFOUND
        });
    }
    if (user.verify === enum_1.UserVerifyStatus.Verified) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_IS_VERIFIED,
            status: httpStatus_1.default.UNAUTHORIZED
        });
    }
    const { accessToken, refreshToken } = await user_services_1.userServices.verifyEmail({ user_id: user_id, role: role });
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        // secure: true , // chỉ cho phép cookie gửi qua kết nối HTTPS
        sameSite: "strict",
        maxAge: 100 * 24 * 60 * 60 * 1000, // Đồng bộ thời gian sống cookie (100 ngày)
        path: "/"
    });
    res.json({
        message: message_1.UserMessage.VERIFY_EMAIL_IS_SUCCESS,
        result: {
            accessToken
        }
    });
};
exports.verifyEmailController = verifyEmailController;
const resendEmailVerifyController = async (req, res, next) => {
    const { user_id, role } = req.decode_authorization;
    const user = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if (!user) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_NOT_FOUND,
            status: httpStatus_1.default.NOTFOUND
        });
    }
    if (user.verify === enum_1.UserVerifyStatus.Verified) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_IS_VERIFIED,
            status: httpStatus_1.default.UNAUTHORIZED
        });
    }
    const result = await user_services_1.userServices.resendEmailVerify({ user_id: user_id, role: role });
    res.json({
        message: result.message
    });
};
exports.resendEmailVerifyController = resendEmailVerifyController;
const forgotPasswordController = async (req, res, next) => {
    const user_id = req.user._id?.toString();
    const verify = req.user.verify;
    const role = req.user.role;
    const { email } = req.body;
    const result = await user_services_1.userServices.forgotPassword({
        user_id: user_id,
        verify: verify,
        role: role,
        email: email
    });
    res.json({
        message: result.message
    });
};
exports.forgotPasswordController = forgotPasswordController;
const verifyPasswordController = async (req, res, next) => {
    res.json({
        message: message_1.UserMessage.FORGOT_PASSWORD_TOKEN_IS_SUCCESS
    });
};
exports.verifyPasswordController = verifyPasswordController;
const resetPasswordController = async (req, res, next) => {
    const { user_id } = req.decode_forgotPasswordToken;
    const { password } = req.body;
    const result = await user_services_1.userServices.resetPassword({ user_id: user_id, password: password });
    res.json({
        message: result.message
    });
};
exports.resetPasswordController = resetPasswordController;
const changePasswordController = async (req, res, next) => {
    const { password } = req.body;
    const { user_id } = req.decode_authorization;
    const result = await user_services_1.userServices.changePassword({ user_id: user_id, password: password });
    res.json({
        message: result.message
    });
};
exports.changePasswordController = changePasswordController;
const getMeController = async (req, res, next) => {
    const a = null;
    a.b = 1;
    const { user_id } = req.decode_authorization;
    const result = await user_services_1.userServices.getMe(user_id);
    res.json({
        result
    });
};
exports.getMeController = getMeController;
const updateMeController = async (req, res, next) => {
    const { user_id } = req.decode_authorization;
    const result = await user_services_1.userServices.updateMe({ user_id: user_id, body: req.body });
    res.json({
        message: message_1.UserMessage.UPDATE_PROFILE_IS_SUCCESS,
        result: result
    });
};
exports.updateMeController = updateMeController;
