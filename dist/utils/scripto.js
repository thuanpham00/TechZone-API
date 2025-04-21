"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
const crypto_1 = require("crypto");
const dotenv_1 = require("dotenv");
const config_1 = require("./config");
(0, dotenv_1.config)();
function sha256(content) {
    return (0, crypto_1.createHash)("sha256").update(content).digest("hex");
}
function hashPassword(password) {
    return sha256(password + config_1.envConfig.secret_key_hash_password);
}
