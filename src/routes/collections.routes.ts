import { Router } from "express"
import { getCollectionsController } from "~/controllers/collections.controllers"
import { getCollectionValidator } from "~/middlewares/collection.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const collectionsRoute = Router()

collectionsRoute.get("/:slug", getCollectionValidator, wrapRequestHandler(getCollectionsController))

export default collectionsRoute
