import { db } from "#services"
import { join } from 'path'
import { html } from "svelite-html"
import { Form } from "../components.js"
import { FieldInput } from "../pages/collections.js"

function DynamicFieldInput(field, fields, linked, module, collections) {
    function getLinkedText(key) {
        return fields.find(x => x.slug === key)?.label ?? key
    }

    function fieldTypeSupports(thisField, otherField) {
        if(thisField.type === 'file') {
            return otherField.type === 'file' && otherField.file_type === thisField.file_type && otherField.multiple === thisField.multiple
        }
        if(thisField.type === 'relation') {
            return otherField.type === 'relation' && otherField.collectionId === thisField.collectionId && !!otherField.multiple === !!thisField.multiple
        }

        if(thisField.type === 'textarea') {
            return ['textarea', 'rich-text', 'input'].includes(otherField.type)
        }
        if(thisField.type === 'input') {
            return ['textarea', 'rich-text', 'input'].includes(otherField.type)
        }
        if(thisField.type === 'select') {
            return ['select'].includes(otherField.type)
        }
        if(thisField.type === 'checkbox') {
            return otherField.type === 'checkbox'
        }
        
        return thisField.type === otherField.type
    }

    const availableFields = fields.filter(otherField => fieldTypeSupports(field, otherField))
    function getLabel(label) {
        if(availableFields.length === 0) return `<span>${label}</span>`
        return `
            <span>${label}</span>    

            ${linked ? `
                <div style="margin-left: auto" data-badge>
                    <span style="font-weight: normal;">${getLinkedText(linked)}</span>
                    <div style="margin-left: 8px; width: 16px; height: 16px; cursor: pointer" data-action="unlink-module-prop" data-prop="${field.slug}" data-mod-id="${module.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m8.382 17.025l-1.407-1.4L10.593 12L6.975 8.4L8.382 7L12 10.615L15.593 7L17 8.4L13.382 12L17 15.625l-1.407 1.4L12 13.41z"/></svg>
                    </div>
                </div>
                ` : `
                <div tabindex="0" data-dropdown data-dropdown-trigger="hover" data-dropdown-placement="end" style="padding-left: 40px">
                    <div data-dropdown-target style="display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 24px; height: 24px; color: white; background-color: #0030f0f0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M17 20v-3h-3v-2h3v-3h2v3h3v2h-3v3zm-6-3H7q-2.075 0-3.537-1.463T2 12t1.463-3.537T7 7h4v2H7q-1.25 0-2.125.875T4 12t.875 2.125T7 15h4zm-3-4v-2h8v2zm14-1h-2q0-1.25-.875-2.125T17 9h-4V7h4q2.075 0 3.538 1.463T22 12"/></svg>
                    </div>
 
                    <div data-dropdown-menu>
                        ${availableFields.map(x => `<div data-action="link-module-prop" data-mod-id="${module.id}" data-prop="${field.slug}" data-field="${x.slug}" data-dropdown-item>${x.label}</div>`).join('')}
                    </div>
                </div>
            `}
        `

    }

    let resultField = field;

    if(linked) {
        resultField = JSON.parse(JSON.stringify(fields.find(x => x.slug === linked) ?? {}));
        resultField.slug = field.slug
    }
    
    let options = {
        ...resultField,
        label: getLabel(field.label),
        placeholder: 'Enter ' + field.label
    }
    if(options.type === 'select') {
        options.placeholder = 'Choose ' + field.label + '...'
    }

    if(options.type === 'file' && options.file_type === 'image') {
        options.size = 'small'
    }

    if(linked === 'content') {
        options.type = 'hidden'
    }
    
    return FieldInput(options, collections)
}

