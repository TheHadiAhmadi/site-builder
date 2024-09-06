import express from 'express'
import { setDb } from '#services'
import { renderPageController } from './controllers/page.js'
import cookieParser from 'cookie-parser'
import { LoginPage } from './pages/login.js'
import { setupCms} from '../services/setup.js'
import hbs from 'handlebars'
import path from 'node:path'
import { fileURLToPath } from 'url';
import { exportSiteController } from './controllers/export.js'
import { loginController, logoutController } from './controllers/login.js'
import { queryController } from './controllers/query.js'
import { fileUploadController } from './controllers/file.js'
import { publishController } from './controllers/publish.js'
import { contextMiddleware } from './middlewares/context.js'

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

    app.use('/', contextMiddleware())
    
    // File upload
    app.use('/files', express.static('./uploads'))
    app.get('/files/:name', (req, res) => {
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
        // app.post('/api/ + key, (req, res) => {
            // call function with req.context, req.body, ...
        // })
    }

    // OR?
    // app.post('/fn/:slug', async(req, res) => {
    //     const method = req.params.slug
        
    //     const resp = await functions[method].run({
    //         body: req.body,
    //         query: req.query
    //     })
    //     res.json(resp ?? {reload: true})
    // })

    //#endregion
    app.post('/api/query', queryController)
    app.post('/api/file/upload', fileUploadController)
    app.post('/api/setup', setupCms)
    app.post('/api/login', loginController)
    app.post('/api/logout', logoutController)
    app.post('/api/publish', publishController)
    app.post('/api/export', exportSiteController)
    app.get('/*', renderPageController)
    
    app.start = (port) => {
        app.listen(port, () => console.log("App started on http://localhost:" + port))
    }

    return app
}