import { db } from "#services"

export default {
    async create(body) {
        const page = await db('pages').query().filter('slug', '=', body.slug).first()

        await db('modules').insert({
            pageId: page.id,
            definitionId: body.definitionId,
            order: body.index + 1,
        })
        return {
            redirect: ''
        }
    },
    async delete(body) {
        await db('modules').remove(body.id)
    },
    async loadSettings(body) {
        const moduleId = body.moduleId

        const res = await db('moduleSettings').query().filter('moduleId', '=', moduleId).first()
        if(res) {
            return res.value
        } else {
            return {}
        }
    },
    async saveSettings(body) {
        const moduleId = body.moduleId

        const original = await db('moduleSettings').query().filter('moduleId', '=', moduleId).first()

        if(!original) {
            await db('moduleSettings').insert({moduleId, value: body.content})
        } else {
            await db('moduleSettings').update({id: original.id, moduleId, value: body.content})
        }
    },

    async updateOrders(body) {
        for(let mod of body.modules) {
            const original = await db('modules').query().filter('id', '=', mod.id).first()
            original.order = mod.order
            await db('modules').update(original)
        }
    },
    async update(body) {
        console.log('updateModule', body)
        if(!body.multiple) body.multiple = false;
        await db('modules').update(body)
    },
    async getModule(body) {
        return db('modules').query().filter('id', '=', body.id).first()

    },
}
