import hbs from 'handlebars'
import express from 'express'
import multer from 'multer'
import { db } from '#services'
import handlers from './handlers.js'
import {existsSync} from 'node:fs'
import {mkdir, writeFile} from 'node:fs/promises'
import { Button, EmptyTable, Form, Input, Page, Table } from './components.js'

let context = {}

const definitions = {}

const app = express()

app.use(express.json())
app.use(express.static('./public'))
app.use('/files', express.static('./uploads'))

const layouts = {
    default: hbs.compile(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        {{{head}}}
        <title>{{title}}</title>
    </head>
    <body>
        <div>
            {{{body}}}
        </div>
    </body>
    </html>`)
}

async function getPage(slug) {
    if(!slug.startsWith('/')) {
        slug = '/' + slug
    }

    const page = await db('pages').query().filter('slug', '=', slug).first()
    // return db('contents').query().filter('moduleId', '=', id).all()
    
    if(!page) return;

    return page // ?? page_404
}

async function getModuleContents(id) {
    return db('contents').query().filter('moduleId', '=', id).all()
}

function renderTemplate(template, data) {
    return template(data)
}

async function renderModule(module) {
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
            Button({text: 'Back', action: 'open-list', color: 'default'})
        ].join(''),
        body: Form({
            cancelAction: 'open-list',
            handler: 'createContent', 
            fields: fields.map(x => 
                Input({name: x.slug, placeholder: 'Enter ' + x.name, label: x.name})
            ).join('')
        })
    })
    //#endregion

    //#region Edit Content
    const contentTypeEdit = Page({
        id: 'edit',
        title: 'Update Content', 
        actions: [Button({text: 'Back', action: 'open-list', color: 'default'})].join(''),
        body: Form({
            cancelAction: 'open-list',
            handler: 'updateContent', 
            fields: `<input data-input type="hidden" name="id" value=""/>` + fields.map(x => 
                Input({name: x.slug, placeholder: 'Enter ' + x.name, label: x.name})
            ).join('')
        })
    })
    //#endregion

    //#region Edit Single Content
    const contentTypeEditSingle = Page({
        id: 'edit-single',
        title: 'Update Content', 
        actions: [
            Button({text: 'Cancel', action: 'open-default', color: 'default'})
        ].join(''),
        body: Form({
            cancelAction: 'open-default',
            handler: 'updateContent',
            fields: (value ? `<input data-input type="hidden" name="id" value="${value.id}"/>` : "") + fields.map(x => 
                Input({name: x.slug, placeholder: 'Enter ' + x.name, label: x.name})
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
                    <button data-module-confirm-button-no>No</button>
                    <button data-module-confirm-button-yes>Yes</button>
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
                    <button data-content-confirm-button-no>No</button>
                    <button data-content-confirm-button-yes data-content-id="">Yes</button>
                </div>
            </div>
        </div>
    `
    //#endregion

    //#region Settings
    const moduleSettings = Page({
        id: 'settings', 
        title: 'Module Settings', 
        actions: Button({text: 'Cancel', action: 'open-default'}), 
        body: definition.settings?.fields?.length ? Form({
            cancelAction: 'open-default', 
            handler: 'saveModuleSettings', 
            fields: (definition.settings?.fields??[]).map(x => 
                Input({name: x.slug, label: x.name, placeholder: 'Enter ' + x.name})
            ).join('')})
         : ''
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
                            <button data-content-id="${item.id}" data-table-action data-table-action-edit>
                                Edit
                            </button>
                            <button data-content-id="${item.id}" data-table-action data-table-action-delete>
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
            Button({action: 'open-default', text: 'Cancel'}),
            Button({action: 'open-insert', color: 'primary', text: 'Insert'}),
        ].join(''),
        body: tableContent
    })
    //#endregion

    //#region Module actions
    const moduleActions = `<div data-module-actions>
        <div data-delete-icon>    
            <svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"/></svg>
        </div>
        <div data-settings-icon>    
            <svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
        </div>
        <div data-data-icon ${contents.length > 0 ? ` data-content-id="${value.id}"` : ''}>
            <svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h8.925l-2 2H5v14h14v-6.95l2-2V19q0 .825-.587 1.413T19 21zm4-6v-4.25l9.175-9.175q.3-.3.675-.45t.75-.15q.4 0 .763.15t.662.45L22.425 3q.275.3.425.663T23 4.4t-.137.738t-.438.662L13.25 15zM21.025 4.4l-1.4-1.4zM11 13h1.4l5.8-5.8l-.7-.7l-.725-.7L11 11.575zm6.5-6.5l-.725-.7zl.7.7z"/></svg>
        </div>
        <div data-drag-icon>    
            <svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m12 22l-4.25-4.25l1.425-1.425L11 18.15V13H5.875L7.7 14.8l-1.45 1.45L2 12l4.225-4.225L7.65 9.2L5.85 11H11V5.85L9.175 7.675L7.75 6.25L12 2l4.25 4.25l-1.425 1.425L13 5.85V11h5.125L16.3 9.2l1.45-1.45L22 12l-4.25 4.25l-1.425-1.425L18.15 13H13v5.125l1.8-1.825l1.45 1.45z"/></svg>
        </div>
    </div>
    `
    //#endregion
    
    if(context.mode === 'preview') {
        if(multiple) {
            previewContent = `${moduleDelete}<div data-data>${moduleSettings}${contentTypeTable}${contentTypeAdd}${contentTypeEdit}${contentTypeDelete}</div>` + moduleActions
        } else {
            previewContent = `${moduleDelete}<div data-data>${moduleSettings}${contentTypeEditSingle}</div>` + moduleActions
        }
    }

    return `<div${multiple ? ' data-multiple="true"' : ''} data-module-id="${module.id}"><div data-module-content>${rendered}</div>${previewContent}</div>`
}

