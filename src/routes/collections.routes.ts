import { Router } from "express"
import { getCollectionsController } from "~/controllers/collections.controllers"
import { getCollectionValidator } from "~/middlewares/collection.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const collectionsRoute = Router()

/**
 * Description: Get collections for client
 * Path: /
 * Method: GET
 */
collectionsRoute.get("/:slug", getCollectionValidator, wrapRequestHandler(getCollectionsController))

export default collectionsRoute
