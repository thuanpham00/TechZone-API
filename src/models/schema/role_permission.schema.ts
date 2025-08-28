import { ObjectId } from "mongodb"

interface RoleType {
  _id?: ObjectId
  name: string // VD: "Admin", "Customer"
  description: string
  key: string
  permissions?: ObjectId[] // tham chiếu sang Permission[]
  created_at?: Date
  updated_at?: Date
}

export class Role {
  _id?: ObjectId
  name: string
  description: string
  key: string
  permissions: ObjectId[]
  created_at: Date
  updated_at: Date
  constructor(role: RoleType) {
    const date = new Date()
    this._id = role._id || new ObjectId()
    this.name = role.name
    this.description = role.description
    this.key = role.key
    this.permissions = role.permissions || []
    this.created_at = role.created_at || date
    this.updated_at = role.updated_at || date
  }
}

interface PermissionType {
  _id?: ObjectId
  name: string // VD: "Manage Products"
  code: string // VD: "product:read", "product:write"
  api_endpoints: {
    method: string // "GET", "POST", ...
    path: string // "/api/products"
  }
  created_at?: Date
  updated_at?: Date
}

export class Permission {
  _id?: ObjectId
  name: string
  code: string
  api_endpoints: {
    method: string
    path: string
  }
  created_at: Date
  updated_at: Date
  constructor(permission: PermissionType) {
    const date = new Date()
    this._id = permission._id || new ObjectId()
    this.name = permission.name
    this.code = permission.code
    this.api_endpoints = permission.api_endpoints
    this.created_at = permission.created_at || date
    this.updated_at = permission.updated_at || date
  }
}
