import hbs from 'handlebars'
import { Button, EmptyTable, Form, Input, Page, Table } from '../public/shared/components.js'

import { db } from "#services";
import layouts from "./layouts.js";

const definitions = {}

async function getModuleContents(id) {
    return db('contents').query().filter('moduleId', '=', id).all()
}

function renderTemplate(template, data) {
    return template(data)
}

async function getPage(slug) {
    if(!slug.startsWith('/')) {
        slug = '/' + slug
    }

    const page = await db('pages').query().filter('slug', '=', slug).first()
    
    if(!page) return;

    return page // ?? page_404
}


async function renderModule(module, mode) {
    const contents = await getModuleContents(module.id)
    const definition = definitions[module.definitionId]

    const multiple = definition.multiple !== false;

    const value = multiple ? contents : contents[0]
    const props = {
        value
    }

    props.settings = {}
    const settings = await db('moduleSettings').query().filter('moduleId', '=', module.id).first() ?? {};

    for(let item of definition.settings?.fields ?? []) {
        props.settings[item.slug] = settings.value?.[item.slug] ?? item.defaultValue
    }

    const rendered = renderTemplate(definition.template, props);
    let previewContent = ''

    const fields = definition.contentType?.fields ?? []

    //#region Add Content
    const contentTypeAdd = Page({
        id: 'add',
        title: 'Insert Content', 
        actions: [
            Button({text: 'Back', action: 'open-module-list', color: 'default'})
        ].join(''),
        body: Form({
            cancelAction: 'open-module-list',
            handler: 'createContent', 
            fields: `<input data-input type="hidden" name="moduleId" value="${module.id}"/>` + fields.map(x => 
                Input({name: 'content.' + x.slug, placeholder: 'Enter ' + x.name, label: x.name})
            ).join('')
        })
    })
    //#endregion

    //#region Edit Content
    const contentTypeEdit = Page({
        id: 'edit',
        title: 'Update Content', 
        actions: [Button({text: 'Back', action: 'open-module-list', color: 'default'})].join(''),
        body: Form({
            cancelAction: 'open-module-list',
            handler: 'updateContent', 
            fields: `<input data-input type="hidden" name="content.id" value=""/><input data-input type="hidden" name="moduleId" value="${module.id}"/>` + fields.map(x => 
                Input({name: 'content.' + x.slug, placeholder: 'Enter ' + x.name, label: x.name})
            ).join('')
        })
    })
    //#endregion

    //#region Edit Single Content
    const contentTypeEditSingle = Page({
        id: 'edit-single',
        title: 'Update Content', 
        actions: [
            Button({text: 'Cancel', action: 'open-module-default', color: 'default'})
        ].join(''),
        body: Form({
            cancelAction: 'open-module-default',
            handler: 'updateContent',
            fields: (value ? `<input data-input type="hidden" name="id" value="${value.id}"/> <input data-input type="hidden" name="moduleId" value="${module.id}"/>` : "") + fields.map(x => 
                Input({name: 'content.' + x.slug, placeholder: 'Enter ' + x.name, label: x.name})
            ).join('')
        })
    })
    //#endregion

    //#region Delete Confirms
    const moduleDelete = `
        <div data-delete-confirm data-module-delete>
            <div data-confirm-body>
                <h3 data-confirm-title>Remove Module</h3>
                <p data-confirm-description>Are you sure to remove this module with all it's data?</p>

                <div data-confirm-actions>
                    <button data-action="module-delete-no" data-id="${module.id}" data-confirm-button-no>No</button>
                    <button data-action="module-delete-yes" data-id="${module.id}" data-confirm-button-yes>Yes</button>
                </div>
            </div>
        </div>
    `
    const contentTypeDelete = `
        <div data-delete-confirm data-content-delete>
            <div data-confirm-body>
                <h3 data-confirm-title>Remove Content</h3>
                <p data-confirm-description>Are you sure to remove this item?</p>

                <div data-confirm-actions>
                    <button data-action="content-delete-no" data-confirm-button-no>No</button>
                    <button data-action="content-delete-yes" data-confirm-button-yes data-content-id="">Yes</button>
                </div>
            </div>
        </div>
    `
    //#endregion

    //#region Settings
    const moduleSettings = Page({
        id: 'settings', 
        title: 'Module Settings', 
        actions: Button({text: 'Cancel', action: 'open-module-default'}), 
        body: definition.settings?.fields?.length ? Form({
            cancelAction: 'open-module-default', 
            handler: 'saveModuleSettings', 
            fields: (definition.settings?.fields??[]).map(x => 
                Input({name: x.slug, label: x.name, placeholder: 'Enter ' + x.name})
            ).join('')})
         : EmptyTable({
            title: 'No Settings', 
            description: "This module doesn't have any settings"
        })
    })
    //#endregion
    
    // #region Table
    let tableContent;
    if(contents.length > 0) {
        tableContent = Table({
            items: contents,
            head: fields.map(x=> `<th>${x.name}</th>`).join(''),
            row: (item) => `
                <tr>
                    ${fields.map(x => `<td>${item[x.slug]}</td>`).join('')}
                    <td>
                        <div data-table-actions>
                            <button data-action="open-edit-content" data-content-id="${item.id}" data-table-action data-table-action-edit>
                                Edit
                            </button>
                            <button data-action="open-delete-content-confirm" data-content-id="${item.id}" data-table-action data-table-action-delete>
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `,  
        })
    } else {
        tableContent = EmptyTable({
            title: 'No items!', 
            description: 'This module doesn\'t have data yet.'
        })
    }

    const contentTypeTable = Page({
        id: 'list',
        title: 'Module Contents',
        actions: [
            Button({action: 'open-module-default', text: 'Cancel'}),
            Button({action: 'open-module-insert', color: 'primary', text: 'Insert'}),
        ].join(''),
        body: tableContent
    })
    //#endregion

    function ModuleAction({icon, action}) {
        return `<div data-action="${action}">    
            ${icon}
        </div>`
    }

    //#region Module actions
    const moduleActions = `
    <div data-module-actions>${[
        ModuleAction({action: 'open-delete-module-confirm', icon: '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"/></svg>'}),
        ModuleAction({action: 'open-module-settings', icon: '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>'}),
        ModuleAction({action: 'open-module-data', icon: '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h8.925l-2 2H5v14h14v-6.95l2-2V19q0 .825-.587 1.413T19 21zm4-6v-4.25l9.175-9.175q.3-.3.675-.45t.75-.15q.4 0 .763.15t.662.45L22.425 3q.275.3.425.663T23 4.4t-.137.738t-.438.662L13.25 15zM21.025 4.4l-1.4-1.4zM11 13h1.4l5.8-5.8l-.7-.7l-.725-.7L11 11.575zm6.5-6.5l-.725-.7zl.7.7z"/></svg>'}),
        ModuleAction({action: 'drag-module-handle', icon: '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m12 22l-4.25-4.25l1.425-1.425L11 18.15V13H5.875L7.7 14.8l-1.45 1.45L2 12l4.225-4.225L7.65 9.2L5.85 11H11V5.85L9.175 7.675L7.75 6.25L12 2l4.25 4.25l-1.425 1.425L13 5.85V11h5.125L16.3 9.2l1.45-1.45L22 12l-4.25 4.25l-1.425-1.425L18.15 13H13v5.125l1.8-1.825l1.45 1.45z"/></svg>'}) 
    ].join('')}</div>
    `
    //#endregion
    
    if(mode === 'preview') {
        if(multiple) {
            previewContent = `${moduleDelete}<div data-data>${moduleSettings}${contentTypeTable}${contentTypeAdd}${contentTypeEdit}${contentTypeDelete}</div>` + moduleActions
        } else {
            previewContent = `${moduleDelete}<div data-data>${moduleSettings}${contentTypeEditSingle}</div>` + moduleActions
        }
    }

    return `<div${multiple ? ' data-multiple="true"' : ''}${contents.length > 0 ? ` data-content-id="${value.id}"` : ''} data-module-id="${module.id}"><div data-module-content>${rendered}</div>${previewContent}</div>`
}

