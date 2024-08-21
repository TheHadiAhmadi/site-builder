import { createFileDb, createMongoDb } from 'svelite-html/db'

// const db = createFileDb({path: './rahnama-backup.json'})
const db = createFileDb({path: './data.json'})
// const db = createMongoDb({uri: 'mongodb://127.0.0.1:27017', db:'SiteBuilder'})

export default db;
