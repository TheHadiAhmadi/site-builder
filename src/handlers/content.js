import { db } from "#services"
export default {
    async create(body) {
        const moduleId = body.moduleId
        const content = body.content
        const _type = body._type

        await db('contents').insert({
            moduleId,
            _type,
            ...content
        })
    },
    async update(body) {
        const moduleId = body.moduleId
        const content = body.content

        await db('contents').update({
            moduleId,
            ...content
        })
    },
    async get(body) {
        const contentId = body.contentId

        return {
            data: await db('contents').query().filter('id', '=', contentId).all()
        }
    },
    async delete(body) {
        const moduleId = body.moduleId
        const id = body.id

        await db('contents').remove(id)
    },

    async insertCollectionContent(body) {
        if(!body._type) return;

        const res = await db('contents').insert(body)

        return {
            redirect: `?mode=edit&view=collection-data-list&id=${body._type}`
        }
    },
    async updateCollectionContent(body) {
        if(!body._type) return;

        await db('contents').update(body)

        return {
            redirect: `?mode=edit&view=collection-data-list&id=${body._type}`
        }
    },
    async loadCollectionContent(body) {
        const res = await db('contents').query().filter('id', '=', body.id).first()

        return res;
    },
    async removeCollectionContent(body) {
        const res = await db('contents').remove(body.id)

        return {
            reload: true
        }        
    }

}