async function loadModuleDefinitions() {
    const defs = await db('definitions').query().all()
    
    for(let definition of defs) {
        if(definition.path) {
            try {
                console.log(definition.path)
                definitions[definition.id] = await import(definition.path).then(res => res.default)
            } catch(err) {
                definitions[definition.id] = {}
            }
        } else {
            definitions[definition.id] = {}
        }
        definitions[definition.id].id = definition.id
        definitions[definition.id] = {...definitions[definition.id], ...definition }
    
        console.log('HERE: ', definitions[definition.id])
        definitions[definition.id].template = hbs.compile(definitions[definition.id].template)
    }   
}

function pageCreatePage() {
    return Page({
        title: 'Create Page',
        actions: '',
        body: Form({
            handler: 'createPage',
            fields: [
                Input({name: 'name', label: 'Name', placeholder: 'Enter Page Name'}),
                Input({name: 'title', label: 'Title', placeholder: 'Enter Title'}),
                Input({name: 'slug', label: 'Slug', placeholder: 'Enter Slug'}),
                Input({name: 'head', label: 'Head', placeholder: 'Enter Head content'}),
            ].join('')
        })
    })
}

function pageUpdatePage(page) {
    return Page({
        title: 'Update Page',
        actions: '',
        body: Form({
            cancelAction: 'navigate-back',
            handler: 'updatePage',
            fields: [
                `<input type="hidden" name="id" value="${page.id}" />`,
                Input({name: 'name', label: 'Name', placeholder: 'Enter Page Name'}),
                Input({name: 'title', label: 'Title', placeholder: 'Enter Title'}),
                Input({name: 'slug', label: 'Slug', placeholder: 'Enter Slug'}),
                Input({name: 'head', label: 'Head', placeholder: 'Enter Head content'}),
            ].join('')
        })
    })
}

