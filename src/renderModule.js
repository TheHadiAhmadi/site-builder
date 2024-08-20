import { html } from 'svelite-html';
import { db } from '#services';
import { getDataTableItems } from './handlers.js';

async function normalizeCollectionContent(collection, item, depth = 1) {
    for(let field of collection.fields) {
        if(field.type === 'relation' && depth < 3) {
            item[field.slug] = await loadRelationFieldType(item[field.slug], field, depth + 1)
        }
    }

    return item
}

export async function loadRelationFieldType(value, field, depth = 1) {
    const collection = await db('collections').query().filter('id', '=', field.collectionId).first()
        
    if(field.multiple) {
        let items = []
        if(Array.isArray(value)) {
            items = await db('contents').query().filter('_type', '=', field.collectionId).filter('id', 'in', value).all()
        } else if(value?.filters) {
            const {filters, page, perPage} = value
            items = await getDataTableItems({page, perPage, filters, collection}).then(res => res.data)

        } else {
            items = []
        }
        value = await Promise.all(items.map(item => normalizeCollectionContent(collection, item, depth)))

    } else {
        let item;
        if(value?.filters) {
            const {filters, page, perPage} = value
            const items = await getDataTableItems({page, perPage, filters, collection})
            item = items.data[0]
        } else {
            const id = value
            item = await db('contents').query().filter('_type', '=', field.collectionId).filter('id', '=', id).first()
        }
        if(item) {
            value = await normalizeCollectionContent(collection, item, depth)
        } else {
            value = null
        }
    }
    console.log('after load relation field type', value)
    return value
}

