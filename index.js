import { createFileDb } from "svelite-html/db"
import { createApp } from "./src/app.js"
import { readdirSync } from 'node:fs'


const functions = {}

for(let file of readdirSync('./functions')) {
    const module = await import('./functions/' + file)
    functions[module.default.slug] = module.default
}

const {PORT = 3000} = process.env

const db = createFileDb({path: './data.json'})

createApp({functions, db}).listen(PORT, () => console.log('app started on http://localhost:' + PORT))