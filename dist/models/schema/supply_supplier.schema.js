"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Supply = exports.Supplier = void 0;
const mongodb_1 = require("mongodb");
class Supplier {
    _id;
    name;
    contactName;
    email;
    phone;
    address;
    taxCode;
    description;
    created_at;
    updated_at;
    constructor(supplier) {
        const date = new Date();
        this._id = supplier._id || new mongodb_1.ObjectId();
        this.name = supplier.name;
        this.contactName = supplier.contactName;
        this.email = supplier.email;
        this.phone = supplier.phone;
        this.address = supplier.address;
        this.taxCode = supplier.taxCode;
        this.description = supplier.description || "";
        this.created_at = supplier.created_at || date;
        this.updated_at = supplier.updated_at || date;
    }
}
exports.Supplier = Supplier;
class Supply {
    _id;
    productId;
    supplierId;
    importPrice;
    warrantyMonths;
    leadTimeDays;
    description;
    created_at;
    updated_at;
    constructor(supply) {
        const date = new Date();
        this._id = supply._id || new mongodb_1.ObjectId();
        this.productId = supply.productId;
        this.supplierId = supply.supplierId;
        this.importPrice = supply.importPrice;
        this.warrantyMonths = supply.warrantyMonths || 0;
        this.leadTimeDays = supply.leadTimeDays || 0;
        this.description = supply.description || "";
        this.created_at = supply.created_at || date;
        this.updated_at = supply.updated_at || date;
    }
}
exports.Supply = Supply;
