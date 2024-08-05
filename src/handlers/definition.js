import { db } from "#services"

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
        const original = await db('definitions').query().filter('id', '=', id).first()
        original.props.push(field)
        await db('definitions').update(original)

    },
    async removeField(body) {
        const original = await db('definitions').query().filter('id', '=', body.id).first()
        original.props = original.props.filter(x => x.slug !== body.slug)

        await db('definitions').update(original)

    }
    
}