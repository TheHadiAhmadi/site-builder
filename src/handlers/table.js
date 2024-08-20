import { db } from "#services"
import { CollectionDataTable } from "../pages/dataTable.js"

export default {
    async load(body) {
        const {filters, perPage = 10, page = 1, selectable, actions, collectionId} = body

        const collection = await db('collections').query().filter('id', '=', collectionId).first()
                
        return CollectionDataTable({perPage, page, filters, selectable, actions, collectionId: collection.id })
    }

}