//#region Create Definition
function createDefinitionTemplate() {
    return Page({
        id: 'create-definition',
        actions: [
            Button({text: 'Cancel', action: "close-create-definition"})
        ].join(''),
        title: `Create New Module`,
        body: Form({
            handler: 'createDefinition',
            fields: `
                <label data-label>
                    <span data-label-text>Name</span>
                    <input data-input name="name" placeholder="Enter module name" />
                </label>
                <label data-label>
                    <span data-label-text>Template</span>
                    <textarea data-textarea rows="20" name="template" placeholder="Enter module template (Handlebars)"></textarea>
                </label>
                <div>Content Type</div>
                <div>Is Multiple</div>
                <div>Settings</div>
            `,
            cancelAction: 'close-create-definition'
        })
    })
}
//#endregion

//#region Update Definition
function updateDefinitionTemplate(data) {
    return Page({
        id: 'update-definition',
        actions: [
            Button({text: 'Cancel', action: "close-update-definition"})
        ].join(''),
        title: `Update Module (${data.name})`,
        body: Form({
            handler: 'updateDefinition',
            fields: `
                <input type="hidden" name="id" value="" />
                <label data-label>
                    <span data-label-text>Name</span>
                    <input data-input name="name" placeholder="Enter module name"/>
                </label>
                <label data-label>
                    <span data-label-text>Template</span>
                    <textarea data-textarea rows="20" name="template" placeholder="Enter module template (Handlebars)"></textarea>
                </label>

                <label data-label-inline>
                    <input ${data.multiple ? 'checked' : ''} data-checkbox type="checkbox" name="multiple" value="true"></textarea>
                    <span data-label-text>Multiple</span>
                </label>

                <label data-label>
                    <span data-label-text>Content Type</span>
                    <div data-content-type-fields>
                        ${(data.contentTypes??[]).map((contentType, index) => ContentTypeField(contentType, index))}
                        <button type="button" data-button data-button-color="primary" data-button-action="add-field" style="align-self: start">Add Field</button>                    
                    </div>
                </label>
                <div>Is Multiple</div>
                <div>Settings</div>
            `,
            cancelAction: 'close-update-definition'
        })
    })
}
//#endregion

function createCollectionPage() {
    return Page({
        title: 'Create Collection',
        actions: [].join(''),
        body: Form({
            handler: 'createCollection',
            fields: [
                Input({name: 'name', label: 'Name', placeholder: 'Enter Name'}),
                `<label data-label>
                    <span data-label-text>Fields</span>
                    <div>
                        <div>
                            Loop for fields...
                        </div>
                        <button data-button data-button-color="primary">Add field</button>
                    </div>
                </label>`
            ].join('')
        })
    })
}

function updateCollectionPage(collection) {
    return 'update collection: ' + JSON.stringify(collection)
}

function collectionDataList(collection, items) {
    return 'list of data' + JSON.stringify({collection, items})
}

function collectionDataCreate(collection, items) {
    return 'create data item' + JSON.stringify({collection, items})
}

