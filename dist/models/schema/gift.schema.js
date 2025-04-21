"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Gift {
    _id;
    name;
    description;
    value;
    applicableProducts;
    created_at;
    updated_at;
    constructor(gift) {
        const date = new Date();
        this._id = gift._id;
        this.name = gift.name;
        this.description = gift.description;
        this.value = gift.value;
        this.applicableProducts = gift.applicableProducts || [];
        this.created_at = gift.created_at || date;
        this.updated_at = gift.updated_at || date;
    }
}
exports.default = Gift;
