import {cpSync} from 'node:fs'
import db from "./db.js"

const defaultModules = {
    Section: {
        template: `<div data-section {{#if fullWidth}} data-section-full-width {{/if}}>{{{content}}}</div>`,
        props: [
            {
                type: 'checkbox',
                slug: 'fullWidth',
                label: 'Full Width'
            },
            {
                type: 'slot',
                slug: 'content',
                label: 'Content'
            },
        ]
    },
    RichText: {
        template: `<div data-rich-text>{{{content}}}</div>`,
        props: [
            {
                type: 'slot',
                slug: 'content',
                label: 'Content'
            },
        ]
    },
    Columns: {
        template: `<div data-columns>{{{content}}}</div>`,
        props: [
            {
                type: 'slot',
                slug: 'content',
                label: 'Content'
            },
        ]
    }
}

export async function setupCms(req, res) {
    const {template, password} = req.body

    await db('users').insert({
        username: 'admin',
        password: `_%${password}%_`
    })

    let definitions = {}
    // inset default modules
    for(let key in defaultModules) {
        const res = await db('definitions').insert({
            name: key,
            props: defaultModules[key].props,
            template: defaultModules[key].template,
        })
        definitions[res.name] = res

    }

    const mod = await import(`../templates/${template}/index.js`)

    if(mod.default) {
        let collections = {}
        for (let definition of mod.default.definitions) {
            const def = (await definition).default
            const res = await db('definitions').insert({...def})
            definitions[res.name] = res
        }


        for(let collection of mod.default.collections) {
            const {name, fields, contents} = collection
            
            const res = await db('collections').insert({name, fields})  
            collections[res.name] = res

            for(let item of contents) {
                for(let key in item) {
                    const field = fields.find(x => x.slug === key)
                    const prop = item[key]
                    if(!field) console.log('Field not found: ', key, fields)
                    if(field.type === 'file' && !field.multiple) {
                        const {id} = await db('files').insert({
                            name: prop
                        })

                        cpSync(`./templates/${template}/files/${prop}`, `./uploads/${id}`)
                        item[key] = id
                    }
                }
                item._type = res.id

                await db('contents').insert(item)
            }
        } 
        
        for(let key in collections) {
            const collection = collections[key]
            for(let field of collection.fields) {
                if(field.type === 'relation') {
                    field.collectionId = collections[field.collection].id
                    delete field.collection
                }
            }
            await db('collections').update(collection)
        }
        for(let page of mod.default.pages) {
            const request = {
                title: page.title,
                name: page.name,
                slug: page.slug
            }

            if(page.dynamic) {
                request.dynamic = true
                request.collectionId = collections[page.collection].id
            }
            
            const res = await db('pages').insert(request)

            async function addModules(modules, moduleId = null) {
                let result = []
                let index = 0
                let afterInsertActions = []
                for(let module of modules) {
                    
                    for(let prop of definitions[module.name].props) {
                        if(!module.props) continue;
                        const value = module.props[prop.slug]


                        if(prop.type === 'file' && !page.dynamic) {
                            const {id} = await db('files').insert({
                                name: value
                            })
                            
                            afterInsertActions.push({
                                type: 'move-file',
                                value: {
                                    name: value,
                                    id
                                }
                            })
                            
                            module.props[prop.slug] = id
                        }

                        if(prop.type === 'slot') {
                            afterInsertActions.push({
                                type: 'insert-module',
                                value: module.props[prop.slug]
                            })
                            delete module.props[prop.slug]

                        }
                    }
                    
                    let res2
                    if(!moduleId) {

                        let res1 = await db('modules').insert({
                            definitionId: definitions[module.name].id,
                            moduleId,
                            pageId: res.id,
                            props: module.props ?? {},
                            links: module.links ?? {},
                            order: index++
                        })

                        res2 = await db('modules').insert({
                            definitionId: definitions['Columns'].id,
                            moduleId: res1.id,
                            props: {},
                            links: {},
                            order: 0,
                        })
                    } else {
                        res2 = await db('modules').insert({
                            definitionId: definitions[module.name].id,
                            moduleId,
                            pageId: moduleId ? undefined : res.id,
                            props: module.props ?? {},
                            links: module.links ?? {},
                            cols: module.cols ?? 12,
                            order: index++
                        })
                    }

                    for(let action of afterInsertActions) {
                        if(action.type === 'insert-module') {
                            const res = await addModules(action.value ?? [], res2.id)
                        }
                        if(action.type === 'move-file') {
                            cpSync(`./templates/${template}/files/${action.value.name}`, `./uploads/${action.value.id}`)
                        }
                    }
                    afterInsertActions = []

                    result.push(res2.id)
                }
                return result;
            }
            
            await addModules(page.modules)
            

        }

    }
    res.redirect('?mode=edit')
}