function sidebarModuleSettings(definition, module, collection, collections) {
    const fields = []
    fields.push({slug: 'settings.logo', label: 'Site\'s Logo', type: 'file', multiple: false, file_type: 'image'})
    fields.push({slug: 'settings.favicon', label: 'Site\'s Favicon', type: 'file', multiple: false, file_type: 'image'})
    fields.push({slug: 'settings.title', label: 'Site\'s Title', type: 'input'})
    fields.push({slug: 'settings.meta_title', label: 'Site\'s Meta Title', type: 'input'})
    fields.push({slug: 'settings.meta_description', label: 'Site\'s Meta Description', type: 'textarea'})
    
    if(collection) {
        fields.push({type: 'relation', label: 'Item (dynamic)', multiple: false, collectionId: collection.id, slug: 'content'})

        for(let field of collection.fields) {
            fields.push({...field, label: '' + field.label, slug: 'content.' + field.slug})

            if(field.type === 'relation' && !field.multiple) {
                for(let f of field.collection?.fields ?? []) {
                    fields.push({...f, label: `${field.label}'s ${f.label}`, slug: 'content.' + field.slug + '.' + f.slug})
                }
            }
        }
    }

    return html`
            <div data-sidebar-module-settings-body>
                ${definition.props?.length ? Form({
                    name: 'module-settings',
                    cancelAction: 'open-add-module',
                    handler: 'module.saveSettings',
                    card: false,
                    fields:  [
                        `<input type="hidden" name="slug" value="">`,
                        `<input type="hidden" name="id" value="${module.id}">`,
                        (definition.props ?? []).map(prop => DynamicFieldInput(prop, fields, module.links?.[prop.slug], module, collections)).join('')
                    ],
                    cancelAction: 'open-add-module'
                }): `
                    <span data-alert>
                        <svg class="margin-right: 0.5rem" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/></svg>
                        <span>This block doesn't have any configurable fields</span>
                    </span>
                `}
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
        const collections = await db('collections').query().all()
        
        if(page?.collectionId) {
            const collection = await db('collections').query().filter('id', '=', page.collectionId).first();
            if(collection) {
                for(let field of collection.fields) {
                    if(field.type === 'relation') {
                        field.collection = await db('collections').query().filter('id', '=', field.collectionId).first();
                    }
                    
                }
                
                const res = sidebarModuleSettings(definition, module, collection, collections)
                
                return res;
            }


        } 
        
        const res = sidebarModuleSettings(definition, module, null, collections)
        return res
    },
    async loadSettings(body) {
        const {slug} = body
        const original = await db('modules').query().filter('id', '=', body.id).first()
        const settings = await db('settings').query().first() ?? {}
        const page = await getPageFromModule(original)
        let props = original.props ?? {}

        if(page.dynamic) {
            const collection = await db('collections').query().filter('id', '=', page.collectionId).first()
            if(!page.slug.includes('{{')) {
                page.slug = join(page.slug, '{{slug}}')
            }
            const dynamicParts = page.slug.split('/').filter(part => part.startsWith('{{') && part.endsWith('}}'));

            let regexStr = page.slug;
            for (const dynamicPart of dynamicParts) {
                regexStr = regexStr.replace(dynamicPart, '([^/]+)');
            }
            const regex = new RegExp(`^${regexStr}$`);

            const match = slug.match(regex);
            if (match) {
                const params = {};
                dynamicParts.forEach((part, index) => {
                    const paramName = part.slice(2, -2);
                    params[paramName] = match[index + 1];
                });

                let query = db('contents').query().filter('_type', '=', collection.id)
                for(let key in params) {
                    console.log('filter', key, params[key])
                    query = query.filter(key, '=', params[key])
                }
                const content = await query.first()
            
                for(let key in original.links ?? {}) {
                    // content[original.links[key]] = props[key]
                    const [first, second] = original.links[key].split('.')
                    if(second) {
                        if(first == 'content') {
                            props[key] = content[second]
                        } else {
                            props[key] = settings[second]
                        }
                    } else {
                        if(first === 'content') {
                            props[key] = content
                        }
                    }
                }
                // await db('contents').update(content)
            }
        } else {
            for(let key in original.links ?? {}) {
                const [first, second] = original.links[key].split('.')
                if(first == 'settings') {
                    props[key] = settings[second]
                }
            }
        }

        if(props) {
            return props
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
            if(!page.slug.includes('{{')) {
                page.slug = join(page.slug, '{{slug}}')
            }
            const dynamicParts = page.slug.split('/').filter(part => part.startsWith('{{') && part.endsWith('}}'));
            
            let regexStr = page.slug;
            for (const dynamicPart of dynamicParts) {
                regexStr = regexStr.replace(dynamicPart, '([^/]+)');
            }
            const regex = new RegExp(`^${regexStr}$`);

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
                    const [first, second, third, fourth] = original.links[key].split('.')
                    
                    if(second) {
                        if(first === 'content') {
                            if(fourth) {
                                content[second][third][fourth] = props[second][third][fourth]
                            } else if(third) {
                                content[second][third] = props[second][third]
                            } else {
                                content[second] = props[key]
                            }
                        }
                    }
                }
                if(content) {
                    await db('contents').update(content)
                }
            }
        }

        let settings = await db('settings').query().first() ?? {}

        for(let key in original.links) {
            const [first, second, third, fourth] = original.links[key].split('.')
            if(second) {
                if(first === 'settings') {
                    if(fourth) {
                        settings[second][third][fourth] = props[second][third][fourth]
                    } else if(third) {
                        settings[second][third] = props[second][third]
                    } else {
                        settings[second] = props[key]
                    }
                }
            }
        }
        if(settings.id) {
            await db('settings').update(settings)
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
