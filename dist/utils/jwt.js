"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signToken = ({ payload, privateKey, options = {
    algorithm: "HS256" // thuật toán mặc định
} }) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign(payload, privateKey, options, (error, code) => {
            if (error) {
                return reject(error);
            }
            resolve(code);
        });
    });
};
exports.signToken = signToken;
const verifyToken = ({ token, privateKey }) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, privateKey, (error, decode) => {
            if (error) {
                return reject(error);
            }
            resolve(decode);
        });
    });
};
exports.verifyToken = verifyToken;