function collectionDataUpdate(collection, items, data) {
    return 'update data item' + JSON.stringify({collection, items, data})
}

function getUrl(query) {
    let res = `?mode=edit`
    for(let key in query) {
        res += '&' + key + '=' + query[key]
    }
    return res
}

function sidebarModules() {
    return `
        <div data-sidebar-title>Modules</div>
        <div data-sidebar-body data-definitions>
            ${Object.keys(definitions).map(key => definitions[key]).map(x => `<div data-definition-id="${x.id}" data-sidebar-item><span>${x.name}</span><a href="${getUrl({view: 'update-module', id: x.id})}" data-definition-settings>
            <svg data-definition-icon data-secondary-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
                
                </a></div>`).join('')}
            <a href="${getUrl({view: 'create-module'})}" data-sidebar-item data-sidebar-create-button>
                <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                Create Module
            </a>
        </div>
    `
}

function sidebarCollections(collections) {
    return `
        <div data-sidebar-title>Collections</div>
        <div data-sidebar-body>
            ${collections.map(x => `<div data-sidebar-item><span>${x.name}</span><span>
            <svg data-definition-icon data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
                
            </span></div>`).join('')}
            <a href="${getUrl({view: 'create-collection'})}" data-sidebar-item data-sidebar-create-button>
                <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                Create Collection
            </a>
        </div>
    `
}

function sidebarSettings() {
    return `
        <div data-sidebar-title>Settings</div>
        <div data-sidebar-body>
            List of setting categories
        </div>
    `

}

function sidebarPages(pages) {
    return `
        <div data-sidebar-title>Pages</div>
        <div data-sidebar-body>
            ${pages.map(x => `
                <div data-sidebar-item data-sidebar-page-item data-action="link" data-href="${x.slug}?mode=edit">
                    <div data-page-item-start>
                        <span>${x.name}</span>
                        <span data-page-item-slug>${x.slug}</span>
                    </div>
                    <a data-sidebar-icon href="${getUrl({view: 'update-page', id: x.id})}">
                        <svg data-secondary-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
                    </a>
                </div>`).join('')}
            <a href="${getUrl({view: 'create-page'})}" data-sidebar-item data-sidebar-create-button data-action="navigate" data-path="pages.create-page">
                <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                Create Page
            </a>
        </div>
    `
}

