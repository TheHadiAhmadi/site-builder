import { db } from "#services"

export default {
    async createModule(body) {
        const page = await db('pages').query().filter('slug', '=', body.slug).first()

        await db('modules').insert({
            pageId: page.id,
            definitionId: body.definitionId,
            order: body.index + 1,
        })
    },
    async deleteModule(body) {
        await db('modules').remove(body.moduleId)
    },
    async createContent(body) {
        const moduleId = body.moduleId
        const content = body.content

        await db('contents').insert({
            moduleId,
            ...content
        })
    },
    async updateContent(body) {
        const moduleId = body.moduleId
        const content = body.content

        await db('contents').update({
            moduleId,
            ...content
        })
    },
    async loadModuleSettings(body) {
        const moduleId = body.moduleId

        const res = await db('moduleSettings').query().filter('moduleId', '=', moduleId).first()
        if(res) {
            return res.value
        } else {
            return {}
        }
    },
    async saveModuleSettings(body) {
        const moduleId = body.moduleId

        const original = await db('moduleSettings').query().filter('moduleId', '=', moduleId).first()

        console.log()
        if(!original) {
            await db('moduleSettings').insert({moduleId, value: body.content})
        } else {
            await db('moduleSettings').update({id: original.id, moduleId, value: body.content})
        }
    },
    async getContent(body) {
        const contentId = body.contentId

        return {
            data: await db('contents').query().filter('id', '=', contentId).all()
        }
    },
    async deleteContent(body) {
        const moduleId = body.moduleId
        const id = body.id

        await db('contents').remove(id)
    },
    async updateModules(body) {
        for(let mod of body.modules) {
            const original = await db('modules').query().filter('id', '=', mod.id).first()
            original.order = mod.order
            await db('modules').update(original)
        }
    }
}