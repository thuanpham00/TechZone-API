"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receipt = exports.Supply = exports.Supplier = void 0;
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
class Receipt {
    _id;
    items; // danh sách sản phẩm trong 1 đơn hàng
    totalAmount; // Tổng giá trị toàn bộ đơn hàng
    totalItem; // số lượng sản phẩm trong đơn hàng
    importDate; // Ngày nhập hàng
    note;
    created_at;
    updated_at;
    constructor(receipt) {
        const date = new Date();
        this._id = receipt._id || new mongodb_1.ObjectId();
        this.items = receipt.items;
        this.totalAmount = receipt.totalAmount;
        this.totalItem = receipt.totalItem;
        this.importDate = receipt.importDate;
        this.note = receipt.note || "";
        this.created_at = receipt.created_at || date;
        this.updated_at = receipt.updated_at || date;
    }
}
exports.Receipt = Receipt;
// Cái api này là dùng để sử dụng khi nhập hàng (hàng mới đã giao) -> mình tự cập nhật số lượng sản phẩm khi có hàng mới về - để quản lý đầu vào
// flow tạo 1 đơn hàng (gồm danh sách sản phẩm)
// tạo 1 đơn hàng -> chọn sản phẩm -> chọn nhà cung cấp -> sau đó render ra giá nhập -> tự fill (productId, supplierId, pricePerUnit) -> người dùng nhập quantity và render tự động ra totalPrice
// lần lượt add các sản phẩm
// sau đó tự cập nhật totalAmount và totalItem
// tự render ra ngày nhập hàng
// note, created_at, updated_at ko bắt buộc
