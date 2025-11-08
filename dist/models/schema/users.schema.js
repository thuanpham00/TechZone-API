"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const enum_1 = require("../../constant/enum");
class User {
    _id;
    name;
    email;
    password;
    role;
    numberPhone;
    date_of_birth;
    avatar;
    email_verify_token;
    forgot_password_token;
    verify;
    employeeInfo;
    created_at;
    updated_at;
    constructor(user) {
        const date = new Date();
        this._id = user._id;
        this.name = user.name || "";
        this.email = user.email;
        this.password = user.password;
        this.role = user.role;
        this.numberPhone = user.numberPhone || "";
        this.date_of_birth = user.date_of_birth || new Date(1990, 0, 1);
        this.avatar = user.avatar || "";
        this.email_verify_token = user.email_verify_token || "";
        this.forgot_password_token = user.forgot_password_token || "";
        this.verify = user.verify || enum_1.UserVerifyStatus.Unverified;
        this.employeeInfo = user.employeeInfo;
        this.created_at = user.created_at || date;
        this.updated_at = user.updated_at || date;
    }
}
exports.User = User;
