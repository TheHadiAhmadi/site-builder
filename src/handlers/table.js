import { db } from "#services"

export default {
    async load(body) {
        const {filters, perPage = 10, page = 1, selectable, actions, collectionId} = body

        const collection = await db('collections').query().filter('id', '=', collectionId).first()
        
        let query = db('contents').query().filter('_type', '=', collection.id)

        const items = await getDataTableItems({query, fields: collection.fields, page, perPage, filters, expandRelations: true})
        
        return CollectionDataTable({filters, selectable, actions, collectionId: collection.id, fields: collection.fields, items })
    }

}