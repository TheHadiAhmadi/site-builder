import { db } from "#services"
import { html } from "svelite-html"
import { Checkbox, File, Form, Input, Select, Textarea } from "../components.js"
import { FieldInput, RelationFieldModal } from "../pages/collections.js"

function DynamicFieldInput(field, fields, linked, module) {
    function getLinkedText(key) {
        return fields.find(x => x.slug === key)?.label ?? key
    }
    function getLabel(label) {
        return `
            <span>${label}</span>    

            ${linked ? `
                <div style="padding: 0; display: flex; align-items: center; border-radius: 10px; font-size: 12px; background-color: #0040f050; color: blue">
                    <span style="padding: 4px;">${getLinkedText(linked)}</span>
                    <div style="width: 16px; height: 16px; cursor: pointer" data-action="unlink-module-prop" data-prop="${field.slug}" data-mod-id="${module.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m8.382 17.025l-1.407-1.4L10.593 12L6.975 8.4L8.382 7L12 10.615L15.593 7L17 8.4L13.382 12L17 15.625l-1.407 1.4L12 13.41z"/></svg>
                    </div>
                </div>
                ` : `
                <div tabindex="0" data-dropdown data-dropdown-trigger="hover" data-dropdown-placement="end" style="padding-left: 40px">
                    <div data-dropdown-target style="display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 24px; height: 24px; color: white; background-color: #0030f0f0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M17 20v-3h-3v-2h3v-3h2v3h3v2h-3v3zm-6-3H7q-2.075 0-3.537-1.463T2 12t1.463-3.537T7 7h4v2H7q-1.25 0-2.125.875T4 12t.875 2.125T7 15h4zm-3-4v-2h8v2zm14-1h-2q0-1.25-.875-2.125T17 9h-4V7h4q2.075 0 3.538 1.463T22 12"/></svg>
                    </div>
 
                    <div data-dropdown-menu>
                        ${fields.map(x => `<div data-action="link-module-prop" data-mod-id="${module.id}" data-prop="${field.slug}" data-field="${x.slug}" data-dropdown-item>${x.label}</div>`).join('')}
                    </div>
                </div>
            `}
        `

    }
    
    let options = {
        slug: field.slug, 
        label: getLabel(field.label),
        placeholder: 'Enter ' + field.label
    }
    if(field.type === 'select') {
        options.items = field.items
        options.multiple = field.multiple
        options.placeholer = 'Choose' + field.label
        // return Input({name: field.slug, label: field.name, placeholder: 'Enter ' + field.name})
    }
    
    return FieldInput(field)
}

function sidebarModuleSettings(definition, module, collection) {
    if(!collection) {
        return html`
            <div data-sidebar-module-settings-title data-sidebar-title>
                <span>${definition.name} Settings</span>
            </div>
            <div data-sidebar-module-settings-body data-sidebar-body>
                ${Form({
                    name: 'module-settings',
                    handler: 'module.saveSettings',
                    cancelAction: 'open-add-module',
                    fields: [
                        `<input type="hidden" name="id" value="${module.id}">`,
                        definition.props.map(prop => FieldInput(prop)).join('')
                    ],
                    cancelAction: 'open-add-module'
                })}
            </div>
        `
    }

    return html`
            <div data-sidebar-module-settings-title data-sidebar-title>
                <span>${definition.name} Settings *</span>
            </div>
            <div data-sidebar-module-settings-body data-sidebar-body>
                ${Form({
                    name: 'module-settings',
                    cancelAction: 'open-add-module',
                    handler: 'module.saveSettings',
                    fields: [
                        `<input type="hidden" name="slug" value="">`,
                        `<input type="hidden" name="id" value="${module.id}">`,
                        definition.props.map(prop => DynamicFieldInput(prop, collection.fields, module.links?.[prop.slug], module)).join('')
                    ],
                    cancelAction: 'open-add-module'
                })}
            </div>
        `
}

