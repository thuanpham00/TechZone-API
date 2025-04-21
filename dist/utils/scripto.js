"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
const crypto_1 = require("crypto");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
function sha256(content) {
    return (0, crypto_1.createHash)("sha256").update(content).digest("hex");
}
function hashPassword(password) {
    return sha256(password + process.env.SECRET_KEY_HASH_PASSWORD);
}
