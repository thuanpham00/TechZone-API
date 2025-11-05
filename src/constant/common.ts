import { ObjectId } from "mongodb"
import { MediaType } from "./enum"

export interface Media {
  id: ObjectId
  url: string
  type: MediaType
}
