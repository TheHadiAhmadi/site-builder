import express from 'express'
import multer from 'multer'
import { db } from '#services'
import handlers from './src/handlers.js'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import {mkdir, readdir, writeFile} from 'node:fs/promises'
import { renderPage } from './src/page.js'
import cookieParser from 'cookie-parser'
import { LoginPage } from './src/pages/login.js'
import layouts from './src/layouts.js'
import { File, Form, Input, Select } from './src/components.js'
import { setupCms} from './services/setup.js'
import hbs from 'handlebars'
import JSZip from 'jszip'

const compile = hbs.compile

// if(existsSync('./data4.json'))
//     rmSync('./data4.json')

async function SetupPage() {
    const templates = await readdir('./templates');
    return layouts.default({
        head: '<link rel="stylesheet" href="/css/components.css">',
        title: 'Setup CMS',
        body: `<div style="display: flex; height: 100vh; align-items: center; justify-content: center;">
            ${Form({
                handler: 'setup.setup',
                fields: [
                    Input({ 
                        name: 'password', 
                        placeholder: 'Enter Admin Password', 
                        label: 'Admin Password'
                    }),
                    Select({
                        items: templates, 
                        name: 'template', 
                        placeholder: 'Choose a template', 
                        label: 'Template'
                    }),
                    File({
                        name: 'file', 
                        label: 'Import zip'
                    }),
                ]
            })}
        </div>` + '<script type="module" src="/js/setup.js"></script>'
    })
}

let context = {}

const app = express()
app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded())
app.use(express.static('./public'))

app.use('/', async (req, res, next) => {
    if(req.method === 'POST') return next()

    const definitions = await db('definitions').query().all()

    if(definitions.length) {
        next()
    } else {
        res.end(await SetupPage())
    }
})

app.post('/api/setup', setupCms)

app.use('/files', express.static('./uploads'))

app.get('/admin', (req, res) => {
    const userToken = req.cookies['UserToken']
    console.log(userToken)

    res.json('Admin Panel')
})

app.get('/login', (req, res) => {

    res.send(LoginPage())
})

app.get('/robots.txt', async (req, res) => {
    res.end(`
User-agent: *

Sitemap: https://${req.hostname}/sitemap.xml
`)
})

app.get('/sitemap.xml', async(req, res) => {
    let result = `
        <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="https://www.w3.org/1999/xhtml" xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0" xmlns:news="https://www.google.com/schemas/sitemap-news/0.9" xmlns:image="https://www.google.com/schemas/sitemap-image/1.1" xmlns:video="https://www.google.com/schemas/sitemap-video/1.1">
    `

    let pages = await db('pages').query().all()

    const host = 'https' + '://' + req.hostname
    for(let page of pages) {
        if(page.dynamic && page.collectionId) {
            const contents = await db('contents').query().filter('_type', '=', page.collectionId).all()
            for(let content of contents) {
                const slug = compile(page.slug)(content)

                result += `
                    <url>
                        <loc>${host}${slug}</loc>
                        <changefreq>weekly</changefreq>
                        <priority>0.5</priority>
                    </url>
                `
            }
            
        } else {
            result += `
                <url>
                    <loc>${host}${page.slug}</loc>
                    <changefreq>weekly</changefreq>
                    <priority>0.5</priority>
                </url>
            `
        }
    }

    result += '</urlset>'

    res.writeHead(200, 'Ok', {
        'Content-Type': 'application/xml'
    })
    return res.end(result)
})

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

    const [controller, action] = handler.split('.')
    if(handlers[controller]?.[action]) {
        const resp = await handlers[controller][action](body, context)
        res.json(resp ?? {reload: true})
    }
    
})
//#endregion

app.post('/api/publish', async(req, res) => {
    // Publish html of site (or page) as SSG (without tailwind cdn)
})

