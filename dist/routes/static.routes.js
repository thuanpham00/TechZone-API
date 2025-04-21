"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const static_controllers_1 = require("../controllers/static.controllers");
const staticRoute = (0, express_1.Router)();
staticRoute.get("/image/:name", static_controllers_1.serveImageController);
exports.default = staticRoute;
