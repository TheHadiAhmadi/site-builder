import hbs from 'handlebars'
import { Button, Card, CardBody, DeleteConfirm, EmptyTable, File, Form, Input, Label, Modal, Page, Table, Textarea } from './components.js'
import {join} from 'path'

import { db } from "#services";
import layouts from "./layouts.js";
import { pageCreateModule, pageUpdateModule } from './pages/modules.js';
import { collectionDataCreate, collectionDataList, collectionDataUpdate, CollectionForm, createCollectionPage, FieldInput, RelationFieldModal, updateCollectionPage } from './pages/collections.js';
import { pageCreatePage, pageUpdatePage } from './pages/pages.js';
import { loadRelationFieldType, renderModule } from './renderModule.js';
import { userFields, UsersDataTable } from './handlers/user.js';

const definitions = {}

function renderTemplate(template, data) {
    return template(data)
}

async function getPage(slug) {
    if (!slug.startsWith('/')) {
        slug = '/' + slug;
    }
   
    const pages = await db('pages').query().all();
    
    for (let page of pages) {
        const dynamicParts = page.slug.split('/').filter(part => part.startsWith('{{') && part.endsWith('}}'));
        const staticParts = page.slug.split('/').filter(part => !part.startsWith('{{') && !part.endsWith('}}'));

        if(page.dynamic && dynamicParts.length === 0) {
            if(slug.endsWith('/') || slug.length == 1) {
                slug = slug + '{{slug}}' 
            } else {
                slug = slug + '/{{slug}}' 
            }

            dynamicParts.push('{{slug}}')
        }

        // Build regex to match the dynamic parts
        let regexStr = page.slug;
        for (const dynamicPart of dynamicParts) {
            regexStr = regexStr.replace(dynamicPart, '([^/]+)');
        }
        const regex = new RegExp(`^${regexStr}$`);

        const match = slug.match(regex);
        if (match) {
            const params = {};
            dynamicParts.forEach((part, index) => {
                const paramName = part.slice(2, -2);
                params[paramName] = match[index + 1];
            });

            return { params, page };
        } else if (page.slug === slug) {
            return { params: {}, page };
        }
    }
    
    return {}; // Return null if no matching page is found
}


// module.collectionId
// module.contentId

async function loadModuleDefinitions() {
    const defs = await db('definitions').query().all()
    
    for(let definition of defs) {
        if(definition.file) {
            try {
                console.log('definition.file: ', definition.file)
                const module = await import(join('..', definition.file)).then(res => {
                    return res.default
                })
                console.log('module: ', module)

                definitions[definition.id].load = module.load
                definitions[definition.id].actions = module.actions
            } catch(err) {
                definitions[definition.id] = definition
            }
        } else {
            definitions[definition.id] = definition
        }
    
        console.log(definitions[definition.id])
        if(typeof definitions[definition.id].template === 'string') {
            definitions[definition.id].template = hbs.compile(definitions[definition.id].template)
        }
    }   
}

function getUrl(query) {
    let res = `?mode=edit`
    for(let key in query) {
        res += '&' + key + '=' + query[key]
    }
    return res
}

function sidebarModules({permissions}) {
    const modules = Object.keys(definitions).map(key => definitions[key]).filter(x => !['Section', 'Columns'].includes(x.name))
    return `
        <div data-sidebar-title>Modules</div>
            <div data-sidebar-body data-definitions>
                ${modules.map(x => `<div data-definition-module data-definition-id="${x.id}" ${x.owner === 'ai' ? 'data-definition-ai' : ''} data-sidebar-item><span>${x.name}</span>${permissions.module_update ? `<a data-enhance href="${getUrl({view: 'update-module', id: x.id})}" data-definition-settings>
                    <svg data-definition-icon data-secondary-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
                    </a>`: ''}
                    </div>`).join('')}
            </div>
            ${permissions.module_create ? (

                `<div data-sidebar-body><a data-enhance href="${getUrl({view: 'create-module'})}" data-sidebar-item data-sidebar-create-button>
                <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                Create Module
            </a></div>`
            ) : ''}
    `
}

