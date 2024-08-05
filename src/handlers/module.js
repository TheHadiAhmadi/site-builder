import { db } from "#services"
import { html } from "svelite-html"
import { Form } from "../components.js"
import { FieldInput } from "../pages/collections.js"

function sidebarModuleSettings(definition, module) {
    return html`
        <div data-sidebar-module-settings-title data-sidebar-title>
            <span>${definition.name} Settings</span>
        </div>
        <div data-sidebar-module-settings-body data-sidebar-body>
            ${Form({
                name: 'module-settings',
                handler: 'module.saveSettings',
                fields: [
                    `<input type="hidden" name="id" value="${module.id}">`,
                    definition.props.map(prop => FieldInput(prop)).join('')
                ],
                cancelAction: 'navigate-to-default-view'
            })}
        </div>
    `
}

export default {
    async create(body) {
        const page = await db('pages').query().filter('slug', '=', body.slug).first()

        await db('modules').insert({
            pageId: page.id,
            definitionId: body.definitionId,
            order: body.index + 1,
            props: {}
        })
        return {
            redirect: ''
        }
    },
    async delete(body) {
        await db('modules').remove(body.id)
    },
    async getSettingsTemplate(body) {
        const moduleId = body.id
        const module = await db('modules').query().filter('id', '=', moduleId).first();
        const definition = await db('definitions').query().filter('id', '=', module.definitionId).first();
        
        const res = sidebarModuleSettings(definition, module)
        return res
    },
    async loadSettings(body) {
        const res = await db('modules').query().filter('id', '=', body.id).first()
        if(res) {
            return res.props
        } else {
            return {}
        }
    },
    async saveSettings(body) {
        const {id, ...props} = body
        const original = await db('modules').query().filter('id', '=', body.id).first()

        await db('modules').update({...original, props})
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