async function getPageFromModule(module) {
    if(module.pageId) {
        return db('pages').query().filter('id', '=', module.pageId).first()
    }
    
    const mod = await db('modules').query().filter('id', '=', module.moduleId).first()
    return getPageFromModule(mod)
}

export default {
    async create(body) {
        await db('modules').insert({
            moduleId: body.moduleId,
            definitionId: body.definitionId,
            order: body.order,
            cols: 12,
            props: {},
            links: {}
        })
        return {
            redirect: ''
        }
    },
    async delete(body) {
        await db('modules').remove(body.id)
    },
    async createSection(body) {
        const definitions = await db('definitions').query().all();

        const mod = await db('modules').insert({
            pageId: body.pageId,
            definitionId: definitions.find(x => x.name === 'Section').id,
            order: body.order,
            props: {
                fullWidth: false,
            },
            links: {}
        })

        const mod2 = await db('modules').insert({
            moduleId: mod.id,
            definitionId: definitions.find(x => x.name === 'Columns').id,
            order: 0,
            props: {
                cols: [],
                colsLg: []
            },
            links: {}
        })
    },
    async getSettingsTemplate(body) {
        const moduleId = body.id
        const module = await db('modules').query().filter('id', '=', moduleId).first();
        const page = await getPageFromModule(module);
        const definition = await db('definitions').query().filter('id', '=', module.definitionId).first();
        
        if(page?.collectionId) {
            const collection = await db('collections').query().filter('id', '=', page.collectionId).first();
            
            const res = sidebarModuleSettings(definition, module, collection, body.slug)

            return res;


        } else {
            const res = sidebarModuleSettings(definition, module)
            return res
        }
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
        const {id, slug, ...props} = body
        const original = await db('modules').query().filter('id', '=', body.id).first()
        const page = await getPageFromModule(original)

        if(page.dynamic) {
            const collection = await db('collections').query().filter('id', '=', page.collectionId).first()
            const dynamicParts = page.slug.split('/').filter(part => part.startsWith('{{') && part.endsWith('}}'));
            const params = {};

            let regexStr = page.slug;
            for (const dynamicPart of dynamicParts) {
                regexStr = regexStr.replace(dynamicPart, '([^/]+)');
            }
            const regex = new RegExp(`^${regexStr}$`);

            console.log('match', slug, regex)
            const match = slug.match(regex);
            if (match) {
                const params = {};
                dynamicParts.forEach((part, index) => {
                    const paramName = part.slice(2, -2);
                    params[paramName] = match[index + 1];
                });

                let query = db('contents').query().filter('_type', '=', collection.id)
                for(let key in params) {
                    query = query.filter(key, '=', params[key])
                }
                const content = await query.first()
            

                for(let key in original.links) {
                    content[original.links[key]] = props[key]
                }
                await db('contents').update(content)
            }
        }

        await db('modules').update({...original, props})
    },

    async updateOrders(body) {
        for(let mod of body.modules) {
            const original = await db('modules').query().filter('id', '=', mod.id).first()

            if(mod.moduleId) {
                original.moduleId = mod.moduleId
                original.cols = mod.cols
                original.colsLg = mod.colsLg
            }
            original.order = mod.order
            await db('modules').update(original)
        }
    },
    async update(body) {
        if(!body.multiple) body.multiple = false;
        await db('modules').update(body)
    },
    async getModule(body) {
        return db('modules').query().filter('id', '=', body.id).first()

    },
    async linkProp(body) {
        const {moduleId, prop, field} = body
        const module = await db('modules').query().filter('id', '=', moduleId).first()

        module.links[prop] = field

        await db('modules').update(module)
    },
    async unlinkProp(body) {
        const {moduleId, prop} = body
        const module = await db('modules').query().filter('id', '=', moduleId).first()

        delete module.links[prop]

        await db('modules').update(module)
    },
    
}