function sidebarCollections(collections, {permissions}) {
    return `
        <div data-sidebar-title>Collections</div>
        <div data-sidebar-body>
            ${collections.map(x => `
                <div data-sidebar-item data-action="navigation.link" data-href="${getUrl({view: 'collection-data-list', id: x.id})}">
                    <span>${x.name}</span>
            ${permissions.collection_update ? `<a data-enhance data-sidebar-icon href="${getUrl({view: 'update-collection', id: x.id})}">
                        <svg data-secondary-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
                    </a>` : ''}
                </div>`).join('')}
            ${permissions.collection_create ? `<a data-enhance href="${getUrl({view: 'create-collection'})}" data-sidebar-item data-sidebar-create-button>
                <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                Create Collection
            </a>` : ''}
            
        </div>
    `
}

function sidebarSettings() {
    return `
        <div data-sidebar-title>Settings</div>
        <div data-sidebar-body>
            <a data-enhance data-sidebar-item href="${getUrl({view: 'settings', category: 'general'})}">General</a>
            <a data-enhance data-sidebar-item href="${getUrl({view: 'settings', category: 'users'})}">Users</a>
            <a data-enhance data-sidebar-item href="${getUrl({view: 'settings', category: 'appearance'})}">Appearance</a>
            <a data-enhance data-sidebar-item href="${getUrl({view: 'settings', category: 'profile'})}">Profile</a>
        </div>
    `

}

async function sidebarPages(pages, {permissions}) {
    async function getPageSlug(page) {
        if(page.dynamic) {
            let query = db('contents').query().filter('_type', '=', page.collectionId);


            const content = await query.first()
            return getSlug(page.slug, content)
        }
        return page.slug
    }
    
    return `
        <div data-sidebar-title>Pages</div>
        <div data-sidebar-body>
            ${await Promise.all(pages.map(async x => `
                <div data-sidebar-item data-sidebar-page-item data-action="navigation.link" data-href="${await getPageSlug(x)}?mode=edit">
                    <div data-page-item-start>
                        <span>${x.name}</span>
                        <span data-page-item-slug>${x.slug}</span>
                    </div>
                    <a data-enhance data-sidebar-icon href="${getUrl({view: 'update-page', id: x.id})}">
                        <svg data-secondary-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
                    </a>
                </div>`)).then(res => res.join(''))}
            ${permissions.page_create ? `<a data-enhance href="${getUrl({view: 'create-page'})}" data-sidebar-item data-sidebar-create-button data-action="navigation.navigate" data-path="pages.create-page">
                <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                Create Page
            </a>` : ''}
            
        </div>
    `
}

function getSlug(slug, props) {
    return hbs.compile(slug)(props)
}

async function DynamicPageSelect(page, params) {
    const items = await db('contents').query().filter('_type', '=', page.collectionId).all()

    function getText(content) {
        return content.name
    } 

    function getValue(content) {
        return hbs.compile(page.slug)(content)
    }



    return `<select style="width: max-content" data-select data-action="change-dynamic-page-content" data-trigger="change">
        ${items.map(x => `<option ${getSlug(page.slug, params) === getValue(x) ? 'selected' : ''} value="${getValue(x)}">${getText(x)}</option>`)}
    </select>`
}

export async function handleModuleAction({module, method, body}) {
    const definition = definitions[module.definitionId]
    let res;

    if(definition.actions && definition.actions[method]) {
        res = await definition.actions[method](body)
    }

    return res;
}