app.post('/api/export', async(req, res) => {
    const files = {}    

    const pages = await db('pages').query().all()

    async function getModule(module) {
        const definition  = await db('definitions').query().filter('id', '=', module.definitionId).first()

        if(definition.name === 'Section') {
            const columns = await db('modules').query().filter('moduleId', '=', module.id).first()

            module.props['content'] = await getModules({moduleId: columns.id})

        } else {
            for(let prop of definition.props ?? []) {
                if(prop.type == 'file') {
                    files[module.props[prop.slug]] = true
                }
                if(prop.type == 'slot') {
                    const res = await getModules({moduleId: module.id})
                    module.props[prop.slug] = res
                    // files[module.props[props.slug]] = true
                }
            }
        }

        module.definition = definition.name
        delete module.definitionId

        delete module.id
        delete module.pageId
        delete module.moduleId
        delete module.createdAt
        delete module.updatedAt    

        return module
    }

    async function getModules({pageId, moduleId}) {
        if(pageId) {
            const modules = await db('modules').query().filter('pageId', '=', pageId).all()
            return await Promise.all(modules.map(x => getModule(x)))
        }
        if(moduleId) {
            const modules = await db('modules').query().filter('moduleId', '=', moduleId).all()
            return await Promise.all(modules.map(x => getModule(x)))
        }
    }

    for(let page of pages) {
        const modules = await getModules({pageId: page.id})

        page.modules = modules

        if(page.dynamic) {
            const collection = await db('collections').query().filter('id', '=', page.collectionId).first()

            page.collection = collection.name
            delete page.collectionId
        }

        delete page.id
        delete page.createdAt
        delete page.updatedAt
    }

    const definitions = await db('definitions').query().all()
    for(let definition of definitions) {

        for(let prop of definition.props) {
            if(prop.type === 'relation') {
                const collection = await db('collections').query().filter('id', '=', prop.collectionId).first()
                prop.collection = collection?.name ?? 'TODO'
                delete prop.collectionId
            }
        }
        delete definition.id
        delete definition.createdAt
        delete definition.updatedAt
    }

    const collections = await db('collections').query().all()
    for(let collection of collections) {

        for(let field of collection.fields) {
            if(field.type === 'relation') {
                field.collection = collections.find(x => x.id === field.collectionId)?.name
                delete field.collectionId
            }
        }
        
        const contents = await db('contents').query().filter('_type', '=', collection.id).all()

        for(let content of contents) {
            for(let field of collection.fields) {
                if(field.type === 'file') {
                    if(field.multiple) {
                        for(let file of files[content[field.slug]] ?? []) {
                            files[file] = true
                        }
                    } else {
                        files[content[field.slug]] = true
                    }
                }
            }
            delete content._type
            delete content.createdAt
            delete content.updatedAt
        }
        collection.contents = contents
    
        delete collection.createdAt
        delete collection.updatedAt
    }

    for(let collection of collections) {
        delete collection.id
    }
    const jszip = new JSZip()

    for(let file of Object.keys(files)) {
        if(file !== 'undefined') {
            jszip.file('site/files/' + file, readFileSync('./uploads/' + file))
        }
    }
    
    jszip.file('site/pages.json', JSON.stringify(pages, null, 4))
    jszip.file('site/definitions.json', JSON.stringify(definitions, null, 4))
    jszip.file('site/collections.json', JSON.stringify(collections, null, 4))

    const content = await jszip.generateAsync({type: 'nodebuffer'})

    res.setHeader('Content-Disposition', 'attachment; filename=backup.zip');
    res.setHeader('Content-Type', 'application/zip');

    res.send(content)
})

app.post('/api/import', async(req, res) => {
   
    

    // await writeFile('./temp/file.zip', req.files[0].buffer)
    


    res.end('{}')

})

//#region Pages
app.get('/*', renderPage)
//#endregion

const {PORT = 3000} = process.env
app.listen(PORT, () => console.log('app started on http://localhost:' + PORT))