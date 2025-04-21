"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class Specification {
    _id;
    name;
    value;
    category_id;
    created_at;
    updated_at;
    constructor(specification) {
        const date = new Date();
        this._id = specification._id || new mongodb_1.ObjectId();
        this.name = specification.name;
        this.value = specification.value;
        this.category_id = specification.category_id;
        this.created_at = specification.created_at || date;
        this.updated_at = specification.updated_at || date;
    }
}
exports.default = Specification;