//#region Render body
export async function renderBody(body, {mode, url, view, ...query}) {
    await loadModuleDefinitions()

    
    let sidebar;
    let viewType = view === 'iframe' ? 'iframe' : 'page'
    let content;

    let pages = await db('pages').query().all()
    let collections = await db('contentTypes').query().all()
    let currentPage = pages.find(x => x.slug == url.split('?')[0])

    if(view === 'iframe') {
        sidebar = 'modules'
    } else if(view === 'create-page') {
        sidebar = 'pages'
        content = pageCreatePage()
    } else if(view === 'update-page') {
        sidebar = 'pages'
        const page = await db('pages').query().filter('id', '=', query.id).first()
        content = pageUpdatePage(page)
    } else if(view === 'create-module' ) {
        sidebar = 'modules'
        content = createDefinitionTemplate()
    } else if(view === 'update-module' ) {
        sidebar = 'modules'
        const definition = await db('definitions').query().filter('id', '=', query.id).first()
        content = updateDefinitionTemplate(definition)
        // ...
    } else if(view === 'create-collection') {
        sidebar = 'collections'
        content = createCollectionPage()
    } else if(view === 'update-collection') {
        sidebar = 'collections'
        content = updateCollectionPage({collection: 'TODO'})
    } else if(view === 'collection-data-list') {
        sidebar = 'collections'
        content = collectionDataList({collection: 'todo', list: ["T", "O","D","O"] })
    }else if(view === 'collection-data-create') {
        sidebar = 'collections'
        content = collectionDataCreate({collection: 'todo', list: ["T", "O","D","O"] })
    }else if(view === 'collection-data-update') {
        sidebar = 'collections'
        content = collectionDataUpdate({collection: 'todo', list: ["T", "O","D","O"], data: {data: true}})
    }



    if(mode === 'edit') 
        return `
    <div>
        <div data-toolbar>
            <div data-action="close-sidebar">
                <svg data-toolbar-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 16V8l-4 4zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm5-2h9V5h-9z"/></svg>
            </div>
            <div data-toolbar-logo>
                Logo(from settings)
            </div>
        </div>
        <div data-sidebar data-active="${sidebar}">
            <div data-sidebar-primary>
                <div data-sidebar-item-small data-action="navigate" data-path="modules.iframe">
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                </div>
                <div data-sidebar-item-small data-action="navigate" data-path="pages.iframe">
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M4 23q-.825 0-1.412-.587T2 21V7h2v14h11v2zm4-4q-.825 0-1.412-.587T6 17V3q0-.825.588-1.412T8 1h7l6 6v10q0 .825-.587 1.413T19 19zm6-11h5l-5-5z"/></svg>
                </div>
                <div data-sidebar-item-small data-action="navigate" data-path="collections.iframe">
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 11q-3.75 0-6.375-1.175T3 7q0-1.65 2.625-2.825Q8.25 3 12 3t6.375 1.175Q21 5.35 21 7q0 1.65-2.625 2.825Q15.75 11 12 11Zm0 5q-3.75 0-6.375-1.175T3 12V9.5q0 1.1 1.025 1.863q1.025.762 2.45 1.237q1.425.475 2.963.687q1.537.213 2.562.213t2.562-.213q1.538-.212 2.963-.687q1.425-.475 2.45-1.237Q21 10.6 21 9.5V12q0 1.65-2.625 2.825Q15.75 16 12 16Zm0 5q-3.75 0-6.375-1.175T3 17v-2.5q0 1.1 1.025 1.863q1.025.762 2.45 1.237q1.425.475 2.963.688q1.537.212 2.562.212t2.562-.212q1.538-.213 2.963-.688t2.45-1.237Q21 15.6 21 14.5V17q0 1.65-2.625 2.825Q15.75 21 12 21Z"/></svg>
                </div>
                <div data-sidebar-item-small data-action="navigate" data-path="settings.iframe">
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
                </div>
            </div>
            <div data-sidebar-secondary>            
                <div data-name="sidebar-modules">
                    ${sidebarModules()}
                </div>
                <div data-name="sidebar-pages">
                    ${sidebarPages(pages)}
                </div>
                <div data-name="sidebar-collections">
                    ${sidebarCollections(collections)}
                </div>
                <div data-name="sidebar-settings">
                    ${sidebarSettings()}
                </div>

            </div>
        </div>

        <div data-main data-active="${viewType}">
            <div data-name="iframe">
                <div data-content-header>
                    <h2 data-header-title>Edit (${currentPage.name})</h2>
                    <div data-header-actions>
                        <a data-button data-button-color="default" href="${getUrl({view: 'update-page', id: currentPage.id})}">Page Settings</a>
                        <a data-button data-button-color="primary" target="_blank" href="${currentPage.slug}">Preview</a>
                    </div>
                </div>
                <iframe class="iframe" src="${url.replace('mode=edit', 'mode=preview')}"></iframe>
            </div>
            <div data-name="page">
                ${content}
            </div>
        </div>
    </div>
    <script src="https://unpkg.com/sortablejs@1.15.2/Sortable.min.js"></script>
    <script type="module" src="/sitebuilder.edit.js"></script>
    `

    return `<div data-body>${(await Promise.all(body.map(x => renderModule(x, mode)))).join('')}</div>`
}
//#endregion

async function getPageModules(pageId) {
    return db('modules')
        .query()
        .filter('pageId', '=', pageId)
        .all()
        .then(res => res.sort((a, b) => a.order > b.order ? 1 : -1))
}

export async function renderPage(req, res) {    
    const page = await getPage(req.params[0])

    if(!page) return res.end('404')

    // context = {
    //     params: req.params,
    //     url: req.url,
        const mode = req.query.mode ?? 'view'
    // }

    const view = req.query.view ?? 'iframe'
    
    let {head, title} = page;
    let modules = await getPageModules(page.id)

    if(mode === 'edit') {
        head = (head ?? '') + '<link rel="stylesheet" href="/sitebuilder.edit.css">'
    } else if(mode === 'preview') {
        head = (head ?? '') + '<link rel="stylesheet" href="/sitebuilder.preview.css">'
    }

    const html = renderTemplate(layouts.default, {
        head, 
        body: await renderBody(modules, {...req.query, mode, url: req.url, view}), 
        title
    })

    res.send(html)

}