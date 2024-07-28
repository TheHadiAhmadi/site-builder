import hbs from 'handlebars'
import express from 'express'
import { db } from '#services'
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

    const page = await db('pages').query().then(res => res.data.find(x => x.slug == slug))

    if(!page) return;

    return page // ?? page_404
}

async function getModuleContents(id) {
    return db('contents').query({}).then(res => res.data.filter(x => x.moduleId == id))
}

function renderTemplate(template, data) {
    return template(data)
}

async function renderModule(module) {
    const contents = await getModuleContents(module.id)
    const definition = definitions[module.definitionId]

    const props = await definition.load({moduleId: module.id, contents})
    const rendered = renderTemplate(definition.template, props);
    let previewContent = ''

    const fields = definition.contentType.fields

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
            <button type="button" data-form-button data-form-button-cancel>Cancel</button>
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
                <button type="button" data-form-button data-form-button-cancel>Cancel</button>
                <button type="submit" data-form-button data-form-button-submit>Submit</button>
            </div>
        </form>
    </div>

    `

    const contentTypeDelete = `
        <div data-delete-confirm>
            <div data-confirm-body>
                <h3 data-confirm-title>Remove Content</h3>
                <p data-confirm-description>Are you sure to remove this item?</p>

                <div data-confirm-actions>
                    <button data-confirm-button-no>No</button>
                    <button data-confirm-button-yes data-content-id="">Yes</button>
                </div>
            </div>
        </div>
    `

    const contentTypeTable = `
    <div data-mode-list>
        <div data-content-header>
            <h2 data-content-title>
                Module Contents
            </h2>
            <div data-header-actions>
                <button data-header-button-cancel data-header-button>Cancel</button>
                <button data-header-button-insert data-header-button>Insert</button>
            </div>
            </div>
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
    </div>
    `

    if(context.mode === 'preview') {
        previewContent = `<div data-data>${contentTypeTable}${contentTypeAdd}${contentTypeEdit}${contentTypeDelete}</div><div data-module-actions><div data-drag-icon>DRAG</div><div data-data-icon>Data</div> </div>`
    }

    return `<div data-module-id="${module.id}"><div data-module-content>${rendered}</div>${previewContent}</div>`
}

async function loadModuleDefinitions() {
    const defs = await db('definitions').query({}).then(res => res.data)
    
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

const handlers = {
    async createModule(body) {
        const page = await db('pages').query().then(res => res.data.find(x => x.slug === body.slug))

        await db('modules').insert({
            pageId: page.id,
            definitionId: body.definitionId,
            order: body.index + 1,
        })
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
    async deleteContent(body) {
        const moduleId = body.moduleId
        const id = body.id

        await db('contents').remove(id)
    },
    async updateModules(body) {
        for(let mod of body.modules) {
            const original = await db('modules').query().then(res => res.data.find(x => x.id === mod.id))
            console.log('before ', original, body)

            original.order = mod.order
            console.log('should update to ', original)
            await db('modules').update(original)
        }
    }
}

app.get('/api/content/:id', async (req, res) => {

    res.json(await db('contents').query().then(res => res.data.find(x => x.id === req.params.id)))
})
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

app.post('/api/update', async (req, res) => {
    const {handler, body, pageId} = req.body

    await handlers[handler](body)
    
    res.end('{}')
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
    let modules = await db('modules').query().then(res => res.data.filter(x => x.pageId == page.id).sort((a, b) => a.order > b.order ? 1 : -1))

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