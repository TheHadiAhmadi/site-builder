import { existsSync, mkdirSync } from 'node:fs'
import {db} from "./db.js"
import { roleFields } from '../src/handlers/role.js'

const defaultModules = {
    Section: {
        template: `
            <div data-section {{#if fullWidth}} data-section-full-width {{/if}} {{#if lightColor}} data-section-text-light {{/if}} style="padding-top: {{paddingTop}}px; padding-bottom: {{paddingBottom}}px;{{#if backgroundImage}}background-image: url(/files/{{backgroundImage.id}}); background-size: cover;{{else}}{{#if backgroundColor}}background-color: {{backgroundColor}}; color: {{textColor}};{{/if}}{{/if}}">
                {{{content}}}
            </div>
        `,
        props: [
            {
                type: 'checkbox',
                slug: 'fullWidth',
                label: 'Full Width',
                hidden: true,
                defaultValue: true
            },
            {
                type: 'color',
                slug: 'backgroundColor',
                label: 'Background Color',
            },
            {
                type: 'file',
                slug: 'backgroundImage',
                label: 'Background Image',
                file_type: 'image',
                multiple: false
            },
            {
                type: 'checkbox',
                slug: 'lightColor',
                label: 'Light text colors',
                defaultValue: false
            },
            {
                type: 'input',
                slug: 'paddingTop',
                label: 'Padding Top',
                hidden: true,
                defaultValue: 0
            },
            {
                type: 'input',
                slug: 'paddingBottom',
                label: 'Padding Bottom',
                hidden: true,
                defaultValue: 0
            },
            {
                type: 'slot',
                slug: 'content',
                label: 'Content',
                hidden: true,
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
    const { password } = req.body

    let adminRoleId;

    await initializeFiles();
    await initializeRoles();
    await initializeUsers();
    await initializeBlocks();
    await initializeSettings();

    async function initializeFiles() {
        if(!existsSync('./uploads')) {
            mkdirSync('./uploads')
        }
    }

    async function initializeSettings() {
        await db('settings').insert({})
    }

    async function initializeRoles() {
        const adminRole = await db('roles').insert({
            name: 'Admin',
            permissions: (roleFields.find(x => x.slug === 'permissions')?.items ?? []).map( x => x.value)
        });
        adminRoleId = adminRole.id
    }

    async function initializeUsers() {
        const admin = await db('users').insert({
            name: 'Admin',
            username: 'admin',
            password: `_%${password}%_`,
            slug: 'admin',
            profile: '',
            role: adminRoleId,
            email: 'admin@example.com'    
        });

        res.cookie('userId', admin.id, {
            httpOnly: true
        })
    }

    async function initializeBlocks() {
        for(let key in defaultModules) {
            const res = await db('blocks').insert({
                name: key,
                props: defaultModules[key].props,
                template: defaultModules[key].template,
            })
        }
    }
    res.redirect('/admin')
}

// _definitions[res.name] = res
    //     for (let user of users) {
    //         if (user.username !== 'admin') {
    //             await db('users').insert({
    //                 name: user.name,
    //                 username: user.username,
    //                 password: `_%${password}%_`,
    //                 slug: user.slug,
    //                 profile: user.profile,
    //                 email: user.email
    //             });
    //         }
    //     }


    // }

    // async function importRoles(roles) {

    //     for (let role of roles) {
    //         if (role.name !== 'admin') {
    //             await db('roles').insert({
    //                 name: role.name,
    //                 permissions: user.permissions,
    //             });
    //         }
    //     }
    // }

    // let _definitions = {}
    // let _collections = {}
    // const idMap = {}

    // async function importPages(pages) {
    //     for(let page of pages) {
    //         const request = {
    //             name: page.name,
    //             slug: page.slug,
    //             head: page.head,
    //             dynamic: page.dynamic,
    //             script: page.script,
    //             style: page.style,
    //             seo: page.seo,
    //             include_site_head: page.include_site_head
    //         }

    //         if(page.dynamic) {
    //             request.collectionId = _collections[page.collection].id
    //         }
            
    //         const res = await db('pages').insert(request)

    //         async function addModules(modules, moduleId = null) {
    //             let result = []
    //             let index = 0
    //             let afterInsertActions = []
    //             for(let module of modules) {
    //                 for(let prop of _definitions[module.definition]?.props ?? []) {
    //                     if(!module.props) continue;
    //                     const value = module.props[prop.slug]

    //                     if(prop.type === 'relation') {
    //                         const value = module.props[prop.slug]
    //                         if(value && !value.filters) {
    //                             if(prop.multiple) {
    //                                 if(value) {
    //                                     module.props[prop.slug] = value.map(x => idMap[x])
    //                                 }
    //                             } else {
    //                                 if(value) {
    //                                     module.props[prop.slug] = idMap[value]
    //                                 }
    //                             }
    //                         }
    //                     }

    //                     if(prop.type === 'file') {
    //                         if(prop.multiple) {
    //                             let result = []
    //                             for(let item of value ?? []) {

    //                                 const {id} = await db('files').insert({
    //                                     name: item
    //                                 })
                                    
    //                                 afterInsertActions.push({
    //                                     type: 'move-file',
    //                                     value: {
    //                                         name: item,
    //                                         path: file ? `./temp/site/files/${item}` : `./templates/${template}/files/${item}`,
    //                                         id
    //                                     }
    //                                 })
    //                                 result.push(id)
    //                             }
                                
    //                             module.props[prop.slug] = result
    //                         } else {
    //                             if(value) {
    //                                 const {id} = await db('files').insert({
    //                                     name: value
    //                                 })
                                    
    //                                 afterInsertActions.push({
    //                                     type: 'move-file',
    //                                     value: {
    //                                         path: file ? `./temp/site/files/${value}` : `./templates/${template}/files/${value}`,
    //                                         id
    //                                     }
    //                                 })
                                    
    //                                 module.props[prop.slug] = id
    //                             }
    //                         }
    //                     }

    //                     if(prop.type === 'slot') {
    //                         afterInsertActions.push({
    //                             type: 'insert-module',
    //                             value: module.props[prop.slug]
    //                         })
    //                         delete module.props[prop.slug]
    //                     }
    //                 }
                    
    //                 let res2
    //                 if(!moduleId) {

    //                     let res1 = await db('modules').insert({
    //                         definitionId: _definitions[module.definition].id,
    //                         moduleId,
    //                         pageId: res.id,
    //                         props: module.props ?? {},
    //                         links: module.links ?? {},
    //                         order: index++
    //                     })

    //                     res2 = await db('modules').insert({
    //                         definitionId: _definitions['Columns'].id,
    //                         moduleId: res1.id,
    //                         props: {},
    //                         links: {},
    //                         order: 0,
    //                     })
    //                 } else {
    //                     res2 = await db('modules').insert({
    //                         definitionId: _definitions[module.definition].id,
    //                         moduleId,
    //                         props: module.props ?? {},
    //                         links: module.links ?? {},
    //                         cols: module.cols ?? 12,
    //                         order: index++
    //                     })
    //                 }

    //                 for(let action of afterInsertActions) {
    //                     if(action.type === 'insert-module') {
    //                         const res = await addModules(action.value ?? [], res2.id)
    //                     }
    //                     if(action.type === 'move-file') {
    //                         cpSync(action.value.path, `./uploads/${action.value.id}`)
                            
    //                     }
    //                 }
    //                 afterInsertActions = []

    //                 result.push(res2.id)
    //             }
    //             return result;
    //         }
            
    //         await addModules(page.modules)
    //     }
    // }

    // async function importCollections(collections) {
    //     for(let collection of collections) {
    //         let {name, fields, contents} = collection

    //         const slugField = fields.find(x => x.slug === 'slug')
    //         if(slugField) {
    //             slugField.hidden = true
    //         } else {
    //             fields = [
    //                 {slug: 'slug', label: 'Slug', hidden: true, type: 'input'},
    //                 ...fields
    //             ]
    //         }
    //         const nameField = fields.find(x => x.slug === 'name')
    //         if(nameField) {
    //             nameField.default = true
    //         } else {
    //             fields = [
    //                 {slug: 'name', label: 'Name', default: true, type: 'input'},
    //                 ...fields
    //             ]
    //         }
            
            
    //         const res = await db('collections').insert({name, fields})  
    //         _collections[res.name] = res

    //         for(let item of contents) {
    //             if(!item.slug) {
    //                 item.slug = slugify(item.name)
    //             }
    //             for(let key in item) {
    //                 const field = fields.find(x => x.slug === key)
    //                 const prop = item[key]

    //                 if(key === 'id') {
    //                     continue
    //                     // handle relations.
    //                 }

    //                 if(!field) console.log('Field not found: ', key, fields)
    //                 if(field.type === 'file') {
    //                     if(field.multiple) {
    //                         let result;
    //                         for(let name of prop) {
    //                             const {id} = await db('files').insert({
    //                                 name
    //                             })
                            
    //                             if(file) {
    //                                 cpSync(`./temp/site/files/${name}`, `./uploads/${id}`)
    //                             } else {
    //                                 cpSync(`./templates/${template}/files/${name}`, `./uploads/${id}`)
    //                             }
    //                             result.push(id)
    //                         }
    //                         item[key] = result
    //                     } else {
    //                         const {id} = await db('files').insert({
    //                             name: prop
    //                         })
                        
    //                         if(file) {
    //                             cpSync(`./temp/site/files/${prop}`, `./uploads/${id}`)
    //                         } else {
    //                             cpSync(`./templates/${template}/files/${prop}`, `./uploads/${id}`)
    //                         }
    //                         item[key] = id
    //                     }
    //                 }
                    
    //             }
    //             item._type = res.id

    //             const itemId = item.id
    //             delete item.id
    //             const res2 = await db('contents').insert(item)
                
    //             idMap[itemId] = res2.id
    //         }
    //     } 

    //     for(let collection of await db('collections').query().all()) {
    //         for(let field of collection.fields) {
    //             if(field.type === 'relation') {
    //                 field.collectionId = _collections[field.collection].id
    //                 delete field.collection
    //             }
    //         }
    //         await db('collections').update(collection)

    //         const contents = await db('contents').query().filter('_type', '=', collection.id).all()

    //         for(let item of contents) {
    //             for(let field of collection.fields) {
    //                 if(field.type === 'relation') {
    //                     if(field.multiple) {
    //                         item[field.slug] = item[field.slug].map(x => idMap[x])
    //                     } else {
    //                         item[field.slug] = idMap[item[field.slug]]
    //                     }
    //                 }
    //             }
    //             await db('contents').update(item)
    //         }
    //     }
    // }

    // if(file) {
    //     const zipFile = './uploads/' + file;

    //     if(!existsSync('./temp')) {
    //         await mkdir('./temp')
    //     } else {
    //         rmSync('./temp', {force: true, recursive: true})
    //         await mkdir('./temp')
    //     }

    //     const zip = new JSZip()

    //     const content = await zip.loadAsync(readFileSync(zipFile) , {createFolders: true})

    //     const promises = []

    //     for(let key in defaultModules) {
    //         const res = await db('definitions').insert({
    //             name: key,
    //             props: defaultModules[key].props,
    //             template: defaultModules[key].template,
    //         })
    //         _definitions[res.name] = res
    //     }

    //     content.forEach((path, file) => {
    //         promises.push(
    //             new Promise(async resolve => {
    //                 if (!file.dir) {
    //                     // Extract the file content as a buffer
    //                     const fileContent = await file.async('nodebuffer');

    //                     // Write the file content to the specified path
    //                     await writeFile('./temp/' + path, fileContent);
    //                 } else {
    //                     await mkdir('./temp/' + path, {recursive: true})
    //                 }
    //                 resolve() // After all contents finished..
    //             })
    //         )
    //     })

    //     await Promise.all(promises)

    //     const pagesFile = './temp/site/pages.json'
    //     const collectionsFile = './temp/site/collections.json'
    //     const definitionsFile = './temp/site/definitions.json'
    //     const usersFile = './temp/site/users.json'
    //     const rolesFile = './temp/site/roles.json'

    //     const pages = JSON.parse(readFileSync(pagesFile))
    //     const collections = JSON.parse(readFileSync(collectionsFile))
    //     const definitions = JSON.parse(readFileSync(definitionsFile))
    //     const users = JSON.parse(readFileSync(usersFile))
    //     const roles = JSON.parse(readFileSync(rolesFile))

    //     await importCollections(collections)

    //     await importRoles(roles)
    //     await importUsers(users)

    //     for (let definition of definitions) {
    //         for(let prop of definition.props) {
    //             if(prop.type === 'relation') {
    //                 prop.collectionId = _collections[prop.collection]?.id
    //                 delete prop.collection
    //             }   
    //         }

    //         if(definition.file) {
    //             const srcFile = './temp/site/definitions/' + basename(definition.file)
    //             const destFile = './definitions/' + basename(definition.file)
    //             definition.file = destFile

    //             if(!existsSync('./definitions')) {
    //                 mkdirSync('./definitions')
    //             }
    //             cpSync(srcFile, destFile)
    //         }
            
    //         const res = await db('definitions').insert(definition)

    //         _definitions[res.name] = res
    //     }

        
    //     await importPages(pages)
        
    // } else {
    //     // inset default modules
        
    
    //     const mod = await import(`../templates/${template}/index.js`)
    
    //     if(mod.default) {
    //         for (let definition of mod.default.definitions) {
    //             let def = definition
    //             if(definition.file) {
    //                 const filePath = `./templates/${template}/definitions/${definition.file}`
    //                 const newFilePath = './definitions/' + definition.file

    //                 if(!existsSync('./definitions')) {
    //                     mkdirSync('./definitions')
    //                 }
    //                 await copyFile(filePath, newFilePath)

    //                 def = {
    //                     ...def, 
    //                     file: newFilePath,
    //                     ...(await import(join('..', newFilePath))).default
    //                 }

    //                 // delete def.load
    //             }
    //             const res = await db('definitions').insert({...def})
    //             _definitions[res.name] = res
    //         }

    //         await importRoles(mod.default.roles ?? []);
    //         await importUsers(mod.default.users ?? []);
    
    //         await importCollections(mod.default.collections)
    
    //         for(let key in _definitions) {
    //             const definition = _definitions[key]
    //             for(let prop of definition.props ?? []) {
                    
    //                 if(prop.type === 'relation') {
    //                     prop.collectionId = _collections[prop.collection]?.id
    //                     delete prop.collection
    //                 }
    //             }
    //             await db('definitions').update(definition)
    //         }
            
    //         await importPages(mod.default.pages)
    //     }
    // }
// }

