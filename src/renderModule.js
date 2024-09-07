import { html } from 'svelite-html';
import hbs from 'handlebars'
import { db } from '#services';
import { getDataTableItems } from './pages/dataTable.js';

export async function normalizeCollectionContent(collection, item, depth = 1) {
    for(let field of collection.fields) {
        if(item[field.slug] && field.type === 'relation' && depth < 3) {
            item[field.slug] = await loadRelationFieldType(item[field.slug], field, depth + 1)
        }
        if(item[field.slug] && field.type === 'file' && depth < 3) {
            let query = db('files').query();
            if(field.multiple) {
                item[field.slug] = await query.filter('id', 'in', item[field.slug]).all()
            } else {
                item[field.slug] = await query.filter('id', '=', item[field.slug]).first()
            }
        }
    }

    return item
}

export async function loadRelationFieldType(value, field, depth = 1) {
    const collection = await db('collections').query().filter('id', '=', field.collectionId).first()
    let query = db('contents').query().filter('_type', '=', collection.id)
        
    if(field.multiple) {
        let items = []
        if(Array.isArray(value)) {
            items = await db('contents').query().filter('_type', '=', field.collectionId).filter('id', 'in', value).all()
        } else if(value?.filters) {
            const {filters, page, perPage} = value
            items = await getDataTableItems({page, perPage, filters, query, fields: collection.fields}).then(res => res.data)

        } else {
            items = []
        }
        
        value = await Promise.all(items.map(item => normalizeCollectionContent(collection, item, depth)))

    } else {
        let item;
        if(value?.filters) {
            const {filters, page, perPage} = value
            
            const items = await getDataTableItems({page, perPage, filters, query, fields: collection.fields})
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
    return value
}

export async function renderModule(module, {props, mode, permissions, request}) {
    module.props ??= {}
    const settings = await db('settings').query().first() ?? {}


    let block = await db('blocks').query().filter('id', '=', module.blockId).first()

    async function loadModuleProps(block, module) {
        for(let item of block.props ?? []) {
            if(item.type === 'slot') {
                let result = ''
                const modules = await db('modules').query().filter('moduleId', '=', module.id).all().then(res => res.sort((a, b) => a.order > b.order ? 1 : -1))
                let index = 0
                for(let mod of modules) {
                    if(block.name === 'Columns') {
                        const cols = mod.cols ?? 12
                        result += `
                            <div data-column data-cols="${cols}">
                                ${await renderModule(mod, { props, request, mode, permissions})}
                            </div>
                        `
                    } else {
                        result += await renderModule(mod, { props, request, mode, permissions})
                    }
                    index = index + 1;
                }

                if(result) {
                    if(block.name === 'Columns' || block.name === 'Section') {
                        module.props[item.slug] = result
                    }
                    else {
                        module.props[item.slug] = `<div data-slot="${module.id}">${result}</div>`
                    }
                } else {               
                    module.props[item.slug] = `<div data-slot="${module.id}" data-action="open-add-block" data-slot-empty>
                        <span>Drag a Block here or</span>
                        <span data-create-block-text data-action="open-create-block-modal">Create new Block</span>
                    </div>`
                }
            } 
            else if(item.type === 'relation') {
                if (!module.links[item.slug]) {
                    module.props[item.slug] = await loadRelationFieldType(module.props[item.slug], item)
                }
            } else if(item.type === 'file') {
                if (!module.links[item.slug]) {
                    let query = db('files').query();
                    if(item.multiple) {
                        module.props[item.slug] = await query.filter('id', 'in', module.props[item.slug]).all()
                    } else {
                        module.props[item.slug] = await query.filter('id', '=', module.props[item.slug]).first()
                    }
                }
            } else {
                module.props[item.slug] = module.props[item.slug] ?? item.defaultValue
            }
        }
    }

    if (module.links) {
        for (let key in module.links) {
            const parts = module.links[key].split('.');
            if(parts.length > 1) {
                module.props[key] = parts.reduce((prev, curr) => prev[curr], 
                { 
                    settings, 
                    content: props.pageContent 
                })
            } else {
                module.props[key] = props.pageContent
            }
        }
    }
    
    await loadModuleProps(block, module)

    
    let rendered;
    try {
        if(block.name == 'Columns') {
            rendered = `<div data-columns="${module.id}">${module.props.content}</div>`;
        } else {
            rendered = hbs.compile(block.template)({settings, ...module.props});
        }
    } catch(err) {
        rendered = 'Something went wrong: ' + err.message
    }

    let previewContent = ''

    function ModuleAction({icon, action, id = ''}) {
        return `<div data-module-action data-action="${action}" data-id=${id}>    
            ${icon}
        </div>`
    }

    let startActions = []
    let endActions = []

    const iconAdd = '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>'
    const iconDelete = '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"/></svg>'
    const iconResizeSection = '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 10h16M4 14h16m-8-4V6m-.05-4c1.035-.03 3.47 4.008 2.987 4.389c-.548.431-2.177-.6-2.695-.832c-.312-.14-.448-.136-.76.023c-1.406.717-2.11 1.075-2.414.856l-.003-.002C8.58 6.08 10.939 2.03 11.95 2m.1 20c-1.035.03-3.47-4.008-2.987-4.389c.548-.431 2.177.6 2.695.832c.312.14.448.136.76-.023c1.406-.717 2.11-1.075 2.414-.856l.003.002c.485.354-1.874 4.404-2.885 4.434M12 18v-4" color="currentColor"/></svg>'
    const iconAi = '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48"><path fill="currentColor" d="M34 6c-1.368 4.944-3.13 6.633-8 8c4.87 1.367 6.632 3.056 8 8c1.368-4.944 3.13-6.633 8-8c-4.87-1.367-6.632-3.056-8-8m-14 8c-2.395 8.651-5.476 11.608-14 14c8.524 2.392 11.605 5.349 14 14c2.395-8.651 5.476-11.608 14-14c-8.524-2.392-11.605-5.349-14-14"/></svg>'
    const iconSettings = `<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zM11 20h1.975l.35-2.65q.775-.2 1.438-.587t1.212-.938l2.475 1.025l.975-1.7l-2.15-1.625q.125-.35.175-.737T17.5 12t-.05-.787t-.175-.738l2.15-1.625l-.975-1.7l-2.475 1.05q-.55-.575-1.212-.962t-1.438-.588L13 4h-1.975l-.35 2.65q-.775.2-1.437.588t-1.213.937L5.55 7.15l-.975 1.7l2.15 1.6q-.125.375-.175.75t-.05.8q0 .4.05.775t.175.75l-2.15 1.625l.975 1.7l2.475-1.05q.55.575 1.213.963t1.437.587zm1.05-4.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5M12 12"/></svg>`

    if(block.name === 'Section') {
        const icon = module.props.fullWidth ? 
        '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M42 6v36M17 19l-5 5m0 0l5 5m-5-5h24m-5-5l5 5m0 0l-5 5M6 6v36"/></svg>'
        : 
        '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M11.988 32L4 24.006L12 16m24.012 0L44 23.994L36 32M4 24h40"/></svg>' 

        startActions = [
            ModuleAction({icon: iconAdd, action: 'add-section'}),
            ModuleAction({icon: iconSettings, action: 'open-module-settings'}),
            ModuleAction({icon, action: 'toggle-full-width'}),
            // ModuleAction({icon: 'color', action: 'toggle-section-background-menu'}),
        ]
        endActions = [
            ModuleAction({icon: iconDelete, action: 'open-delete-module-confirm'}),
        ]
    } else {

        startActions = [
            ModuleAction({
                icon: [
                    '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m12 22l-4.25-4.25l1.425-1.425L11 18.15V13H5.875L7.7 14.8l-1.45 1.45L2 12l4.225-4.225L7.65 9.2L5.85 11H11V5.85L9.175 7.675L7.75 6.25L12 2l4.25 4.25l-1.425 1.425L13 5.85V11h5.125L16.3 9.2l1.45-1.45L22 12l-4.25 4.25l-1.425-1.425L18.15 13H13v5.125l1.8-1.825l1.45 1.45z"/></svg>',
                    block.name === 'Section' ? '' : '<div data-module-action-text>' + block.name + '</div>'
                ].join('')
            }),
            !['Section', 'Columns', 'RichText'].includes(block.name) ? ModuleAction({icon: iconAi, action: 'open-edit-module-ai', id: block.id}) : '',

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

    if(mode === 'view') {
        return rendered
    }
    
    if(mode === 'preview' && permissions) {

        previewContent = `
            ${moduleActions}
        `
    }

    if(block.name === 'Columns')
    {
        return `${rendered}`
    }

    let sectionResizer = ''

    if(block.name === 'Section') {
        sectionResizer += `<div data-section-resizer data-mode="top"></div>`
        sectionResizer += `<div data-section-resizer data-mode="bottom"></div>`
    }

    return `
        <div ${block.name === 'Section' ? 'data-action="close-module-settings"' : 'data-action="open-module-settings"'} data-module-id="${module.id}">
            <div data-module-content>
                ${sectionResizer}
                ${rendered}
            </div>
            ${previewContent}
        </div>
    `
}