//#region Render body
export async function renderBody(body, {props, mode, url, view, params, ...query}) {
    // const permissions = {} 
    const permissions = {
        page_create: true,
        module_create: true,
        module_update: true,
        collection_create: true,
        collection_update: true,
    } 

    await loadModuleDefinitions()
    
    let sidebarContent = ''
    let sidebar;
    let content;

    let pages = await db('pages').query().all()
    let collections = await db('collections').query().all()
    let settings = await db('settings').query().first() ?? {}

    let res = await getPage(url.split('?')[0])
    let currentPage = res.page

    if(!currentPage && view === 'iframe') view = 'create-page'

    let viewType = view === 'iframe' ? 'iframe' : 'page'
    
    if(view === 'iframe') {        
        sidebar = 'modules'
        content = `
            <div data-name="iframe">
                <div data-content-header>
                    <h2 data-header-title>Edit (${currentPage.name})</h2>
                    <div data-header-actions>
                        ${currentPage.dynamic ? await DynamicPageSelect(currentPage, props.params) : ''}
                        <a data-enhance data-button data-button-color="default" href="${getUrl({view: 'update-page', id: currentPage.id})}">Page Settings</a>
                        <a data-button data-button-color="primary" target="_blank" href="${getSlug(currentPage.slug, props.params)}">Preview</a>
                    </div>
                </div>
                <iframe class="iframe" src="${url.replace('mode=edit', 'mode=preview')}"></iframe>
            </div>
        `
    } else if(view === 'create-page') {
        sidebar = 'pages'
        content = pageCreatePage({collections})
    } else if(view === 'update-page') {
        sidebar = 'pages'
        const page = await db('pages').query().filter('id', '=', query.id).first()

        content = pageUpdatePage(page, {collections})
    } else if(view === 'create-module' ) {
        sidebar = 'modules'
        content = pageCreateModule()
    } else if(view === 'update-module' ) {
        sidebar = 'modules'
        const definition = await db('definitions').query().filter('id', '=', query.id).first()
        content = pageUpdateModule(definition)
        // ...
    } else if(view === 'create-collection') {
        sidebar = 'collections'
        content = createCollectionPage()
    } else if(view === 'update-collection') {
        sidebar = 'collections'
        const collection = await db('collections').query().filter('id', '=', query.id).first()

        content = updateCollectionPage(collection)
    } else if(view === 'collection-data-list') {
        sidebar = 'collections'
        const collection = await db('collections').query().filter('id', '=', query.id).first()
        
        content = await collectionDataList(collection)
    }else if(view === 'collection-data-create') {
        sidebar = 'collections'
        const collection = await db('collections').query().filter('id', '=', query.id).first()
        
        content = collectionDataCreate(collection)
    } else if(view === 'collection-data-update') {
        sidebar = 'collections'
        const data = await db('contents').query().filter('id', '=', query.id).first()
        const collection = await db('collections').query().filter('id', '=', data._type).first()
        
        content = collectionDataUpdate(collection, data)
    } else if(view === 'settings') {
        sidebar = 'settings'
        if(query.category === 'general') {
            content = Page({title: 'General settings', body: [
                Form({
                    load: 'settings.load',
                    handler: 'settings.save',
                    fields: [
                        Input({name: 'site_name', label: 'Site Name', placeholder: 'Enter Site Name'}),
                        Input({name: 'title', label: 'Site Title', placeholder: 'Enter Default Site Title'}),
                        Input({name: 'meta_title', label: 'Site Meta Title', placeholder: 'Enter Default Site Meta Title'}),
                        Textarea({name: 'meta_description', label: 'Default Site Meta Description'}),
                        Textarea({name: 'head', label: 'Head', placeholder: "Enter site Head content"}),
                        Input({name: 'gtags', label: 'Google tags ID', placeholder: 'Enter Google tags ID'}),
                        File({name: 'favicon', label: 'Favicon', type: 'image'}),
                        File({name: 'logo', label: 'Logo', type: 'image'}),
                    ]
                }),
                '<br/>',
                Card([
                    CardBody([
                        Label({
                            symbolic: true,
                            text: 'Backup site',
                            body: `<form method="POST" action="/api/export">${Button({color: 'primary', text: 'Backup', type: 'submit'})}</form>`

                        })
                    ])
                ])

                // Form()
            ]})
        
        } else if(query.category === 'appearance') {
            content = Page({title: 'Appearance settings', body: 'Content'})
        } else if(query.category === 'users') {
            content = Page({
                title: 'Users', 
                actions: [
                    Button({
                        href: getUrl({view: 'user-add'}), 
                        color: 'primary', 
                        text: 'Add user'
                    })
                ],
                body: await UsersDataTable({})
            })
        } else if(query.category === 'profile') {
            content = Page({title: 'Profile settings', body: 'Content'})

        }
    } else if(view === 'user-add') {
        sidebar = 'settings'
        content = Page({
            title: 'Add User',
            body: [
                Form({
                    handler: 'user.insert',
                    fields: userFields.filter(x => !x.hidden || x.slug === 'password').map(x => FieldInput(x))
                })
            ]
        })
    }

    if(mode === 'edit') 
        return `
    <div data-body>
        <div data-toolbar>
            <div data-action="close-sidebar">
                <svg data-toolbar-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 16V8l-4 4zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm5-2h9V5h-9z"/></svg>
            </div>
            <div data-toolbar-logo>
                ${settings.logo ? `<img style="height: 24px" src="/files/${settings.logo}">` : ''}
                ${settings.site_name ?? 'Logo'}
            </div>
        </div>
        <div data-sidebar data-active="${sidebar}">
            <div data-sidebar-primary>
                <div data-sidebar-item-small data-action="navigation.navigate" data-path="pages">
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M16 0H8C6.9 0 6 .9 6 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6zm4 18H8V2h7v5h5zM4 4v18h16v2H4c-1.1 0-2-.9-2-2V4z"/></svg>
                </div>
                <div data-sidebar-item-small data-action="open-add-module">
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 14 14"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M13.39 3a.47.47 0 0 0-.21-.16l-6-2.27a.45.45 0 0 0-.36 0l-6 2.31A.47.47 0 0 0 .61 3a.48.48 0 0 0-.11.3v7.32a.5.5 0 0 0 .32.46l6 2.31h.36l6-2.31a.5.5 0 0 0 .32-.46V3.34a.48.48 0 0 0-.11-.34Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M7 13.46V5.5m0 0v7.96M.61 3.04L7 5.5l6.39-2.46"/></svg>
                </div>
                <div data-sidebar-item-small data-action="navigation.navigate" data-path="collections">
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.59 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4m6 14c0 .5-2.13 2-6 2s-6-1.5-6-2v-2.23c1.61.78 3.72 1.23 6 1.23s4.39-.45 6-1.23zm0-4.55c-1.3.95-3.58 1.55-6 1.55s-4.7-.6-6-1.55V9.64c1.47.83 3.61 1.36 6 1.36s4.53-.53 6-1.36zM12 9C8.13 9 6 7.5 6 7s2.13-2 6-2s6 1.5 6 2s-2.13 2-6 2"/></svg>
                </div>
                <div data-sidebar-item-small data-action="navigation.navigate" data-path="settings">
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zM11 20h1.975l.35-2.65q.775-.2 1.438-.587t1.212-.938l2.475 1.025l.975-1.7l-2.15-1.625q.125-.35.175-.737T17.5 12t-.05-.787t-.175-.738l2.15-1.625l-.975-1.7l-2.475 1.05q-.55-.575-1.212-.962t-1.438-.588L13 4h-1.975l-.35 2.65q-.775.2-1.437.588t-1.213.937L5.55 7.15l-.975 1.7l2.15 1.6q-.125.375-.175.75t-.05.8q0 .4.05.775t.175.75l-2.15 1.625l.975 1.7l2.475-1.05q.55.575 1.213.963t1.437.587zm1.05-4.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5M12 12"/></svg>
                </div>
            </div>
            <div data-sidebar-secondary>            
                <div data-name="sidebar-modules">
                    ${sidebarModules({permissions})}
                </div>
                <div data-name="sidebar-pages">
                    ${await sidebarPages(pages, {permissions})}
                </div>
                <div data-name="sidebar-collections">
                    ${sidebarCollections(collections, {permissions})}
                </div>
                <div data-name="sidebar-settings">
                    ${sidebarSettings()}
                </div>
                <div data-name="sidebar-module-settings">
                    ${sidebarContent}
                </div>

            </div>
        </div>

        <div data-main data-active="${viewType}">
            ${content}
        </div>
    </div>
    <script src="https://unpkg.com/sortablejs@1.15.2/Sortable.min.js"></script>
    <script src="/js/quill.library.js"></script>
    <script type="module" src="/js/sitebuilder.edit.js"></script>
    ${DeleteConfirm()}
    ${RelationFieldModal()}
    `

    let previewContent  = ''
    
    if(mode === 'preview') {

        previewContent = `
            <div data-last-section>
                ${Button({text: 'Add Section', color: 'primary', action: 'add-section', dataset: {
                    order: (body.length + 1) ?? 1
                }})}
            </div>
        `
    }

    if(mode === 'view') {
        previewContent = '<script src="/js/sitebuilder.view.js"></script>'
    }

    const request = {
        query,
        params
    }

    return `<div data-body data-page-id="${currentPage.id}">
        ${(await Promise.all(body.map(x => renderModule(x, {props, mode, definitions, permissions, request})))).join('')}
            ${previewContent}
        </div>`
}
//#endregion

