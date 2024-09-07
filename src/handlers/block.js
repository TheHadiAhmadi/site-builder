import { db } from "#services"
import { FieldForm, FieldTypeSelector } from "../pages/fields.js"

export default {
    async create(body) {
        body.props ??= []
        await db('blocks').insert(body)

        return {            
            redirect: '/admin'
        }
    },
    async update(body) {
        body.settings ??= []
        body.contentType ??= []
        body.multiple ??= false
        await db('blocks').update(body)

        return {
            pageReload: true
        }
    },
    async load(body) {
        const res = await db('blocks').query().filter('id', '=', body.id).first()
        return res
    },
    async getByModuleId(body) {
        const module = await db('modules').query().filter('id', '=', body.moduleId).first();

        const block = await db('blocks').query().filter('id', '=', module.blockId).first()
        return block
    },
    async addField(body) {
        const {id, ...field} = body
        
        if(field.type === 'select')
            field.items = field.items.split('\n').map(x => x.trim())
        
        const block = await db('blocks').query().filter('id', '=', id).first()

        block.props.push(field)

        await db('blocks').update(block)

        return {
            pageReload: true
        }
    },
    async setField(body) {
        const {id, ...field} = body
        const block = await db('blocks').query().filter('id', '=', id).first()

        if(field.type === 'select')
            field.items = field.items.split('\n').map(x => x.trim())
        
        block.props = block.props.map(x => {
            if(x.slug === field.slug) {
                return field
            }
            return x
        })

        const res = await db('blocks').update(block)

        return {
            pageReload: true
        }
    },
    async removeField(body) {
        const original = await db('blocks').query().filter('id', '=', body.id).first()
        original.props = original.props.filter(x => x.slug !== body.slug)

        await db('blocks').update(original)

    },
    async getFieldTypeSelector(body) {
        return FieldTypeSelector({action: 'module-add-field-choose-type'})
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
        await db('blocks').remove(body.id)
        const modules = await db('modules').query().filter('blockId', '=', body.id).all()

        for(let module of modules) {
            await db('modules').remove(module.id)
        }
        return {
            redirect: '/admin'
        }
    }
    
}