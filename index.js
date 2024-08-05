import express from 'express'
import multer from 'multer'
import { db } from '#services'
import handlers from './src/handlers.js'
import {existsSync} from 'node:fs'
import {mkdir, writeFile} from 'node:fs/promises'
import { renderPage } from './src/page.js'
import cookieParser from 'cookie-parser'
import { LoginPage } from './src/pages/login.js'

let context = {}

const app = express()
app.use(cookieParser())

app.use(express.json())
app.use(express.static('./public'))
app.use('/files', express.static('./uploads'))

app.get('/admin', (req, res) => {
    const userToken = req.cookies['UserToken']
    console.log(userToken)

    res.json('Admin Panel')
})

app.get('/login', (req, res) => {

    res.send(LoginPage())
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