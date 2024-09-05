import { db } from "#services"
import { FieldForm, FieldTypeSelector } from "../pages/fields.js"

export default {
        
    async load(body) {
        return db('collections').query().filter('id', '=', body.id).first()
    },
    async create(body) {
        // create content type
        body.fields = [
            {slug: "name", label: 'Name', type: 'input', default: true},
            {slug: "slug", label: 'Slug', type: 'input', hidden: true}
        ]
        
        const res = await db('collections').insert(body)

        return {
            redirect: '?view=collections.update&id=' + res.id
        }
    },
    async createForModule(body) {
        // TODO: Can be merged with above
        return db('collections').insert(body)
    },
    async update(body) {
        const res = await db('collections').update(body)
        return {
            redirect: '?view=collections.update&id=' + res.id
        }
    },
    async addField(body) {
        const {id, ...field} = body
        
        if(field.type === 'select')
            field.items = field.items.split('\n').map(x => x.trim())
        
        const collection = await db('collections').query().filter('id', '=', id).first()

        collection.fields.push(field)

        await db('collections').update(collection)

        return {
            pageReload: true
        }
    },
    async setField(body) {
        const {id, ...field} = body
        const collection = await db('collections').query().filter('id', '=', id).first()

        if(field.type === 'select')
            field.items = field.items.split('\n').map(x => x.trim())
        
        collection.fields = collection.fields.map(x => {
            if(x.slug === field.slug) {
                return field
            }
            return x
        })

        const res = await db('collections').update(collection)

        return {
            pageReload: true
        }
    },
    async removeField(body) {
        const {id, slug} = body
        const collection = await db('collections').query().filter('id', '=', id).first()

        collection.fields = collection.fields.filter(x => x.slug !== slug)

        const res = await db('collections').update(collection)

        return {
            pageReload: true
        }
    },
    async getFieldTypeSelector(body) {
        return FieldTypeSelector()
    },
    async getFieldForm(body) {
        const type = body.type
        const handler = body.handler
        const mode = body.mode
        const id = body.id

        const collections = await db('collections').query().all()
        
        return FieldForm({mode, collections, handler, type, id})
    },
    async delete(body) {
        await db('collections').remove(body.id)

        const data = await db('contents').query().filter('_type', '=', body.id).all()
        for(let item in data) {
            await db('contents').remove(item.id)
        }

        return {
            redirect: '?mode=edit'
        }
    }
}