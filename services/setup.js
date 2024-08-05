import {cpSync} from 'node:fs'
import db from "./db.js"

export async function setupCms(req, res) {
    const {template, password} = req.body

    await db('users').insert({
        username: 'admin',
        password: `_%${password}%_`
    })

    const mod = await import(`../templates/${template}/index.js`)

    if(mod.default) {
        let definitions = {}
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

            let index = 0
            for(let module of page.modules) {
                
                // Do not upload files of dynamic pages...
                if(!page.dynamic) {
                    for(let key in module.props) {
                        const field = definitions[module.name].props.find(x => x.slug === key)
                        const prop = module.props[key]
                        if(field.type === 'file') {
                            const {id} = await db('files').insert({
                                name: prop
                            })
                            
                            cpSync(`./templates/${template}/files/${prop}`, `./uploads/${id}`)
                            module.props[key] = id
                        }
                    }
                }
                
                await db('modules').insert({
                    definitionId: definitions[module.name].id,
                    pageId: res.id,
                    props: module.props ?? {},
                    links: module.links ?? {},
                    order: index++
                })
            }

        }

    }
    res.redirect('?mode=edit')
}