export async function renderModule(module, {props, mode, definitions, permissions, request}) {
    module.props ??= {}
    const settings = await db('settings').query().first() ?? {}


    let definition = definitions[module.definitionId]

    async function loadModuleProps(definition, module) {
        for(let item of definition.props ?? []) {
            if(item.type === 'slot') {
                let result = ''
                const modules = await db('modules').query().filter('moduleId', '=', module.id).all().then(res => res.sort((a, b) => a.order > b.order ? 1 : -1))
                let index = 0
                for(let mod of modules) {
                    if(definition.name === 'Columns') {
                        const cols = mod.cols ?? 12
                        result += `
                            <div data-column data-cols="${cols}">
                                ${await renderModule(mod, { props, request, mode, definitions, permissions})}
                            </div>
                        `
                    } else {
                        result += await renderModule(mod, { props, request, mode, definitions, permissions})
                    }
                    index = index + 1;
                }

                if(result) {
                    if(definition.name === 'Columns' || definition.name === 'Section') {
                        module.props[item.slug] = result
                    }
                    else {
                        module.props[item.slug] = `<div data-slot="${module.id}">${result}</div>`
                    }
                } else {               
                    module.props[item.slug] = `<div data-slot="${module.id}" data-action="open-add-module" data-slot-empty></div>`
                }
            } 
            else if(item.type === 'relation') {
                console.log(module.props[item.slug], item)
                module.props[item.slug] = await loadRelationFieldType(module.props[item.slug], item)
            } else {
                module.props[item.slug] = module.props[item.slug] ?? item.defaultValue
            }
        }
    }
    
    if(definition.load) {
        console.log('Module has load function')
        module.props = {
            ...module.props, 
            ...(await definition.load({request, db, definition, module}))
        }
        if(module.props.items) {
            console.log(module.props.items.filters)
        }
    }

    await loadModuleProps(definition, module)

    if(module.links) {
        for(let key in module.links) {
            const [firstpart, ...parts] = module.links[key].split('.')
            if(parts[0]) {
                const value = [firstpart, ...parts].reduce((prev, curr) => {
                    return prev[curr]
                }, {settings, content: props.pageContent})

                console.log('value: ', value, {settings, content: props.pageContent})
                module.props[key] = value

            } else {
                if(firstpart == 'content') {
                    module.props[key] = props.pageContent.id
                }
            }
          
        }
    }

    
    let rendered;
    try {
        if(definition.name == 'Columns') {
            rendered = `<div data-columns="${module.id}">${module.props.content}</div>`;
        } else {
            rendered = definition.template({settings, ...module.props});
        }
    } catch(err) {
        rendered = 'Something went wrong: ' + err.message
    }

    let previewContent = ''

    function ModuleAction({icon, action}) {
        return `<div data-module-action data-action="${action}">    
            ${icon}
        </div>`
    }

    let startActions = []
    let endActions = []

    const iconAdd = '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>'
    const iconDelete = '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"/></svg>'
    const iconResizeSection = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 10h16M4 14h16m-8-4V6m-.05-4c1.035-.03 3.47 4.008 2.987 4.389c-.548.431-2.177-.6-2.695-.832c-.312-.14-.448-.136-.76.023c-1.406.717-2.11 1.075-2.414.856l-.003-.002C8.58 6.08 10.939 2.03 11.95 2m.1 20c-1.035.03-3.47-4.008-2.987-4.389c.548-.431 2.177.6 2.695.832c.312.14.448.136.76-.023c1.406-.717 2.11-1.075 2.414-.856l.003.002c.485.354-1.874 4.404-2.885 4.434M12 18v-4" color="currentColor"/></svg>'

    if(definition.name === 'Section') {
        const icon = module.props.fullWidth ? 
        '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M42 6v36M17 19l-5 5m0 0l5 5m-5-5h24m-5-5l5 5m0 0l-5 5M6 6v36"/></svg>'
        : 
        '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M11.988 32L4 24.006L12 16m24.012 0L44 23.994L36 32M4 24h40"/></svg>' 

        startActions = [
            // ModuleAction({icon: settings, action: 'open-module-settings'}),
            ModuleAction({icon: iconAdd, action: 'add-section'}),
            ModuleAction({icon, action: 'toggle-full-width'}),
        ]
        endActions = [
            ModuleAction({icon: iconDelete, action: 'open-delete-module-confirm'}),
        ]
    } else {

        startActions = [
            ModuleAction({
                icon: [
                    '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m12 22l-4.25-4.25l1.425-1.425L11 18.15V13H5.875L7.7 14.8l-1.45 1.45L2 12l4.225-4.225L7.65 9.2L5.85 11H11V5.85L9.175 7.675L7.75 6.25L12 2l4.25 4.25l-1.425 1.425L13 5.85V11h5.125L16.3 9.2l1.45-1.45L22 12l-4.25 4.25l-1.425-1.425L18.15 13H13v5.125l1.8-1.825l1.45 1.45z"/></svg>',
                    definition.name === 'Section' ? '' : '<div data-module-action-text>' + definition.name + '</div>'
                ].join('')
            })
        ]
        endActions = [
            ModuleAction({icon: iconDelete, action: 'open-delete-module-confirm'}),

        ]
    }

    let moduleActions = html`
        <div data-action="drag-module-handle" data-module-actions>
            <div data-module-actions-start>
                ${startActions}
            </div>
            <div data-module-actions-end>
                ${endActions}
            </div>
        </div>

    `
    
    if(mode === 'preview' && permissions) {

        previewContent = `
            ${moduleActions}
        `
    }

    if(definition.name === 'Columns')
    {
        return `${rendered}`
    }

    let sectionResizer = ''

    if(definition.name === 'Section') {
        sectionResizer += `<div data-section-resizer data-mode="top"></div>`
        sectionResizer += `<div data-section-resizer data-mode="bottom"></div>`
    }

    return `
        <div ${definition.name === 'Section' ? '' : 'data-action="open-module-settings"'} data-module-id="${module.id}">
            <div data-module-content>
                ${sectionResizer}
                ${rendered}
            </div>
            ${previewContent}
        </div>
    `
}
