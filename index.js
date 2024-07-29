import hbs from 'handlebars'
import express from 'express'
import { db } from '#services'
import handlers from './handlers.js'
// import { news } from '#modules'

let context = {}

const definitions = {}

const app = express()

app.use(express.json())
app.use(express.static('./public'))

const template = ({head, title, body}) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${head}
    <title>${title}</title>
</head>
<body>
    ${body}
</body>
</html>`

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

    const props = await definition.load({moduleId: module.id, contents})


    console.log('all', module.id,  await db('moduleSettings').query().filter('moduleId', '=', module.id).all())
    props.settings = {}
    const settings = await db('moduleSettings').query().filter('moduleId', '=', module.id).first() ?? {};

    for(let item of definition.settings?.fields ?? []) {
        console.log({settings})
        
        props.settings[item.slug] = settings.value?.[item.slug] ?? item.defaultValue
    }

    console.log(props)

    const rendered = renderTemplate(definition.template, props);
    let previewContent = ''

    const fields = definition.contentType.fields
    const multiple = definition.multiple !== false;

    const contentTypeAdd = `
    <div data-mode-add>
    <div data-content-header>
        <h2 data-content-title>Insert Content</h2>
            <button data-header-button-back data-header-button>Back</button>
        </div>

    <form data-form>
        <input type="hidden" name="_handler" value="createContent"/>

        ${fields.map(x => `<label data-label><span data-label-text>${x.name}</span><input data-input name="${x.slug ?? x.name}" placeholder="Enter ${x.name}"/></label>`).join('')}
        <div data-form-actions>
            <button type="button" data-form-button data-target="list" data-form-button-cancel>Cancel</button>
            <button type="submit" data-form-button data-form-button-submit>Submit</button>
        </div>
    </form>
    </div>

    `

    const contentTypeEdit = `
    <div data-mode-edit>
        <div data-content-header>
            <h2 data-content-title>Update Content</h2>
            <button data-header-button-back data-header-button>Back</button>
        </div>

        <form data-form>
            <input type="hidden" name="_handler" value="updateContent"/>
            <input data-input type="hidden" name="id" value=""/>
            ${fields.map(x => `<label data-label><span data-label-text>${x.name}</span><input data-input name="${x.slug ?? x.name}" placeholder="Enter ${x.name}"/></label>`).join('')}
            <div data-form-actions>
                <button type="button" data-form-button data-target="list" data-form-button-cancel>Cancel</button>
                <button type="submit" data-form-button data-form-button-submit>Submit</button>
            </div>
        </form>
    </div>

    `
    const contentTypeEditSingle = `
    <div data-mode-edit-single>
        <div data-content-header>
            <h2 data-content-title>Update Content</h2>
            <button data-header-button-cancel data-target="" data-header-button>Cancel</button>
        </div>

        <form data-form>
            <input type="hidden" name="_handler" value="updateContent"/>
            <input data-input type="hidden" name="id" value=""/>
            ${fields.map(x => `<label data-label><span data-label-text>${x.name}</span><input data-input name="${x.slug ?? x.name}" placeholder="Enter ${x.name}"/></label>`).join('')}
            <div data-form-actions>
                <button type="button" data-form-button data-target="" data-form-button-cancel>Cancel</button>
                <button type="submit" data-form-button data-form-button-submit>Submit</button>
            </div>
        </form>
    </div>

    `

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

    const moduleSettings = `<div data-mode-settings>
        <div data-content-header>
            <h2 data-content-title>
                Module Settings
            </h2>
            <div data-header-actions>
                <button data-header-button-cancel data-target="" data-header-button>Cancel</button>
                <button data-header-button-save data-header-button>Save</button>
            </div>
        </div>    

        <form data-form>
            <input type="hidden" name="_handler" value="saveModuleSettings"/>
            ${(definition.settings?.fields??[]).map(x => `<label data-label><span data-label-text>${x.name}</span><input data-input name="${x.slug ?? x.name}" placeholder="Enter ${x.name}"/></label>`).join('')}
            <div data-form-actions>
                <button type="button" data-form-button data-target="" data-form-button-cancel>Cancel</button>
                <button type="submit" data-form-button data-form-button-submit>Submit</button>
            </div>
        </form>
    
    </div>`

    const contentTypeTable = `
    <div data-mode-list>
        <div data-content-header>
            <h2 data-content-title>
                Module Contents
            </h2>
            <div data-header-actions>
                <button data-header-button-cancel data-target="" data-header-button>Cancel</button>
                <button data-header-button-insert data-header-button>Insert</button>
            </div>
            </div>
            ${contents.length > 0 ? (`
                <table data-table>
                <thead>
                    <tr>
                        ${fields.map(x=> `<th>${x.name}</th>`).join('')}
                        <th style="width: 0;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${contents.map(content => `<tr>${fields.map(x => `<td>${content[x.slug]}</td>`).join('')}<td>
                        <div data-table-actions>
                            <button data-content-id="${content.id}" data-table-action data-table-action-edit>
                                Edit
                            </button>
                            <button data-content-id="${content.id}" data-table-action data-table-action-delete>
                                Delete
                            </button>
                        </div>
                        </td></tr>`).join('')}
                </tbody>
            </table>
            `) : '<div data-empty-table><div data-empty-table-title>No Items!</div><div data-empty-table-description>There is no content for this plugin yet!</div></div>'}
    </div>
    `
    const moduleActions = `<div data-module-actions>
        <div data-delete-icon>    
            <svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"/></svg>
        </div>
        <div data-settings-icon>    
            <svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
        </div>
        <div data-data-icon ${contents.length > 0 ? ` data-content-id="${contents[0].id}"` : ''}>
            <svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h8.925l-2 2H5v14h14v-6.95l2-2V19q0 .825-.587 1.413T19 21zm4-6v-4.25l9.175-9.175q.3-.3.675-.45t.75-.15q.4 0 .763.15t.662.45L22.425 3q.275.3.425.663T23 4.4t-.137.738t-.438.662L13.25 15zM21.025 4.4l-1.4-1.4zM11 13h1.4l5.8-5.8l-.7-.7l-.725-.7L11 11.575zm6.5-6.5l-.725-.7zl.7.7z"/></svg>
        </div>
        <div data-drag-icon>    
            <svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m12 22l-4.25-4.25l1.425-1.425L11 18.15V13H5.875L7.7 14.8l-1.45 1.45L2 12l4.225-4.225L7.65 9.2L5.85 11H11V5.85L9.175 7.675L7.75 6.25L12 2l4.25 4.25l-1.425 1.425L13 5.85V11h5.125L16.3 9.2l1.45-1.45L22 12l-4.25 4.25l-1.425-1.425L18.15 13H13v5.125l1.8-1.825l1.45 1.45z"/></svg>
        </div>
    </div>
    `
    
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
        if(definitions[definition.id]) return;

        definitions[definition.id] = await import(definition.path).then(res => res.default)

        definitions[definition.id].id = definition.id
        definitions[definition.id].template = hbs.compile(definitions[definition.id].template)
    }   
}

async function renderBody(body) {
    await loadModuleDefinitions()

    if(context.mode === 'edit') 
        return `
    <div>
        <div data-toolbar>
            Toolbar
        </div>
        <div data-sidebar>
            <div data-definitions>
                ${Object.keys(definitions).map(key => definitions[key]).map(x => `<div data-definition-id="${x.id}">${x.name}</div>`).join('')}
            </div>
        </div>
        <iframe class="iframe" src="${context.url.replace('mode=edit', 'mode=preview')}"></iframe>
    </div>
    <script src="https://unpkg.com/sortablejs@1.15.2/Sortable.min.js"></script>
    <script src="/sitebuilder.edit.js"></script>
    `

    return `<div data-body>${(await Promise.all(body.map(x => renderModule(x)))).join('')}</div>`
}

app.post('/api/publish', async(req, res) => {
    // Publish html of site (or page) as SSG (without tailwind cdn)
})

app.post('/api/export', async(req, res) => {
    // export site as json
})

app.post('/api/import', async(req, res) => {
    // import site from json
})

app.post('/api/file/upload', async (req, res) => {
    // upload file
})

app.post('/api/file/:id', async (req, res) => {
    // download file
})

app.post('/api/query', async (req, res) => {
    const {handler, body, pageId} = req.body
    
    context = {
        handler
    }

    const resp = await handlers[handler](body, context)
    
    res.json(resp ?? {reload: true})
})

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

    const html = template({
        head, 
        body: await renderBody(modules), 
        title
    })

    res.send(html)
})

const {PORT = 3000} = process.env
app.listen(PORT, () => console.log('app started on http://localhost:' + PORT))