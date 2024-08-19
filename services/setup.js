import {cpSync, existsSync, readFileSync, rmSync} from 'node:fs'
import db from "./db.js"
import JSZip from 'jszip'
import { mkdir, writeFile } from 'node:fs/promises'

const defaultModules = {
    Section: {
        template: `<div data-section {{#if fullWidth}} data-section-full-width {{/if}} style="padding-top: {{paddingTop}}px; padding-bottom: {{paddingBottom}}px;">{{{content}}}</div>`,
        props: [
            {
                type: 'checkbox',
                slug: 'fullWidth',
                label: 'Full Width',
                defaultValue: true
            },
            {
                type: 'input',
                slug: 'paddingTop',
                label: 'Padding Top',
                defaultValue: 0
            },
            {
                type: 'input',
                slug: 'paddingBottom',
                label: 'Padding Bottom',
                defaultValue: 0
            },
            {
                type: 'slot',
                slug: 'content',
                label: 'Content'
            },
        ]
    },
    RichText: {
        template: `<div data-html data-rich-text-inline>{{{content}}}</div>`,
        props: [
            {
                type: 'rich-text',
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
    const {template, password, file} = req.body

    await db('users').insert({
        username: 'admin',
        password: `_%${password}%_`
    })

    let _definitions = {}
    let _collections = {}
    const idMap = {}

    async function importPages(pages) {
        for(let page of pages) {
            const request = {
                name: page.name,
                slug: page.slug,
                head: page.head,
                dynamic: page.dynamic,
                script: page.script,
                style: page.style,
                seo: page.seo
            }

            if(page.dynamic) {
                request.collectionId = _collections[page.collection].id
            }
            
            const res = await db('pages').insert(request)

            async function addModules(modules, moduleId = null) {
                let result = []
                let index = 0
                let afterInsertActions = []
                for(let module of modules) {
                    for(let prop of _definitions[module.definition].props) {
                        if(!module.props) continue;
                        const value = module.props[prop.slug]

                        if(prop.type === 'relation') {
                            const value = module.props[prop.slug]
                            if(value && !value.filters) {
                                if(prop.multiple) {
                                    if(value) {
                                        module.props[prop.slug] = value.map(x => idMap[x])
                                    }
                                } else {
                                    if(value) {
                                        module.props[prop.slug] = idMap[value]
                                    }
                                }
                            }
                        }

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
                            definitionId: _definitions[module.definition].id,
                            moduleId,
                            pageId: res.id,
                            props: module.props ?? {},
                            links: module.links ?? {},
                            order: index++
                        })

                        res2 = await db('modules').insert({
                            definitionId: _definitions['Columns'].id,
                            moduleId: res1.id,
                            props: {},
                            links: {},
                            order: 0,
                        })
                    } else {
                        res2 = await db('modules').insert({
                            definitionId: _definitions[module.definition].id,
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
                            if(file) {
                                cpSync(`./temp/site/files/${action.value.name}`, `./uploads/${action.value.id}`)
                            } else {
                                cpSync(`./templates/${template}/files/${action.value.name}`, `./uploads/${action.value.id}`)
                            }
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

    async function importCollections(collections) {
        console.log('import Collections', collections)

        for(let collection of collections) {
            let {name, fields, contents} = collection

            const nameField = fields.find(x => x.slug === 'name')
            if(nameField) {
                nameField.default = true
            } else {
                fields = [
                    {slug: 'name', label: 'Name', default: true, type: 'input'},
                    ...fields
                ]
            }
            
            const res = await db('collections').insert({name, fields})  
            _collections[res.name] = res
            console.log('set Collections', _collections)

            for(let item of contents) {
                for(let key in item) {
                    const field = fields.find(x => x.slug === key)
                    const prop = item[key]

                    if(key === 'id') {
                        continue
                        // handle relations.
                    }

                    if(!field) console.log('Field not found: ', key, fields)
                    if(field.type === 'file' && !field.multiple) {
                        const {id} = await db('files').insert({
                            name: prop
                        })

                        if(file) {
                            cpSync(`./temp/site/files/${prop}`, `./uploads/${id}`)
                        } else {
                            cpSync(`./templates/${template}/files/${prop}`, `./uploads/${id}`)
                        }
                        item[key] = id
                    }
                    
                }
                item._type = res.id

                const itemId = item.id
                delete item.id
                const res2 = await db('contents').insert(item)
                
                idMap[itemId] = res2.id
            }
        } 

        for(let collection of await db('collections').query().all()) {
            for(let field of collection.fields) {
                if(field.type === 'relation') {
                    field.collectionId = _collections[field.collection].id
                    delete field.collection
                }
            }
            await db('collections').update(collection)

            const contents = await db('contents').query().filter('_type', '=', collection.id).all()

            for(let item of contents) {
                for(let field of collection.fields) {
                    if(field.type === 'relation') {
                        if(field.multiple) {
                            item[field.slug] = item[field.slug].map(x => idMap[x])
                        } else {
                            item[field.slug] = idMap[item[field.slug]]
                        }
                    }
                }
                await db('contents').update(item)
            }
        }
    }

    if(file) {
        const zipFile = './uploads/' + file;

        if(!existsSync('./temp')) {
            await mkdir('./temp')
        } else {
            rmSync('./temp', {force: true, recursive: true})
            await mkdir('./temp')
        }

        const zip = new JSZip()

        const content = await zip.loadAsync(readFileSync(zipFile) , {createFolders: true})

        const promises = []

        content.forEach((path, file) => {
            promises.push(
                new Promise(async resolve => {
                    if (!file.dir) {
                        // Extract the file content as a buffer
                        const fileContent = await file.async('nodebuffer');

                        // Write the file content to the specified path
                        await writeFile('./temp/' + path, fileContent);
                    } else {
                        await mkdir('./temp/' + path, {recursive: true})
                    }
                    resolve() // After all contents finished..
                })
            )
        })

        await Promise.all(promises)

        const pagesFile = './temp/site/pages.json'
        const collectionsFile = './temp/site/collections.json'
        const definitionsFile = './temp/site/definitions.json'

        const pages = JSON.parse(readFileSync(pagesFile))
        const collections = JSON.parse(readFileSync(collectionsFile))
        const definitions = JSON.parse(readFileSync(definitionsFile))

        await importCollections(collections)

        for (let definition of definitions) {
            for(let prop of definition.props) {
                if(prop.type === 'relation') {
                    prop.collectionId = _collections[prop.collection]?.id
                    delete prop.collection
                }   
            }
            const res = await db('definitions').insert(definition)

            _definitions[res.name] = res
        }

        
        await importPages(pages)
        
    } else {
        // inset default modules
        for(let key in defaultModules) {
            const res = await db('definitions').insert({
                name: key,
                props: defaultModules[key].props,
                template: defaultModules[key].template,
            })
            _definitions[res.name] = res
    
        }
    
        const mod = await import(`../templates/${template}/index.js`)
    
        if(mod.default) {
            for (let definition of mod.default.definitions) {
                let def = definition
                if(definition.file) {
                    definition.file = `../templates/${template}/definitions/${definition.file}`
                    def = {
                    
                        ...def, 
                        ...(await import(definition.file)).default
                    }

                    // delete def.load
                }
                const res = await db('definitions').insert({...def})
                _definitions[res.name] = res
            }
    
            await importCollections(mod.default.collections)

    
            for(let key in _definitions) {
                const definition = _definitions[key]
                for(let prop of definition.props) {
                    
                    if(prop.type === 'relation') {
                        prop.collectionId = _collections[prop.collection]?.id
                        delete prop.collection
                    }
                }
                await db('definitions').update(definition)
            }

            
            await importPages(mod.default.pages)
    
        }
    }

    res.redirect('?mode=edit')
}

