import { db } from "#services"
import { FieldForm, FieldTypeSelector } from "../pages/fields.js"

export default {
    async create(body) {
        body.props ??= []
        await db('definitions').insert(body)

        return {            
            redirect: '?mode=edit'
        }
    },
    async update(body) {
        body.settings ??= []
        body.contentType ??= []
        body.multiple ??= false
        await db('definitions').update(body)

        return {
            pageReload: true
        }
    },
    async load(body) {
        const res = await db('definitions').query().filter('id', '=', body.id).first()
        return res
    },
    async getByModuleId(body) {
        const module = await db('modules').query().filter('id', '=', body.moduleId).first();

        const definition = await db('definitions').query().filter('id', '=', module.definitionId).first()
        return definition
    },
    async addField(body) {
        const {id, ...field} = body
        
        if(field.type === 'select')
            field.items = field.items.split('\n').map(x => x.trim())
        
        const definition = await db('definitions').query().filter('id', '=', id).first()

        definition.props.push(field)

        await db('definitions').update(definition)

        return {
            pageReload: true
        }
    },
    async setField(body) {
        const {id, ...field} = body
        const definition = await db('definitions').query().filter('id', '=', id).first()

        if(field.type === 'select')
            field.items = field.items.split('\n').map(x => x.trim())
        
        console.log(field)
        definition.props = definition.props.map(x => {
            if(x.slug === field.slug) {
                return field
            }
            return x
        })

        console.log(JSON.stringify(definition))

        const res = await db('definitions').update(definition)

        return {
            pageReload: true
        }
    },
    async removeField(body) {
        const original = await db('definitions').query().filter('id', '=', body.id).first()
        original.props = original.props.filter(x => x.slug !== body.slug)

        await db('definitions').update(original)

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
        await db('definitions').remove(body.id)
        const modules = await db('modules').query().filter('definitionId', '=', body.id).all()

        for(let module of modules) {
            await db('modules').remove(module.id)
        }
        return {
            redirect: '?mode=edit'
        }
    }
    
}