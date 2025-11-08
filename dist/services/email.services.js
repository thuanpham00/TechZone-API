"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_services_1 = __importDefault(require("./database.services"));
class EmailService {
    async getEmailLog(limit, page) {
        const $match = {};
        const [result, total, totalOfPage] = await Promise.all([
            database_services_1.default.emailLog
                .aggregate([
                {
                    $match
                },
                { $sort: { created_at: -1 } },
                {
                    $skip: limit && page ? limit * (page - 1) : 0
                },
                {
                    $limit: limit ? limit : 5
                }
            ])
                .toArray(),
            database_services_1.default.emailLog
                .aggregate([
                {
                    $match
                },
                {
                    $count: "total"
                }
            ])
                .toArray(),
            database_services_1.default.emailLog
                .aggregate([
                {
                    $match
                },
                {
                    $skip: limit && page ? limit * (page - 1) : 0
                },
                {
                    $limit: limit ? limit : 5
                },
                {
                    $count: "total"
                }
            ])
                .toArray()
        ]);
        return {
            result,
            limitRes: limit || 5,
            pageRes: page || 1,
            total: total[0]?.total || 0,
            totalOfPage: totalOfPage[0]?.total || 0
        };
    }
}
const emailService = new EmailService();
exports.default = emailService;
