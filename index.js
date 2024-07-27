import express from 'express'
import data from './data.json'  assert { type: 'json' };

let context = {}
const app = express()

app.use(express.json())

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

function getPage(slug) {
    if(!slug.startsWith('/')) {
        slug = '/' + slug
    }

    // const page_404 = {head: '<script src="https://cdn.tailwindcss.com"></script>', title: '404', body: [
    //     { id: 1},
    //     { id: 2}
    // ]}

    const page = data.pages.find(x => x.slug == slug)

    if(!page) return;
    const modules = data.modules.filter(x => x.pageId == page.id).sort((a, b) => a.order > b.order ? 1 : -1)
    page.body = modules

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

async function renderModule(module, mode) {
    const contents = await getModuleContents(module.id)
    const definition = await getModuleTemplate(module.definitionId)

    const rendered = contents.map(content => {
        const rendered = renderTemplate(definition.template, content)

        return `<div data-content-id="${content.id}">${rendered}</div>`
    }).join('')

    let previewContent = ''


    if(mode === 'preview') {
        previewContent = `<div>INPUTS: ${data.contentTypes.find(x => x.id == definition.contentType).fields.map(x => x.name).join(', ')}</div><div data-module-actions><div data-drag-icon>DRAG</div><div data-add-icon>ADD</div> </div>`
    }

    return `<div data-module-id="${module.id}">${rendered}${previewContent}</div>`
}

async function renderBody(body, mode = 'view') {
    if(mode === 'edit') 
        return `<div><div data-toolbar>Toolbar</div><div data-sidebar><div data-definitions>${data.definitions.map(x => `<div data-definition-id="${x.id}">${x.name}</div>`).join('')}</div></div><iframe class="iframe" src="${context.url.replace('mode=edit', 'mode=preview')}"></iframe></div><script src="https://unpkg.com/sortablejs@1.15.2/Sortable.min.js"></script><script src="/sitebuilder.edit.js"></script>`

    return `<div data-body>${(await Promise.all(body.map(x => renderModule(x, mode)))).join('')}</div>`
}

const handlers = {
    'createModule'(body) {
        const page = data.pages.find(x => x.slug === body.slug)
        data.modules.push({
            pageId: page.id,
            definitionId: body.definitionId,
            order: body.index + 1,
            id: `${data.modules.length + 1}`
        })
        // return 
    },
    createContent(body) {
        const moduleId = body.moduleId
        const content = body.content

        data.contents.push({
            id: `${(data.contents.length + 1)}`,
            moduleId,
            ...content
        })
    },
    updateModules(body) {
        for(let mod of body.modules) {
            data.modules.find(x => x.id === mod.id).order = mod.order
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
    const {handler, body} = req.body

    await handlers[handler](body)
    
    console.log(data)
    res.end('{}')
})

app.get('/sitebuilder.preview.js', (req, res) => {
    res.setHeader('content-type', 'application/javascript');
    res.send(`console.log("Hello")`)
})

app.get('/sitebuilder.preview.css', (req, res) => {
    // res.send(`console.log("Hello")`)
    res.setHeader('content-type', 'text/css');
    res.send(`
    :root {
        --x-primary: #4070f0;
        --x-primary-hover: #5080f5;
    }    
    [data-module-id] {
        border: 1px solid var(--x-primary);
        position: relative;
        min-height: 100px;
    }
    [data-module-id]:hover {
        border: 1px solid var(--x-primary-hover);
    }
    [data-module-actions] {
        display: flex;
        gap: 4px;
        position: absolute; top: 0; right: 0;
        background-color: #4070f0;
    }    
    `)
})

app.get('/sitebuilder.edit.css', (req, res) => {
    res.setHeader('content-type', 'text/css');
    res.send(`
    body, html {
        height: 100vh;    
    }
    
    iframe {
        width: calc(100% - 200px);
        right: 200px;
        position: absolute;
        top: 40px;
        height: calc(100vh - 40px);
    }

    [data-toolbar] {
        position: fixed;
        top: 0;
        right: 200px;
        left: 0px;
        color: white;
        height: 40px;
        background-color: #202020;
    }
    [data-sidebar] {
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        width: 200px;
        background-color: #202020;
        color: white;
    }    
    
    [data-definitions] {
        display: flex;
        gap: 4px;
        flex-direction: column;
    }

    [data-definition-id] {
        padding: 4px;
        border: 1px solid #404040;
    }
    
    `)
})

app.get('/sitebuilder.edit.js', (req, res) => {
    res.setHeader('content-type', 'application/javascript');
    res.send(`
        const iframeElement = document.querySelector('iframe')

        async function reloadIframe() {
            const res = await fetch(window.location.href.replace('mode=edit', 'mode=preview')).then(res => res.text())
            iframeElement.contentDocument.documentElement.innerHTML = res

            setTimeout(() => {
                initIframe()
            })
        }

        async function request(handler, body, reload = true) {
            await fetch('/api/update', {
                method: 'POST', 
                body: JSON.stringify({handler, body}), 
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(async res => {
                await reloadIframe()
            })
        }

        function updateModules() {
                const body = { slug: window.location.pathname, modules: [] }
                let index = 1;
                for(let mod of iframeElement.contentDocument.querySelectorAll('[data-module-id]')) {
                    body.modules.push({id: mod.dataset.moduleId, order: index++})
                }
                request('updateModules', body)
            }
        function init() {
            
        
            const definitionsElement = document.querySelector('[data-definitions]')
            Sortable.get(definitionsElement)?.destroy()

            
            new Sortable(definitionsElement, {
                group: {
                    name: 'nested',
                    pull: 'clone',
                    put: false,
                },
                sort: false,
                draggable: '[data-definition-id]',
                animation: 150,
                async onEnd(event) {
                    await request('createModule', { slug: window.location.pathname, definitionId: event.item.dataset.definitionId, index: event.newIndex})
                    await updateModules()
                }
            })

            iframeElement.onload = () => {
                initIframe()
            }    
        }
        
        function initIframe() {
                const bodyElement = iframeElement.contentDocument.querySelector('[data-body]')
                
                Sortable.get(bodyElement)?.destroy()
                new Sortable(bodyElement, {
                    group: 'nested',
                    animation: 150,
                    draggable: '[data-module-id]',
                    handle: '[data-drag-icon]',
                    onEnd(event) {
                        updateModules()
                    }
                })

                const modules = iframeElement.contentDocument.querySelectorAll('[data-module-id]');
                modules.forEach(mod => {
                    mod.querySelector('[data-add-icon]').addEventListener('click', async () => {
                        console.log('add content clicked', mod)
                        // const i
                        const moduleId = mod.dataset.moduleId 
                        // const value = prompt('enter value:')
                        alert('show edit form of this module with it\\'s contentType inputs')
                        const content = {}
                        await request('createContent', {moduleId ,content})
                    })
                })
            }

        init()
        
    `)
})

app.get('/*', async (req, res) => {
    const page = await getPage(req.params[0])

    context = {
        params: req.params,
        url: req.url,
    }

    if(!page) return res.end('404')

    let {head, body, title} = page;
    const mode = req.query.mode ?? 'view'

    if(mode === 'edit') {
        head = (head ?? '') + '<link rel="stylesheet" href="/sitebuilder.edit.css">'
    } else if(mode === 'preview') {
        head = (head ?? '') + '<link rel="stylesheet" href="/sitebuilder.preview.css">'
    }

    const html = template({
        head, 
        body: await renderBody(body, mode), 
        title
    })

    res.send(html)
})

const {PORT = 3000} = process.env
app.listen(PORT, () => console.log('app started on http://localhost:' + PORT))