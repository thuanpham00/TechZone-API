"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
const dotenv_1 = require("dotenv");
const enum_1 = require("../constant/enum");
const jwt_1 = require("../utils/jwt");
const database_services_1 = __importDefault(require("./database.services"));
const mongodb_1 = require("mongodb");
const users_schema_1 = require("../models/schema/users.schema");
const scripto_1 = require("../utils/scripto");
const refreshToken_schema_1 = require("../models/schema/refreshToken.schema");
const message_1 = require("../constant/message");
const axios_1 = __importDefault(require("axios"));
const errors_1 = require("../models/errors");
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const ses_1 = require("../utils/ses");
const config_1 = require("../utils/config");
(0, dotenv_1.config)();
class UserServices {
    signAccessToken({ user_id, verify, role }) {
        return (0, jwt_1.signToken)({
            payload: {
                user_id,
                verify,
                role,
                tokenType: enum_1.TokenType.AccessToken
            },
            privateKey: config_1.envConfig.secret_key_access_token,
            options: {
                expiresIn: config_1.envConfig.expire_in_access_token // 15 phút
            }
        });
    }
    signRefreshToken({ user_id, verify, role, exp }) {
        if (exp) {
            return (0, jwt_1.signToken)({
                payload: {
                    user_id,
                    verify,
                    role,
                    tokenType: enum_1.TokenType.RefreshToken,
                    exp: exp // tạo RT mới và vẫn giữ nguyên exp của RT cũ
                },
                privateKey: config_1.envConfig.secret_key_refresh_token
            });
        }
        return (0, jwt_1.signToken)({
            payload: {
                user_id,
                verify,
                role,
                tokenType: enum_1.TokenType.RefreshToken
            },
            privateKey: config_1.envConfig.secret_key_refresh_token,
            options: {
                expiresIn: config_1.envConfig.expire_in_refresh_token // 100 ngày
            }
        });
    }
    signEmailVerifyToken({ user_id, verify, role }) {
        return (0, jwt_1.signToken)({
            payload: {
                user_id,
                verify,
                role,
                tokenType: enum_1.TokenType.EmailVerifyToken
            },
            privateKey: config_1.envConfig.secret_key_email_verify_token,
            options: {
                expiresIn: config_1.envConfig.expire_in_email_verify_token // 7 ngày
            }
        });
    }
    signForgotPasswordToken({ user_id, verify, role }) {
        return (0, jwt_1.signToken)({
            payload: {
                user_id,
                verify,
                role,
                tokenType: enum_1.TokenType.ForgotPasswordToken
            },
            privateKey: config_1.envConfig.secret_key_forgot_password_token,
            options: {
                expiresIn: config_1.envConfig.expire_in_forgot_password_token // 7 ngày
            }
        });
    }
    signAccessTokenAndRefreshToken({ user_id, verify, role }) {
        return Promise.all([
            this.signAccessToken({ user_id, verify, role }),
            this.signRefreshToken({ user_id, verify, role })
        ]);
    }
    async checkEmailExist(email) {
        const result = await database_services_1.default.users.findOne({ email: email });
        return Boolean(result);
    }
    decodeRefreshToken(refreshToken) {
        return (0, jwt_1.verifyToken)({ token: refreshToken, privateKey: config_1.envConfig.secret_key_refresh_token });
    }
    async register(payload) {
        const user_id = new mongodb_1.ObjectId();
        const emailVerifyToken = await this.signEmailVerifyToken({
            user_id: user_id.toString(),
            verify: enum_1.UserVerifyStatus.Unverified, // mới tạo tài khoản thì chưa xác thực
            role: payload.role ? payload.role : enum_1.RoleType.USER
        });
        const body = {
            ...payload,
            _id: user_id,
            password: (0, scripto_1.hashPassword)(payload.password),
            email_verify_token: emailVerifyToken,
            numberPhone: payload.phone,
            role: payload.role
        };
        const [, token] = await Promise.all([
            database_services_1.default.users.insertOne(payload.role
                ? new users_schema_1.User(body)
                : new users_schema_1.User({
                    ...payload,
                    _id: user_id,
                    password: (0, scripto_1.hashPassword)(payload.password),
                    email_verify_token: emailVerifyToken,
                    numberPhone: payload.phone
                })),
            // tạo cặp AccessToken và RefreshToken mới
            this.signAccessTokenAndRefreshToken({
                user_id: user_id.toString(),
                verify: enum_1.UserVerifyStatus.Unverified, // mới tạo tài khoản thì chưa xác thực
                role: payload.role ? payload.role : enum_1.RoleType.USER
            })
        ]);
        const [accessToken, refreshToken] = token;
        const { exp, iat } = await this.decodeRefreshToken(refreshToken);
        const [user] = await Promise.all([
            database_services_1.default.users.findOne({ _id: user_id }, { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }),
            // thêm RefreshToken mới vào DB
            database_services_1.default.refreshToken.insertOne(new refreshToken_schema_1.RefreshToken({ token: refreshToken, iat: iat, exp: exp, user_id: user_id }))
        ]);
        await (0, ses_1.sendVerifyRegisterEmail)(payload.email, emailVerifyToken);
        return {
            accessToken,
            refreshToken,
            user
        };
    }
    async login({ user_id, verify, role }) {
        // tạo cặp AccessToken và RefreshToken mới
        const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken({
            user_id: user_id,
            verify: verify,
            role: role
        });
        const { iat, exp } = await this.decodeRefreshToken(refreshToken);
        const [user] = await Promise.all([
            database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) }, { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }),
            // thêm RefreshToken mới vào DB
            database_services_1.default.refreshToken.insertOne(new refreshToken_schema_1.RefreshToken({
                token: refreshToken,
                iat: iat,
                exp: exp,
                user_id: new mongodb_1.ObjectId(user_id)
            }))
        ]);
        return {
            accessToken,
            refreshToken,
            user
        };
    }
    async getGoogleToken(code) {
        const body = {
            code,
            client_id: config_1.envConfig.google_client_id,
            client_secret: config_1.envConfig.google_client_secret,
            redirect_uri: config_1.envConfig.google_redirect_uri,
            grant_type: "authorization_code"
        };
        const { data } = await axios_1.default.post("https://oauth2.googleapis.com/token", body, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        return data;
    }
    async getGoogleInfo({ id_token, access_token }) {
        const { data } = await axios_1.default.get("https://www.googleapis.com/oauth2/v1/userinfo", {
            params: {
                access_token,
                alt: "json"
            },
            headers: {
                Authorization: `Bearer ${id_token}`
            }
        });
        return data;
    }
    async loginGoogle(code) {
        const { access_token, id_token } = await this.getGoogleToken(code);
        const userInfo = await this.getGoogleInfo({ id_token, access_token });
        if (!userInfo.verified_email) {
            throw new errors_1.ErrorWithStatus({
                message: message_1.UserMessage.EMAIL_NOT_VERIFY,
                status: httpStatus_1.default.UNAUTHORIZED
            });
        }
        const findEmail = await database_services_1.default.users.findOne({ email: userInfo.email });
        // đã tồn tại email trong db thì đăng nhập vào
        // còn chưa tồn tại thì tạo mới
        if (findEmail) {
            const user_id = findEmail._id;
            const verify_user = findEmail.verify;
            const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
                user_id: user_id.toString(),
                verify: verify_user,
                role: enum_1.RoleType.USER
            });
            const { iat, exp } = await this.decodeRefreshToken(refresh_token);
            await database_services_1.default.refreshToken.insertOne(new refreshToken_schema_1.RefreshToken({ user_id: new mongodb_1.ObjectId(user_id), token: refresh_token, iat: iat, exp: exp }));
            return {
                accessToken: access_token,
                refreshToken: refresh_token,
                name: userInfo.name,
                newUser: 0,
                verify: userInfo.verified_email
            };
        }
        else {
            // trong method register có xử lý sign token và lưu vào db
            const random = Math.random().toString(36).substring(2, 15);
            const { accessToken: accessToken_1, refreshToken: refreshToken_1 } = await this.register({
                email: userInfo.email,
                name: userInfo.name,
                password: random,
                confirm_password: random,
                phone: ""
            });
            // vẫn tạo mới email-verify-token - cần thêm bước verify-email
            return {
                accessToken: accessToken_1,
                refreshToken: refreshToken_1,
                name: userInfo.name,
                newUser: 1,
                verify: enum_1.UserVerifyStatus.Unverified
            };
        }
    }
    async logout({ user_id, refresh_token }) {
        await database_services_1.default.refreshToken.deleteOne({
            user_id: new mongodb_1.ObjectId(user_id),
            token: refresh_token
        });
        return {
            message: message_1.UserMessage.LOGOUT_IS_SUCCESS
        };
    }
    async refreshToken({ token, user_id, verify, exp, role }) {
        const [accessTokenNew, refreshTokenNew] = await Promise.all([
            this.signAccessToken({ user_id: user_id, verify: verify, role: role }),
            this.signRefreshToken({ user_id: user_id, verify: verify, role: role, exp: exp }),
            database_services_1.default.refreshToken.deleteOne({ token: token })
        ]);
        const decodeRefreshToken = await this.decodeRefreshToken(refreshTokenNew);
        await database_services_1.default.refreshToken.insertOne(new refreshToken_schema_1.RefreshToken({
            token: refreshTokenNew,
            user_id: new mongodb_1.ObjectId(user_id),
            exp: decodeRefreshToken.exp, // vẫn giữ exp của RT cũ // time hết hạn
            iat: decodeRefreshToken.iat // vẫn giữ iat của RT cũ // time tạo mới
        }));
        return {
            accessToken: accessTokenNew,
            refreshToken: refreshTokenNew
        };
    }
    async verifyEmail({ user_id, role }) {
        const [token] = await Promise.all([
            // tạo cặp AccessToken và RefreshToken mới
            this.signAccessTokenAndRefreshToken({
                user_id: user_id,
                verify: enum_1.UserVerifyStatus.Verified,
                role: role
            }),
            database_services_1.default.users.updateOne({
                _id: new mongodb_1.ObjectId(user_id)
            }, {
                $set: {
                    email_verify_token: "",
                    verify: enum_1.UserVerifyStatus.Verified
                },
                $currentDate: {
                    updated_at: true
                }
            })
        ]);
        // tạo cặp AccessToken và RefreshToken mới
        const [accessToken, refreshToken] = token;
        const { iat, exp } = await this.decodeRefreshToken(refreshToken);
        // thêm RefreshToken mới vào DB
        await database_services_1.default.refreshToken.insertOne(new refreshToken_schema_1.RefreshToken({
            token: refreshToken,
            iat: iat,
            exp: exp,
            user_id: new mongodb_1.ObjectId(user_id)
        }));
        return {
            accessToken,
            refreshToken
        };
    }
    async resendEmailVerify({ user_id, role }) {
        const emailVerifyToken = await this.signEmailVerifyToken({
            user_id: user_id,
            verify: enum_1.UserVerifyStatus.Unverified,
            role: role
        });
        await database_services_1.default.users.updateOne({
            _id: new mongodb_1.ObjectId(user_id)
        }, {
            $set: {
                email_verify_token: emailVerifyToken
            },
            $currentDate: {
                updated_at: true
            }
        });
        return {
            message: message_1.UserMessage.RESEND_VERIFY_EMAIL_IS_SUCCESS
        };
    }
    async forgotPassword({ user_id, verify, role, email }) {
        const forgotPasswordToken = await this.signForgotPasswordToken({
            user_id: user_id,
            verify: verify,
            role
        });
        await database_services_1.default.users.updateOne({ _id: new mongodb_1.ObjectId(user_id) }, {
            $set: {
                forgot_password_token: forgotPasswordToken
            },
            $currentDate: {
                updated_at: true
            }
        });
        await (0, ses_1.sendForgotPasswordToken)(email, forgotPasswordToken);
        return {
            message: message_1.UserMessage.CHECK_EMAIL_TO_RESET_PASSWORD
        };
    }
    async resetPassword({ user_id, password }) {
        await database_services_1.default.users.updateOne({
            _id: new mongodb_1.ObjectId(user_id)
        }, {
            $set: {
                password: (0, scripto_1.hashPassword)(password),
                forgot_password_token: ""
            },
            $currentDate: {
                updated_at: true
            }
        });
        return {
            message: message_1.UserMessage.RESET_PASSWORD_IS_SUCCESS
        };
    }
    async changePassword({ user_id, password }) {
        await database_services_1.default.users.updateOne({
            _id: new mongodb_1.ObjectId(user_id)
        }, {
            $set: {
                password: (0, scripto_1.hashPassword)(password)
            },
            $currentDate: {
                updated_at: true
            }
        });
        return {
            message: message_1.UserMessage.CHANGE_PASSWORD_IS_SUCCESS
        };
    }
    async getMe(user_id) {
        const user = await database_services_1.default.users.findOne({
            _id: new mongodb_1.ObjectId(user_id)
        }, {
            projection: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0
            }
        });
        return user;
    }
    async updateMe({ user_id, body }) {
        const payload = body.date_of_birth ? { ...body, date_of_birth: new Date(body.date_of_birth) } : { ...body };
        const user = await database_services_1.default.users.findOneAndUpdate({ _id: new mongodb_1.ObjectId(user_id) }, {
            $set: { ...payload },
            $currentDate: {
                updated_at: true
            }
        }, {
            returnDocument: "after", // cập nhật postman liền
            projection: {
                forgot_password_token: 0,
                email_verify_token: 0,
                password: 0
            }
        });
        return user;
    }
}
exports.userServices = new UserServices();
