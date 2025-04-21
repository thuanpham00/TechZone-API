"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
class RefreshToken {
    _id;
    token;
    user_id;
    iat;
    exp;
    created_at;
    constructor({ _id, token, user_id, iat, exp, created_at }) {
        this._id = _id;
        this.token = token;
        this.user_id = user_id;
        this.created_at = created_at || new Date();
        this.iat = new Date(iat * 1000);
        this.exp = new Date(exp * 1000);
    }
}
exports.RefreshToken = RefreshToken;