async function getPageModules(pageId) {
    return db('modules')
        .query()
        .filter('pageId', '=', pageId)
        .all()
        .then(res => res.sort((a, b) => a.order > b.order ? 1 : -1))
}

export async function renderPage(req, res) {    
    const {page, params} = await getPage(req.params[0])
    const mode = req.query.mode ?? 'view'
    const view = req.query.view ?? 'iframe'

    let props = {}
    props.settings = await db('settings').query().first() ?? {}

    let stylesheet;
    if(mode === 'edit') {
        stylesheet = '<link rel="stylesheet" href="/css/sitebuilder.edit.css">'
    } else if(mode === 'preview') {
        stylesheet = '<link rel="stylesheet" href="/css/sitebuilder.preview.css">'
    } else if(mode === 'view') {
        stylesheet = '<link rel="stylesheet" href="/css/sitebuilder.view.css">'

    }
    if(mode === 'edit' || mode === 'preview') {
        stylesheet += `
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
        `

        stylesheet += `
            <link rel="stylesheet" href="/css/components/quill.snow.css">
        `
    }


    if(!page) {
        if(mode == 'edit') {
            
            const html = renderTemplate(layouts.default, {
                head: stylesheet, 
                body: await renderBody([], {...req.query, mode, url: req.url, view}), 
                title: 'Untitled'
            })
        
            return res.send(html)
        } else {
            return res.send('404');
        }
    }
    
    if(page.dynamic) {
        props.params = params
        if(page.collectionId) {
            let collection = await db('collections').query().filter('id', '=', page.collectionId).first()
            let query = db('contents').query().filter('_type', '=', page.collectionId)
            for(let param in params) {
                query = query.filter(param, '=', params[param])
            }

            props.pageContent = await query.first()
            for(let field of collection.fields) {
                if(field.type === 'relation') {
                    props.pageContent[field.slug] = await loadRelationFieldType(props.pageContent[field.slug], field)
                }
                if(field.type === 'file') {
                    if(field.multiple) {
                        props.pageContent[field.slug] = await db('files').query().filter('id', 'in', props.pageContent[field.slug]).all()
                    } else {
                        props.pageContent[field.slug] = await db('files').query().filter('id', '=', props.pageContent[field.slug]).first()
                    }
                }
            }
            props.collection = collection
        }
    }

    let {head} = page;
    let modules = await getPageModules(page.id)

    page.lang ??= 'en'
    page.dir ??= 'ltr'

    const seo = {}
    for(let key in page.seo) {
        seo[key] = hbs.compile(page.seo[key])(props)
    }

    const html = renderTemplate(layouts.default, {
        head: (head?? '') + (stylesheet ?? ''), 
        body: await renderBody(modules, {...req.query, props, params, mode, url: req.url, view}), 
        script: page.script,
        style: page.style,
        dir: page.dir,
        lang: page.lang,
        include_site_head: page.include_site_head,
        seo,
        settings: await db('settings').query().first() ?? {}
    })

    res.send(html)

}