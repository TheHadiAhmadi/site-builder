import { db } from "#services"

export default {
    async create(body) {
        // body.settings ??= []
        // body.contentType ??= []
        await db('pages').insert(body)

        return {
            redirect: body.slug + '?mode=edit'
        }        
    },
    async load(body) {
        return db('pages').query().filter('id', '=', body.id).first()
    },
    async update(body) {
        await db('pages').update(body)
        return {
            pageReload: true
        }
    },
    async delete(body) {
        async function deleteModule(module) {
            const modules = await db('modules').query().filter('moduleId', '=', module.id).all()
            for(let mod of modules) {
                await deleteModule(mod)
            }
            await db('modules').remove(module.id)
        }

        await db('pages').remove(body.id)
        const modules = await db('modules').query().filter('pageId', '=', 'id').all()
        for(let module of modules) {
            deleteModule(module)
        }
        return {
            redirect: '?mode=edit'
        }
    }
}