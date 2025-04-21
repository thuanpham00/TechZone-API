"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collections_controllers_1 = require("../controllers/collections.controllers");
const collection_middlewares_1 = require("../middlewares/collection.middlewares");
const handlers_1 = require("../utils/handlers");
const collectionsRoute = (0, express_1.Router)();
/**
 * Description: Get collections for client
 * Path: /
 * Method: GET
 */
collectionsRoute.get("/:slug", collection_middlewares_1.getCollectionValidator, (0, handlers_1.wrapRequestHandler)(collections_controllers_1.getCollectionsController));
exports.default = collectionsRoute;
