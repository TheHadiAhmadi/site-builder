import { createFileDb, createMongoDb } from 'svelite-html/db'

const db = createFileDb({path: './data3.json'})
// const db = createMongoDb({uri: 'mongodb://127.0.0.1:27017', db:'SiteBuilder'})

export default db;
