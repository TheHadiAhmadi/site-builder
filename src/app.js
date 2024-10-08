import express from 'express'
import { renderPageController } from './controllers/page.js'
import cookieParser from 'cookie-parser'
import { LoginPage } from './pages/login.js'
import { setupCms} from '../services/setup.js'
import hbs from 'handlebars'
import path from 'node:path'
import { fakeValue} from './helpers.js'
import { fileURLToPath } from 'url';
import { exportSiteController } from './controllers/export.js'
import { loginController, logoutController } from './controllers/login.js'
import { queryController } from './controllers/query.js'
import { fileUploadController } from './controllers/file.js'
import { publishController } from './controllers/publish.js'
import { contextMiddleware } from './middlewares/context.js'
import { setDb } from '../services/db.js'
import layouts from './layouts.js';

// Get the directory of the current file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp({functions, db}) {
    setDb(db)
    
    const app = express()
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    app.use(express.static(path.join(__dirname, '../public')))
    app.use(express.static('./public'))

    app.use('/', contextMiddleware({functions}))
    
    // File upload
    app.use('/files', express.static('./uploads'))
    app.get('/files/:name', (req, res) => {
        console.log('files name: ', req.params.name)
        if(req.params.name === 'placeholder') {
            return res.sendFile(path.resolve(__dirname, '../public', 'images', 'placeholder.jpg'))
        }
        res.sendFile(path.resolve('./uploads/' + req.params.name.split('.')[0]))
    })

    app.get('/login', (req, res) => {
        res.send(LoginPage({url: req.hostname}))
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
                    const slug = hbs.compile(page.slug)(content)

                    result += `
                        <url>
                            <loc>${host}${slug}</loc>
                            <changefreq>daily</changefreq>
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

    //#region Functions
    for (let key in functions) {
        if(functions[key].action) {

            app.post('/api/fn/' + key, async (req, res) => {
                // call function with req.context, req.body, ...
                console.log(req.body)
                
                const resp = await functions[key].action(req.body, req.context)
                
                return res.json(resp)
            })
        }
    }

    //#endregion
    app.post('/api/query', queryController)
    app.post('/api/file/upload', fileUploadController)
    app.post('/api/setup', setupCms)
    app.post('/api/login', loginController)
    app.post('/api/logout', logoutController)
    app.post('/api/publish', publishController)
    app.post('/api/export', exportSiteController)
    
    app.get('/preview/:id', async (req, res) => {
        const block = await db('blocks').query().filter('id', '=', req.params.id).first()

        const props = {}
        for(let prop of block.props ?? []) {
            props[prop.slug] = await fakeValue(prop)
        }

        const settings = await db('settings').query().first() ?? {}
        console.log(props)
        const rendered = hbs.compile(block.template)(props)
        return res.end(layouts.default({
            head: settings.head,
            mode: 'view',
            tailwind: JSON.stringify({darkMode: 'class'}),
            dir: 'ltr',
            theme: 'light',
            body: rendered
        }))
    })
    
    app.get('/*', renderPageController)
    
    app.start = (port) => {
        app.listen(port, () => console.log("App started on http://localhost:" + port))
    }

    return app
}