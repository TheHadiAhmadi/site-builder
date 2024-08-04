import { db } from "#services"

export default {
        
    async load(body) {
        return db('collections').query().filter('id', '=', body.id).first()
    },
    async create(body) {
        // create content type
        const res = await db('collections').insert(body)

        return {
            redirect: '?mode=edit&view=update-collection&id=' + res.id
        }
    },
    async createForModule(body) {
        // TODO: Can be merged with above
        return db('collections').insert(body)
    },
    async update(body) {
        const res = await db('collections').update(body)
        return {
            redirect: '?mode=edit&view=update-collection&id=' + res.id
        }
    },
}