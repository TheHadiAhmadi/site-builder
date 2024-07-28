import express from 'express'
import {createFileDb} from 'svelite-html/db'
import data from './data.json' assert { type: 'json' };

const db = createFileDb('./data.json')

let context = {}
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
    return data.contents.filter(x => x.moduleId == id)
}

async function getModuleTemplate(id) {
    return data.definitions.find(x => x.id == id)
}

function renderTemplate(template, data) {
    function getData(key) {
        return key.split('.').reduce((prev, curr) => prev[curr] ?? '', data)
    }
    return template.replace(/\{([^}]*)\}/g, (match, p1) => getData(p1));
}

async function renderModule(module) {
    const contents = await getModuleContents(module.id)
    const definition = await getModuleTemplate(module.definitionId)

    const rendered = contents.map(content => {
        const rendered = renderTemplate(definition.template, content)

        return `<div data-content-id="${content.id}">${rendered}</div>`
    }).join('')

    let previewContent = ''


    if(context.mode === 'preview') {
        console.log(definition, await db('contentTypes').query({}))
        previewContent = `<div>INPUTS: ${await db('contentTypes').query({}).then(res => res.data.find(x => x.id == definition.contentType).fields.map(x => x.name).join(', '))}</div><div data-module-actions><div data-drag-icon>DRAG</div><div data-add-icon>ADD</div> </div>`
    }

    return `<div data-module-id="${module.id}">${rendered}${previewContent}</div>`
}

async function renderBody(body) {
    if(context.mode === 'edit') 
        return `
    <div>
        <div data-toolbar>
            Toolbar
        </div>
        <div data-sidebar>
            <div data-definitions>
                ${await db('definitions').query({}).then(res => res.data.map(x => `<div data-definition-id="${x.id}">${x.name}</div>`).join(''))}
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
        console.log(body)
        const page = await db('pages').query(res => res.data.find(x => x.slug === body.slug))
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
    async updateModules(body) {
        for(let mod of body.modules) {
            const original = await db('modules').query().then(res => res.data.find(x => x.id === mod.id))
            original.order = mod.order
            await db('modules').update(original)
        }
    }
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
    let modules = await db('modules').query().then(res => res.data.filter(x => x.pageId == page.id))

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