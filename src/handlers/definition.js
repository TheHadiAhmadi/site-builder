import { db } from "#services"

export default {
    async create(body) {
        body.settings ??= []
        body.contentType ??= []
        body.multiple ??= false
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
    }
    
}