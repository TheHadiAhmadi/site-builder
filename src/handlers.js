import { db } from "#services"
import ai from "./handlers/ai.js"
import collection from "./handlers/collection.js"
import content from "./handlers/content.js"
import definition from "./handlers/definition.js"
import module from './handlers/module.js'
import page from "./handlers/page.js"
import setup from "./handlers/setup.js"
import { DataTable } from "./pages/dataTable.js"

export async function getDataTableItems({page, perPage, collection, filters}) {
    let query = db('contents').query().filter('_type', '=', collection.id)

    for(let field of collection.fields) {
        const filter = filters.find(x => x.field == field.slug)

        if(!filter) continue

        if(field.type === 'select') {
            filter.operator = 'in'
            if(filter.value.length) {
                query = query.filter(filter.field, filter.operator, filter.value)
            }
        }
        if(['input', 'textarea'].includes(field.type)) {
            filter.operator = 'like'
            if(filter.value != '') {
                query = query.filter(filter.field, filter.operator, filter.value)
            }
        }
        // TODO: Other field type filters
    }
    
    const items = await query.paginate(+page, +perPage)

    for(let item of items.data) {
        for(let field of collection.fields) {
            if(field.type == 'file') {
                if(field.multiple) {
                    item[field.slug] = await db('files').query().filter('id', 'in', item[field.slug]).all()
                } else {
                    item[field.slug] = await db('files').query().filter('id', '=', item[field.slug]).first()
                }
            }
        }
    }

    return items
}


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
            
            const items = await getDataTableItems({collection, page, perPage, filters})
            
            return DataTable({filters, selectable, actions, collectionId: collection.id, fields: collection.fields, items })
        }

    }
}