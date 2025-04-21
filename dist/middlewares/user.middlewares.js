"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.updateMeValidator = exports.changePasswordValidator = exports.verifyUserValidator = exports.resetPasswordValidator = exports.verifyForgotPasswordValidator = exports.forgotPasswordValidator = exports.emailVerifyValidator = exports.refreshTokenValidator = exports.accessTokenValidator = exports.loginValidator = exports.registerValidator = exports.numberPhoneSchema = exports.nameSchema = void 0;
const express_validator_1 = require("express-validator");
const enum_1 = require("../constant/enum");
const message_1 = require("../constant/message");
const database_services_1 = __importDefault(require("../services/database.services"));
const user_services_1 = require("../services/user.services");
const common_1 = require("../utils/common");
const scripto_1 = require("../utils/scripto");
const validations_1 = require("../utils/validations");
const errors_1 = require("../models/errors");
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const jwt_1 = require("../utils/jwt");
const dotenv_1 = require("dotenv");
const jsonwebtoken_1 = require("jsonwebtoken");
const mongodb_1 = require("mongodb");
const config_1 = require("../utils/config");
(0, dotenv_1.config)();
const Role = (0, common_1.convertEnumToArray)(enum_1.RoleType);
const passwordSchema = {
    notEmpty: {
        errorMessage: message_1.UserMessage.PASSWORD_IS_REQUIRED
    },
    isString: {
        errorMessage: message_1.UserMessage.PASSWORD_IS_STRING
    },
    isLength: {
        options: {
            min: 6,
            max: 50
        },
        errorMessage: message_1.UserMessage.PASSWORD_IS_LENGTH
    },
    isStrongPassword: {
        // độ mạnh password
        options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1
        },
        errorMessage: message_1.UserMessage.PASSWORD_IS_STRONG
    }
};
const confirmPasswordSchema = {
    notEmpty: {
        errorMessage: message_1.UserMessage.CONFIRM_PASSWORD_IS_REQUIRED
    },
    isString: {
        errorMessage: message_1.UserMessage.CONFIRM_PASSWORD_IS_STRING
    },
    isLength: {
        options: {
            min: 6,
            max: 50
        },
        errorMessage: message_1.UserMessage.CONFIRM_PASSWORD_IS_LENGTH
    },
    isStrongPassword: {
        // độ mạnh password
        options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1
        },
        errorMessage: message_1.UserMessage.CONFIRM_PASSWORD_IS_STRONG
    },
    custom: {
        options: (value, { req }) => {
            if (value !== req.body.password) {
                throw new Error(message_1.UserMessage.PASSWORD_IS_NOT_MATCH);
            }
            return true;
        }
    }
};
exports.nameSchema = {
    notEmpty: {
        errorMessage: message_1.UserMessage.NAME_IS_REQUIRED // truyền lỗi này vào msg và là lỗi 422 - msg là string
    },
    trim: true,
    matches: {
        options: /^[^\d]*$/, // Biểu thức chính quy đảm bảo không có chữ số
        errorMessage: message_1.UserMessage.NAME_IS_NOT_NUMBER
    }
};
const dateOfBirthSchema = {
    isISO8601: {
        options: {
            strict: true, // yc tuân thủ chuẩn iso 8601
            strictSeparator: true // yc dấu phân cách "-" giữa ngày tháng năm của date (2024-01-01)
        },
        errorMessage: message_1.UserMessage.DATE_OF_BIRTH_IS_ISO8601
    } // new Date().toISOString()
};
const forgotPasswordToken = {
    custom: {
        options: async (value, { req }) => {
            if (!value) {
                throw new errors_1.ErrorWithStatus({
                    message: message_1.UserMessage.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                    status: httpStatus_1.default.UNAUTHORIZED
                });
            }
            try {
                const decode_forgotPasswordToken = await (0, jwt_1.verifyToken)({
                    token: value,
                    privateKey: config_1.envConfig.secret_key_forgot_password_token
                });
                const user = await database_services_1.default.users.findOne({
                    _id: new mongodb_1.ObjectId(decode_forgotPasswordToken.user_id)
                });
                req.decode_forgotPasswordToken = decode_forgotPasswordToken;
                if (!user) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.UserMessage.USER_NOT_FOUND,
                        status: httpStatus_1.default.NOTFOUND
                    });
                }
                if (user.forgot_password_token !== value) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.UserMessage.FORGOT_PASSWORD_TOKEN_IS_INVALID,
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                    throw new errors_1.ErrorWithStatus({
                        message: error.message,
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
                throw error;
            }
            return true;
        }
    }
};
exports.numberPhoneSchema = {
    isLength: {
        options: {
            min: 10,
            max: 11
        },
        errorMessage: message_1.UserMessage.NUMBER_PHONE_LENGTH_MIN_10_MAX_11
    },
    custom: {
        options: (value) => {
            const regex = /^\d+$/;
            if (!regex.test(value)) {
                throw new Error(message_1.UserMessage.NUMBER_PHONE_IS_INVALID);
            }
            return true;
        }
    }
};
exports.registerValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    email: {
        notEmpty: {
            errorMessage: message_1.UserMessage.EMAIL_IS_REQUIRED
        },
        isEmail: {
            errorMessage: message_1.UserMessage.EMAIL_IS_VALID
        },
        trim: true,
        custom: {
            options: async (value) => {
                const isEmail = await user_services_1.userServices.checkEmailExist(value);
                if (isEmail) {
                    throw new Error(message_1.UserMessage.EMAIL_IS_EXISTS); // truyền lỗi này vào msg và là lỗi 422 - msg là string
                    // throw new ErrorWithStatus({
                    //   status: httpStatus.UNAUTHORIZED,
                    //   message: UserMessage.EMAIL_IS_EXISTS
                    // }) // truyền lỗi này vào msg và là lỗi 401 - msg là instanceof ErrorWithStatus - msg là Object
                }
                return true;
            }
        }
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    name: exports.nameSchema,
    phone: {
        ...exports.numberPhoneSchema
    },
    role: {
        optional: true, // không bắt buộc
        isIn: {
            options: [Role],
            errorMessage: message_1.UserMessage.ROLE_IS_INVALID
        }
    }
}, ["body"]));
exports.loginValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    email: {
        notEmpty: {
            errorMessage: message_1.UserMessage.EMAIL_IS_REQUIRED
        },
        isEmail: {
            errorMessage: message_1.UserMessage.EMAIL_IS_VALID
        },
        custom: {
            options: async (value, { req }) => {
                const user = await database_services_1.default.users.findOne({
                    email: value,
                    password: (0, scripto_1.hashPassword)(req.body.password)
                });
                if (!user) {
                    throw new Error(message_1.UserMessage.EMAIL_OR_PASSWORD_IS_INCORRECT);
                }
                ;
                req.user = user;
                return true;
            }
        }
    },
    password: passwordSchema
}, ["body"]));
exports.accessTokenValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    Authorization: {
        custom: {
            options: async (value, { req }) => {
                // 'Bearer ewbuhfiewqfhgewqui'
                // kiểm tra có AT không
                // verify ngược lại
                const access_token = (value || "").split(" ")[1];
                if (!access_token) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.UserMessage.ACCESS_TOKEN_IS_REQUIRED,
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
                try {
                    const decode_authorization = await (0, jwt_1.verifyToken)({
                        token: access_token,
                        privateKey: config_1.envConfig.secret_key_access_token
                    });
                    req.decode_authorization = decode_authorization;
                }
                catch (error) {
                    if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                        throw new errors_1.ErrorWithStatus({
                            message: "AccessToken expired",
                            status: httpStatus_1.default.UNAUTHORIZED
                        });
                    }
                }
                return true;
            }
        }
    }
}, ["headers"]));
exports.refreshTokenValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    refresh_token: {
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.UserMessage.REFRESH_TOKEN_IS_REQUIRED,
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
                try {
                    const [decode_refreshToken, findToken] = await Promise.all([
                        (0, jwt_1.verifyToken)({ token: value, privateKey: config_1.envConfig.secret_key_refresh_token }),
                        database_services_1.default.refreshToken.findOne({ token: value })
                    ]);
                    req.decode_refreshToken = decode_refreshToken;
                    if (findToken === null) {
                        throw new errors_1.ErrorWithStatus({
                            message: message_1.UserMessage.REFRESH_TOKEN_USED_OR_NOT_EXISTS,
                            status: httpStatus_1.default.UNAUTHORIZED
                        });
                    }
                    /**
                     * Khi lỗi xảy ra trong đoạn try:
                    Nếu lỗi là JsonWebTokenError, khối catch sẽ tạo một lỗi mới với thông báo tương ứng (error.message) và status httpStatus.UNAUTHORIZED.
                    Nếu lỗi không phải là JsonWebTokenError, nó sẽ rơi xuống throw error trong khối catch, chuyển lỗi này lên các lớp trên để xử lý.
                     */
                }
                catch (error) {
                    if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                        throw new errors_1.ErrorWithStatus({
                            message: "RefreshToken expired",
                            status: httpStatus_1.default.UNAUTHORIZED
                        });
                    }
                    throw error; // có tác dụng truyền tiếp lỗi lên các lớp trên của ứng dụng nếu lỗi không thuộc loại JsonWebTokenError
                }
                return true;
            }
        }
    }
}, ["cookies"]));
exports.emailVerifyValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    email_verify_token: {
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.UserMessage.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
                try {
                    const decode_emailVerifyToken = await (0, jwt_1.verifyToken)({
                        token: value,
                        privateKey: config_1.envConfig.secret_key_email_verify_token
                    });
                    req.decode_emailVerifyToken = decode_emailVerifyToken;
                }
                catch (error) {
                    if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                        throw new errors_1.ErrorWithStatus({
                            message: error.message,
                            status: httpStatus_1.default.UNAUTHORIZED
                        });
                    }
                }
                return true;
            }
        }
    }
}, ["body"]));
exports.forgotPasswordValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    email: {
        isEmail: {
            errorMessage: message_1.UserMessage.EMAIL_IS_VALID
        },
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.UserMessage.EMAIL_IS_REQUIRED,
                        status: httpStatus_1.default.BAD_REQUESTED
                    });
                }
                const user = await database_services_1.default.users.findOne({ email: value });
                if (!user) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.UserMessage.USER_NOT_FOUND,
                        status: httpStatus_1.default.NOTFOUND
                    });
                }
                req.user = user;
                return true;
            }
        }
    }
}, ["body"]));
exports.verifyForgotPasswordValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    forgot_password_token: forgotPasswordToken
}, ["body"]));
exports.resetPasswordValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    forgot_password_token: forgotPasswordToken,
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
}, ["body"]));
const verifyUserValidator = (req, res, next) => {
    const { verify } = req.decode_authorization;
    if (verify !== enum_1.UserVerifyStatus.Verified) {
        return next(new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_IS_NOT_VERIFIED,
            status: httpStatus_1.default.UNAUTHORIZED
        }));
    }
    next();
};
exports.verifyUserValidator = verifyUserValidator;
exports.changePasswordValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    old_password: {
        ...passwordSchema,
        custom: {
            options: async (value, { req }) => {
                const { user_id } = req.decode_authorization;
                const user = await database_services_1.default.users.findOne({
                    _id: new mongodb_1.ObjectId(user_id)
                });
                if (!user) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.UserMessage.USER_NOT_FOUND,
                        status: httpStatus_1.default.NOTFOUND
                    });
                }
                const isMatch = (0, scripto_1.hashPassword)(value) === user.password;
                if (!isMatch) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.UserMessage.OLD_PASSWORD_IS_INCORRECT,
                        status: httpStatus_1.default.BAD_REQUESTED
                    });
                }
                return true;
            }
        }
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
}, ["body"]));
exports.updateMeValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    name: {
        ...exports.nameSchema,
        optional: true
    },
    date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
    },
    avatar: {
        optional: true
    },
    numberPhone: {
        // ...numberPhoneSchema,
        custom: {
            options: async (value, { req }) => {
                // console.log(req.body)
                const { id } = req.params;
                const user = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(id) });
                if (!user) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.UserMessage.USER_NOT_FOUND,
                        status: httpStatus_1.default.NOTFOUND
                    });
                }
                // nếu số điện thoại trống thì bỏ qua
                // nếu đã từng có số điện thoại thì bắt buộc có
                if (user.numberPhone !== "" && value === "") {
                    throw new Error(message_1.UserMessage.NUMBER_PHONE_IS_REQUIRED);
                }
                if (value === "") {
                    return true;
                }
                const regex = /^\d+$/;
                if (!regex.test(value)) {
                    throw new Error(message_1.UserMessage.NUMBER_PHONE_IS_INVALID);
                }
                if (value.length < 10 || value.length > 11) {
                    throw new Error(message_1.UserMessage.NUMBER_PHONE_LENGTH_MIN_10_MAX_11);
                }
                return true;
            }
        },
        optional: true
    }
}, ["body"]));
const checkRole = (roleCheck) => {
    return (req, res, next) => {
        const { role } = req.decode_authorization;
        if (roleCheck.includes(role)) {
            return next();
        }
        next(new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.PERMISSION_DENIED,
            status: httpStatus_1.default.FORBIDDEN
        }));
    };
};
exports.checkRole = checkRole;
// body phần truyền lên
// params là tham số định danh như id
// query là tham số truy vấn ví dụ page, limit, type ...
// cookie là lưu refresh_token
// headers là nơi check Authorization (chứa accessToken)
