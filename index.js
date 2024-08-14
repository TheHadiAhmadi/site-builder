import express from 'express'
import multer from 'multer'
import { db } from '#services'
import handlers from './src/handlers.js'
import {cpSync, existsSync, rm, rmSync} from 'node:fs'
import {mkdir, readdir, writeFile} from 'node:fs/promises'
import { renderPage } from './src/page.js'
import cookieParser from 'cookie-parser'
import { LoginPage } from './src/pages/login.js'
import layouts from './src/layouts.js'
import { Form, Input, Select } from './src/components.js'
import {setupCms} from './services/setup.js'
import hbs from 'handlebars'
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
Disallow: /css/
Disallow: /js/
Disallow: /files/

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
    // export site as json
})

app.post('/api/import', async(req, res) => {
    // import site from json
})

//#region Pages
app.get('/*', renderPage)
//#endregion

const {PORT = 3000} = process.env
app.listen(PORT, () => console.log('app started on http://localhost:' + PORT))