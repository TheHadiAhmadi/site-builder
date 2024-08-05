import hbs from 'handlebars'
import { Button, DeleteConfirm, EmptyTable, Form, Input, Modal, Page, Table } from './components.js'

import { db } from "#services";
import layouts from "./layouts.js";
import { pageCreateModule, pageUpdateModule } from './pages/modules.js';
import { collectionDataCreate, collectionDataList, collectionDataUpdate, CollectionForm, createCollectionPage, FieldInput, updateCollectionPage } from './pages/collections.js';
import { pageCreatePage, pageUpdatePage } from './pages/pages.js';
import { renderModule } from './renderModule.js';

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
        if(definition.path) {
            try {
                definitions[definition.id] = await import(definition.path).then(res => res.default)
            } catch(err) {
                definitions[definition.id] = {}
            }
        } else {
            definitions[definition.id] = {}
        }
        definitions[definition.id].id = definition.id
        definitions[definition.id] = {...definitions[definition.id], ...definition }
    
        definitions[definition.id].template = hbs.compile(definitions[definition.id].template)
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
    return `
        <div data-sidebar-title>Modules</div>
        <div data-sidebar-body data-definitions>
            ${Object.keys(definitions).map(key => definitions[key]).map(x => `<div data-definition-id="${x.id}" data-sidebar-item><span>${x.name}</span>${permissions.module_update ? `<a data-enhance href="${getUrl({view: 'update-module', id: x.id})}" data-definition-settings>
            <svg data-definition-icon data-secondary-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
                </a>`: ''}
                </div>`).join('')}
            ${permissions.module_create ? (

                `<a data-enhance href="${getUrl({view: 'create-module'})}" data-sidebar-item data-sidebar-create-button>
                <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                Create Module
            </a>`
            ) : ''}
        </div>
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
            console.log({page,content})
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
        let res = ''
        for(let item in params) {
            res += content[item]
        }

        return res
    } 

    function getValue(content) {
        return hbs.compile(page.slug)(content)
    }



    return `<select style="width: max-content" data-select data-action="change-dynamic-page-content" data-trigger="change">
        ${items.map(x => `<option ${getSlug(page.slug, params) === getValue(x) ? 'selected' : ''} value="${getValue(x)}">${getText(x)}</option>`)}
    </select>`
}

//#region Render body
export async function renderBody(body, {props, mode, url, view, ...query}) {
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
        const items = await db('contents').query().filter('_type', '=', query.id).all();

        
        content = collectionDataList(collection, items)
    }else if(view === 'collection-data-create') {
        sidebar = 'collections'
        const collection = await db('collections').query().filter('id', '=', query.id).first()
        
        content = collectionDataCreate(collection)
    }else if(view === 'collection-data-update') {
        sidebar = 'collections'
        const data = await db('contents').query().filter('id', '=', query.id).first()
        const collection = await db('collections').query().filter('id', '=', data._type).first()
        
        
        content = collectionDataUpdate(collection, data)
    } else if(view === 'settings') {
        sidebar = 'settings'
        if(query.category === 'general') {
            content = Page({title: 'General settings', body: 'Content'})
        } else if(query.category === 'appearance') {
            content = Page({title: 'Appearance settings', body: 'Content'})
        } else if(query.category === 'profile') {
            content = Page({title: 'Profile settings', body: 'Content'})

        }
    }

    if(mode === 'edit') 
        return `
    <div data-body>
        <div data-toolbar>
            <div data-action="close-sidebar">
                <svg data-toolbar-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 16V8l-4 4zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm5-2h9V5h-9z"/></svg>
            </div>
            <div data-toolbar-logo>
                Logo(from settings)
            </div>
        </div>
        <div data-sidebar data-active="${sidebar}">
            <div data-sidebar-primary>
                <a data-enhance data-sidebar-item-small href="${getUrl({view: 'iframe'})}">
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                </a>
                <div data-sidebar-item-small data-action="navigation.navigate" data-path="pages">
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M4 23q-.825 0-1.412-.587T2 21V7h2v14h11v2zm4-4q-.825 0-1.412-.587T6 17V3q0-.825.588-1.412T8 1h7l6 6v10q0 .825-.587 1.413T19 19zm6-11h5l-5-5z"/></svg>
                </div>
                <div data-sidebar-item-small data-action="navigation.navigate" data-path="collections">
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 11q-3.75 0-6.375-1.175T3 7q0-1.65 2.625-2.825Q8.25 3 12 3t6.375 1.175Q21 5.35 21 7q0 1.65-2.625 2.825Q15.75 11 12 11Zm0 5q-3.75 0-6.375-1.175T3 12V9.5q0 1.1 1.025 1.863q1.025.762 2.45 1.237q1.425.475 2.963.687q1.537.213 2.562.213t2.562-.213q1.538-.212 2.963-.687q1.425-.475 2.45-1.237Q21 10.6 21 9.5V12q0 1.65-2.625 2.825Q15.75 16 12 16Zm0 5q-3.75 0-6.375-1.175T3 17v-2.5q0 1.1 1.025 1.863q1.025.762 2.45 1.237q1.425.475 2.963.688q1.537.212 2.562.212t2.562-.212q1.538-.213 2.963-.688t2.45-1.237Q21 15.6 21 14.5V17q0 1.65-2.625 2.825Q15.75 21 12 21Z"/></svg>
                </div>
                <div data-sidebar-item-small data-action="navigation.navigate" data-path="settings">
                    <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
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
    <script type="module" src="/js/sitebuilder.edit.js"></script>
    ${DeleteConfirm()}
    `

    return `<div data-body data-page-id="${currentPage.id}">
        ${(await Promise.all(body.map(x => renderModule(x, {props, mode, definitions, permissions})))).join('')}
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

    let props = {
        
    }

    
    //     props.slug = req.params.slug
    
    //     let query = await db('contents').query().filter('collectionId', '=', page.collectionId)

    //     if(page.multiple) {
    //         props.value = await query.all()
    //     } else {
    //         props.value = await query.first()
    //     }

    //     page.filters = [
    //         {field: 'username', operator: '=', value: '{{props.slug}}'},
    //         {field: 'status', operator: '=', value: 'active'},
    //     ]

    //     // page.mapping = {
    //     //     name: 'firstname',
    //     //     subtitle: 'lastname',
    //     //     image: 'profile'
    //     // }

    //     props.filters = page.filters;
    //     // props.mapping = page.mapping
    // }
    
    // page.title = render(page.title, props)
    // page.description = render(page.description, props)
    // ....

    let stylesheet;
    if(mode === 'edit') {
        stylesheet = '<link rel="stylesheet" href="/css/sitebuilder.edit.css">'
    } else if(mode === 'preview') {
        stylesheet = '<link rel="stylesheet" href="/css/sitebuilder.preview.css">'
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
            props.collection = collection
        }
    }

    let {head, title} = page;
    let modules = await getPageModules(page.id)

    const html = renderTemplate(layouts.default, {
        head: (head?? '') + (stylesheet ?? ''), 
        body: await renderBody(modules, {...req.query, props, mode, url: req.url, view}), 
        title: hbs.compile(title)(props)
    })

    res.send(html)

}