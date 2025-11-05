"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.Role = void 0;
const mongodb_1 = require("mongodb");
class Role {
    _id;
    name;
    description;
    key;
    permissions;
    created_at;
    updated_at;
    constructor(role) {
        const date = new Date();
        this._id = role._id || new mongodb_1.ObjectId();
        this.name = role.name;
        this.description = role.description;
        this.key = role.key;
        this.permissions = role.permissions || [];
        this.created_at = role.created_at || date;
        this.updated_at = role.updated_at || date;
    }
}
exports.Role = Role;
class Permission {
    _id;
    name;
    code;
    api_endpoints;
    created_at;
    updated_at;
    constructor(permission) {
        const date = new Date();
        this._id = permission._id || new mongodb_1.ObjectId();
        this.name = permission.name;
        this.code = permission.code;
        this.api_endpoints = permission.api_endpoints;
        this.created_at = permission.created_at || date;
        this.updated_at = permission.updated_at || date;
    }
}
exports.Permission = Permission;