async function loadModuleDefinitions() {
    const defs = await db('definitions').query().all()
    
    for(let definition of defs) {
        if(definition.path) {
            try {
                definitions[definition.id] = await import(definition.path).then(res => res.default)
            } catch(err) {
                definitions[definition.id] = {}
            }
        } else {
            definitions[definition.id] = {}
        }
        definitions[definition.id].id = definition.id
        definitions[definition.id] = {...definitions[definition.id], ...definition }
    
        definitions[definition.id].template = hbs.compile(definitions[definition.id].template)
    }   
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
function updateDefinitionTemplate() {
    return Page({
        id: 'update-definition',
        actions: [
            Button({text: 'Cancel', action: "close-update-definition"})
        ].join(''),
        title: `Update Module`,
        body: Form({
            handler: 'updateDefinition',
            fields: `
                <input type="hidden" name="id" value="" />
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
            cancelAction: 'close-update-definition'
        })
    })
}
//#endregion

//#region Render body
async function renderBody(body) {
    await loadModuleDefinitions()

    if(context.mode === 'edit') 
        return `
    <div>
        <div data-toolbar>
            Toolbar
        </div>
        <div data-sidebar>
            <div data-sidebar-primary>
                <div data-sidebar-item-small>
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                </div>
                <div data-sidebar-item-small>
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M7 2h9.5L21 6.5V19"/><path d="M3 20.5v-14A1.5 1.5 0 0 1 4.5 5h9.752a.6.6 0 0 1 .424.176l3.148 3.148A.6.6 0 0 1 18 8.75V20.5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 3 20.5"/><path d="M14 5v3.4a.6.6 0 0 0 .6.6H18"/></g></svg>
                </div>
                <div data-sidebar-item-small>
                    <svg  data-sidebar-item-icon data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
                </div>
            </div>
            <div data-sidebar-secondary>            
                <div data-sidebar-title>Modules</div>
                <div data-definitions>
                    ${Object.keys(definitions).map(key => definitions[key]).map(x => `<div data-definition-id="${x.id}"><span>${x.name}</span><span data-definition-settings>
                    <svg data-definition-icon data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
                        
                        </span></div>`).join('')}
                    <button data-create-module>Create Module</button>
                </div>
            </div>
        </div>
        <iframe class="iframe" src="${context.url.replace('mode=edit', 'mode=preview')}"></iframe>
        ${createDefinitionTemplate()}
        ${updateDefinitionTemplate()}
    </div>
    <script src="https://unpkg.com/sortablejs@1.15.2/Sortable.min.js"></script>
    <script src="/sitebuilder.edit.js"></script>
    `

    return `<div data-body>${(await Promise.all(body.map(x => renderModule(x)))).join('')}</div>`
}
//#endregion

// #region file upload
app.post('/api/file/upload', async (req, res) => {
    var mult = multer({})
    var middl = mult.any()
    
    await new Promise(resolve => {
        middl(req, res, () => {
            resolve()
        })
    })

    if(!existsSync('./uploads')) {
        await mkdir('./uploads')
    }

    const result = await db('files').insert({
        // id,
        name: req.body.name
    })
    
    await writeFile('./uploads/' + result.id, req.files[0].buffer)

    res.json({
        id: result.id
    })
})
//#endregion

//#region Api Query
app.post('/api/query', async (req, res) => {
    const {handler, body, pageId} = req.body
    
    context = {
        handler
    }

    console.log(context, body)
    const resp = await handlers[handler](body, context)
    
    res.json(resp ?? {reload: true})
})
//#endregion


app.post('/api/publish', async(req, res) => {
    // Publish html of site (or page) as SSG (without tailwind cdn)
})

app.post('/api/export', async(req, res) => {
    // export site as json
})

app.post('/api/import', async(req, res) => {
    // import site from json
})

//#region Pages
app.get('/*', async (req, res) => {
    const page = await getPage(req.params[0])

    context = {
        params: req.params,
        url: req.url,
        mode: req.query.mode ?? 'view'
    }

    if(!page) return res.end('404')

    let {head, title} = page;
    let modules = await db('modules').query().filter('pageId', '=', page.id).all().then(res => res.sort((a, b) => a.order > b.order ? 1 : -1))

    if(context.mode === 'edit') {
        head = (head ?? '') + '<link rel="stylesheet" href="/sitebuilder.edit.css">'
    } else if(context.mode === 'preview') {
        head = (head ?? '') + '<link rel="stylesheet" href="/sitebuilder.preview.css">'
    }

    const html = renderTemplate(layouts['default'], {
        head, 
        body: await renderBody(modules), 
        title
    })

    res.send(html)
})
//#endregion

const {PORT = 3000} = process.env
app.listen(PORT, () => console.log('app started on http://localhost:' + PORT))