"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controllers_1 = require("../controllers/category.controllers");
const handlers_1 = require("../utils/handlers");
const categoryClientRoute = (0, express_1.Router)();
/**
 * Description: Lấy danh sách category đang hoạt động (hiển thị cho client)
 * Path: /
 * Method: GET
 */
categoryClientRoute.get("/", (0, handlers_1.wrapRequestHandler)(category_controllers_1.getCategoryListIsActiveController));
/**
 * Description: Lấy danh sách menu category đang hoạt động (hiển thị cho client)
 * Path: /list-menu-category
 * Method: GET
 */
categoryClientRoute.get("/list-menu-category", (0, handlers_1.wrapRequestHandler)(category_controllers_1.getListCategoryMenuIsActiveController));
/**
 * Description: Lấy danh sách menu category đang hoạt động (hiển thị cho client)
 * Path: /list-menu-category
 * Method: GET
 */
categoryClientRoute.get("/banner", (0, handlers_1.wrapRequestHandler)(category_controllers_1.getBannerBaseOnSlugController));
exports.default = categoryClientRoute;
