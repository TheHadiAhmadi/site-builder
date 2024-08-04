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
}