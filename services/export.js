import { db } from "./db.js"
import {readFile} from 'fs/promises'

const files = {}    
const functionFiles = []

async function exportModule(module) {
    const definition  = await db('definitions').query().filter('id', '=', module.definitionId).first()

    if(definition.name === 'Section') {
        const columns = await db('modules').query().filter('moduleId', '=', module.id).first()

        module.props['content'] = await exportModules({moduleId: columns.id})

    } else {
        for(let prop of definition.props ?? []) {
            if(prop.type == 'file') {
                if(prop.multiple) {
                    for(let item of module.props[prop.slug] ?? []) {
                        files[item] = true
                    }
                } else {
                    files[module.props[prop.slug]] = true
                }
            }
            if(prop.type == 'slot') {
                const res = await exportModules({moduleId: module.id})
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

async function exportModules({pageId, moduleId}) {
    if(pageId) {
        const modules = await db('modules').query().filter('pageId', '=', pageId).all()
        return await Promise.all(modules.map(x => exportModule(x)))
    }
    if(moduleId) {
        const modules = await db('modules').query().filter('moduleId', '=', moduleId).all()
        return await Promise.all(modules.map(x => exportModule(x)))
    }
}

async function exportPages() {
    const pages = await db('pages').query().all()

    for(let page of pages) {
        const modules = await exportModules({pageId: page.id})

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
    return pages
}
async function exportSettings() {
    const settings = await db('settings').query().first() ?? {}

    delete settings.createdAt
    delete settings.updatedAt
    delete settings.id
    
    return settings
}

async function exportFunctions() {
    // TODO: export function files..

    // for(let fn of functions) {
    //     if(fn.file) {
    //         functionFiles.push(fn.file)
    //     }    
    // }
}

async function exportFunctionFiles() {
    let result = {}
    for(let file of functionFiles) {
        // TODO: Cleanup
        // file = file.replace('../template', './template')
        result['functions/' + basename(file)] = await readFile(file, 'utf-8')
    }
    return result
}

async function exportBlocks() {
    let blocks = await db('definitions').query().all()
    blocks = blocks.filter(x => x.name !== 'Rich Text' && x.name !== 'Columns' && x.name !== 'Section')
    
    for(let block of blocks) {

        for(let prop of block.props ?? []) {
            if(prop.type === 'relation') {
                const collection = await db('collections').query().filter('id', '=', prop.collectionId).first()
                prop.collection = collection?.name ?? 'TODO'
                delete prop.collectionId
            }
        }
        delete block.id
        delete block.createdAt
        delete block.updatedAt
    }

    return blocks
}

async function exportCollections() {

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
                        for(let file of content[field.slug] ?? []) {
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

    return collections
} 

async function exportUsers() {
    const users = await db('users').query().all()

    for(let user of users) {
        delete user.password
        delete user.createdAt
        delete user.updatedAt
        delete user.id
    }
    return users;
}

async function exportRoles() {
    const roles = await db('roles').query().all()

    for(let role of roles) {
        delete role.createdAt
        delete role.updatedAt
        delete role.id
    }
    return roles;
}

async function exportFiles() {
    let result = {}
    for(let file of Object.keys(files)) {
        if(file !== 'undefined') {
            result['files/' + file] = await readFile('./uploads/' + file)
        }
    }
    return result;
}

export async function getExportFiles() {
    let result = {}
      
    result['settings.json'] = JSON.stringify(await exportSettings(), null, 4)
    result['users.json'] = JSON.stringify(await exportUsers(), null, 4)
    result['pages.json'] = JSON.stringify(await exportPages(), null, 4)
    result['blocks.json'] = JSON.stringify(await exportBlocks(), null, 4)
    result['collections.json'] = JSON.stringify(await exportCollections(), null, 4)
    result['roles.json'] = JSON.stringify(await exportRoles(), null, 4)

    result = {...result, ...await exportFunctionFiles()}
    result = {...result, ...await exportFiles()}
    
    return result;
}
