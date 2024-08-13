import { db } from "#services"
import ai from "./handlers/ai.js"
import collection from "./handlers/collection.js"
import content from "./handlers/content.js"
import definition from "./handlers/definition.js"
import module from './handlers/module.js'
import page from "./handlers/page.js"
import setup from "./handlers/setup.js"
import { DataTable } from "./pages/dataTable.js"

export default {
    module,
    page,
    definition,
    collection,
    content,
    setup: setup,
    ai,
    table: {
        async load(body) {
            const {filters, perPage = 10, page = 1, selectable, actions, collectionId} = body

            const collection = await db('collections').query().filter('id', '=', collectionId).first()
            let query = db('contents').query().filter('_type', '=', collectionId)

            for(let filter of filters) {
                if(filter.value !== '') {
                    if(Array.isArray(filter.value)) {
                        filter.operator = 'in'
                        if(filter.value.length) {
                            query = query.filter(filter.field, filter.operator, filter.value)
                        }

                    } else {
                        query = query.filter(filter.field, filter.operator, filter.value)
                    }
                    
                }
            }

            const items = await query.paginate(+page, +perPage)
            
            return DataTable({filters, selectable, actions, perPage, page, collectionId: collection.id, fields: collection.fields, items: items.data })
        }

    }
}