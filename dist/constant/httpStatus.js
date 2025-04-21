"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpStatus = {
    OK: 200,
    CREATED: 201,
    BAD_REQUESTED: 400,
    UNPROCESSABLE_ENTITY: 422,
    UNAUTHORIZED: 401,
    NOTFOUND: 404,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
    PARTIAL_CONTENT: 206
};
exports.default = httpStatus;
