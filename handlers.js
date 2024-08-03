import { db } from "#services"

export default {
    async createModule(body) {
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
    async deleteModule(body) {
        await db('modules').remove(body.moduleId)
    },
    async createContent(body) {
        const moduleId = body.moduleId
        const content = body.content
        const _type = body._type

        await db('contents').insert({
            moduleId,
            _type,
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
    },
    async updateModule(body) {
        console.log('updateModule', body)
        if(!body.multiple) body.multiple = false;
        await db('modules').update(body)
    },
    async getModule(body) {
        return db('modules').query().filter('id', '=', body.id).first()

    },
    async createDefinition(body) {
        body.settings ??= []
        body.contentType ??= []
        body.multiple ??= false
        await db('definitions').insert(body)

        return {            
            redirect: '?mode=edit'
        }
    },
    async updateDefinition(body) {
        body.settings ??= []
        body.contentType ??= []
        body.multiple ??= false
        await db('definitions').update(body)

        return {
            pageReload: true
        }
    },
    async loadDefinition(body) {
        const res = await db('definitions').query().filter('id', '=', body.id).first()
        return res
    },
    async createPage(body) {
        // body.settings ??= []
        // body.contentType ??= []
        await db('pages').insert(body)

        return {
            redirect: body.slug + '?mode=edit'
        }        
    },
    async loadPage(body) {
        return db('pages').query().filter('id', '=', body.id).first()
    },
    async updatePage(body) {
        await db('pages').update(body)
        return {
            pageReload: true
        }
    },
    async loadCollection(body) {
        return db('collections').query().filter('id', '=', body.id).first()
    },
    async createCollection(body) {
        // create content type
        const res = await db('collections').insert(body)

        return {
            redirect: '?mode=edit&view=update-collection&id=' + res.id
        }
    },
    async createCollectionForModule(body) {
        // TODO: Can be merged with above
        return db('collections').insert(body)
    },
    async updateCollection(body) {
        const res = await db('collections').update(body)
        return {
            redirect: '?mode=edit&view=update-collection&id=' + res.id
        }
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