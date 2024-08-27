import hbs from 'handlebars'
import './handlebars.js'
import { Button, Card, CardBody, DeleteConfirm, File, Form, Input, Label, Page, Textarea } from './components.js'
import { join } from 'path'

import { db } from "#services";
import layouts from "./layouts.js";
import { CreateModuleAiModal, pageCreateModule, pageUpdateModule, UpdateModuleAiModal } from './pages/modules.js';
import { collectionDataCreate, collectionDataList, collectionDataUpdate, createCollectionPage, FieldInput, RelationFieldModal, updateCollectionPage } from './pages/collections.js';
import { pageCreatePage, pageUpdatePage } from './pages/pages.js';
import { loadRelationFieldType, normalizeCollectionContent, renderModule } from './renderModule.js';
import { userFields, UsersDataTable } from './handlers/user.js';

let definitions = {}

async function getPage(slug) {
    if (!slug.startsWith('/')) {
        slug = '/' + slug;
    }

    const pages = await db('pages').query().all();

    for (let page of pages) {
        const dynamicParts = page.slug.split('/').filter(part => part.startsWith('{{') && part.endsWith('}}'));

        if (page.dynamic && dynamicParts.length === 0) {
            if (slug.endsWith('/') || slug.length == 1) {
                slug = slug + '{{slug}}'
            } else {
                slug = slug + '/{{slug}}'
            }

            dynamicParts.push('{{slug}}')
        }

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

    return {};
}

async function loadModuleDefinitions() {
    const defs = await db('definitions').query().all()
    definitions = {}
    for (let definition of defs) {
        if (definition.file) {
            try {
                const module = await import(join('..', definition.file)).then(res => {
                    return res.default
                })

                definitions[definition.id].load = module.load
                definitions[definition.id].actions = module.actions
            } catch (err) {
                definitions[definition.id] = definition
            }
        } else {
            definitions[definition.id] = definition
        }

        if (typeof definitions[definition.id].template === 'string') {
            definitions[definition.id].template = hbs.compile(definitions[definition.id].template)
        }
    }
}

function getUrl(query) {
    let res = `?mode=edit`
    for (let key in query) {
        res += '&' + key + '=' + query[key]
    }
    return res
}

function sidebarBlocks(id, { permissions }) {
    const modules = Object.keys(definitions).map(key => definitions[key]).filter(x => !['Section', 'Columns', 'RichText'].includes(x.name))
    return `
            <div data-sidebar-body>
                ${modules.map(x => `<a href="${getUrl({ view: 'blocks.update', id: x.id })}" data-sidebar-item ${id === x.id ? 'data-active' : ''}>
                    <span>${x.name}</span>
                </a>`).join('')}
            </div>
            ${permissions.block_create ? (

            `<div data-sidebar-body><a data-enhance href="${getUrl({ view: 'blocks.create' })}" data-sidebar-item-button>
                <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                Create Block
            </a></div>`
        ) : ''}
    `
}

function sidebarCollections(collections, id, { permissions }) {
    return `
        <div data-sidebar-body>
            ${collections.map(x => `
                <div data-sidebar-item ${id === x.id ? 'data-active' : ''} data-action="navigation.link" data-href="${getUrl({ view: 'collections.data.list', id: x.id })}">
                    <span>${x.name}</span>
            ${permissions.collection_update ? `<a data-enhance data-sidebar-icon href="${getUrl({ view: 'collections.update', id: x.id })}">
                        <svg data-secondary-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
                    </a>` : ''}
                </div>`).join('')}
        </div>
        <div data-sidebar-body>

            ${permissions.collection_create ? `<a data-enhance href="${getUrl({ view: 'collections.create' })}" data-sidebar-item-button>
                <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                Create Collection
            </a>` : ''}
            
        </div>
    `
}

function sidebarSettings(view) {
    return `
        <div data-sidebar-body>
            <a data-enhance data-sidebar-item ${view.startsWith('settings.general') ? 'data-active' : ''} href="${getUrl({ view: 'settings.general' })}">General</a>
            <a data-enhance data-sidebar-item ${view.startsWith('settings.users') ? 'data-active' : ''} href="${getUrl({ view: 'settings.users.list' })}">Users</a>
            <a data-enhance data-sidebar-item ${view.startsWith('settings.appearance') ? 'data-active' : ''} href="${getUrl({ view: 'settings.appearance' })}">Appearance (Soon)</a>
            <a data-enhance data-sidebar-item ${view.startsWith('settings.profile') ? 'data-active' : ''} href="${getUrl({ view: 'settings.profile' })}">Profile (Soon)</a>
        </div>
    `
}

async function getPageSlug(page) {
    if (page.dynamic) {
        let query = db('contents').query().filter('_type', '=', page.collectionId);

        const content = await query.first()
        if(!page.slug.includes('{{')) {
            page.slug = join(page.slug, '{{slug}}')
        }
        return getSlug(page.slug, content)
    }
    return page.slug
}

async function sidebarPages(pages, currentPage, { permissions }) {
    return `
        <div data-sidebar-body>
            
            ${await Promise.all(pages.map(async x => `
                <div data-sidebar-item ${currentPage.id === x.id ? 'data-active' : ''} data-sidebar-page-item data-action="navigation.link" data-href="${await getPageSlug(x)}?mode=edit">
                    <div data-page-item-start>
                        <span  style="white-space: nowrap;">${x.name}</span>
                        <span data-page-item-slug>${x.slug}</span>
                    </div>
                    ${permissions.page_update ? `<a data-enhance data-sidebar-icon href="${getUrl({ view: 'pages.update', id: x.id })}">
                        <svg data-secondary-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>
                    </a>` : ''}
                </div>`)).then(res => res.join(''))
            }
            ${permissions.page_create ? `<a data-enhance href="${getUrl({ view: 'pages.create' })}" data-sidebar-item-button>
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

export async function handleModuleAction({ module, method, body }) {
    const definition = definitions[module.definitionId]
    let res;

    if (definition.actions && definition.actions[method]) {
        res = await definition.actions[method](body)
    }

    return res;
}

async function BlockList() {
    const modules = Object.keys(definitions).map(key => definitions[key]).filter(x => !['Section', 'Columns'].includes(x.name))
    return `
            <div data-definitions>
                <span data-alert>
                    <svg class="margin-right: 0.5rem" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/></svg>
                    <span>Drag and drop blocks to page!</span>
                </span>
                ${modules.map(x => `<div data-definition-module data-definition-id="${x.id}">
                    <span>${x.name}</span>
                </div>`).join('')}
            </div>
    `
}

//#region Render body
export async function renderBody(body, { props, mode, url, view, params, ...query }) {
    // const permissions = {} 
    const permissions = {
        page_create: true,
        page_update: true,
        block_create: true,
        block_update: true,
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
    console.log(res, url.split('?')[0])
    let currentPage = res.page

    if (!currentPage && view === 'iframe') view = 'pages.create'

    if (view === 'iframe' || !view) {
        sidebar = 'modules'
        sidebarContent = await BlockList()

        content = `
            <div data-name="iframe">
                <div data-iframe-header>
                    <div data-iframe-actions>
                        <div data-iframe-actions-start>
                            <div data-iframe-title>${currentPage.name}</div>
                        </div>
                        <div data-iframe-actions-end>
                            ${currentPage.dynamic ? await DynamicPageSelect(currentPage, props.params) : ''}
                            
                            ${view === 'iframe' ? `
                                <a data-enhance data-button data-button-color="default" href="${getUrl({ view: 'pages.update', id: currentPage.id, back: encodeURIComponent('?mode=edit&view=iframe') })}">
                                    <svg data-icon data-icon-size="sm" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zM11 20h1.975l.35-2.65q.775-.2 1.438-.587t1.212-.938l2.475 1.025l.975-1.7l-2.15-1.625q.125-.35.175-.737T17.5 12t-.05-.787t-.175-.738l2.15-1.625l-.975-1.7l-2.475 1.05q-.55-.575-1.212-.962t-1.438-.588L13 4h-1.975l-.35 2.65q-.775.2-1.437.588t-1.213.937L5.55 7.15l-.975 1.7l2.15 1.6q-.125.375-.175.75t-.05.8q0 .4.05.775t.175.75l-2.15 1.625l.975 1.7l2.475-1.05q.55.575 1.213.963t1.437.587zm1.05-4.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5M12 12"/></svg>    
                                    Page Settings
                                </a>
                                <a data-enhance href="?mode=edit" data-button data-button-color="primary">Done</a>
                            ` : `
                                <a data-enhance href="?mode=edit&view=iframe" data-button data-button-color="primary">Edit</a>
                            `}
                        </div>
                    </div>
                </div>

                <div data-iframe-wrapper>
                    <iframe class="iframe" src="${url.replace('mode=edit', 'mode=' + (view === 'iframe'  ? 'preview' : 'view'))}"></iframe>
                </div>
            </div>
        `
    } else if (view === 'pages.create') {
        content = pageCreatePage({ collections })
    } else if (view === 'pages.update') {
        const page = await db('pages').query().filter('id', '=', query.id).first()

        content = pageUpdatePage(page, { back: decodeURIComponent(query.back), collections })
    } else if (view === 'blocks.create') {
        content = pageCreateModule()
    } else if (view === 'blocks.update') {
        const definition = await db('definitions').query().filter('id', '=', query.id).first()
        content = pageUpdateModule(definition)
    } else if (view === 'collections.create') {
        content = createCollectionPage()
    } else if (view === 'collections.update') {
        const collection = await db('collections').query().filter('id', '=', query.id).first()

        content = updateCollectionPage(collection)
    } else if (view === 'collections.data.list') {
        const collection = await db('collections').query().filter('id', '=', query.id).first()

        content = await collectionDataList(collection)
    } else if (view === 'collections.data.create') {
        const collection = await db('collections').query().filter('id', '=', query.id).first()
        const collections = await db('collections').query().all()

        content = collectionDataCreate(collection, collections)
    } else if (view === 'collections.data.update') {
        const data = await db('contents').query().filter('id', '=', query.id).first()
        const collection = await db('collections').query().filter('id', '=', data._type).first()
        const collections = await db('collections').query().first()

        content = await collectionDataUpdate(collection, data, collections)
    } else if (view === 'settings.general') {
        content = Page({
            title: 'General settings', body: [
                Form({
                    load: 'settings.load',
                    handler: 'settings.save',
                    fields: [
                        Input({ name: 'site_name', label: 'Site Name', placeholder: 'Enter Site Name' }),
                        Input({ name: 'title', label: 'Site Title', placeholder: 'Enter Default Site Title' }),
                        Input({ name: 'meta_title', label: 'Site Meta Title', placeholder: 'Enter Default Site Meta Title' }),
                        Textarea({ name: 'meta_description', label: 'Default Site Meta Description' }),
                        Textarea({ name: 'head', label: 'Head', placeholder: "Enter site Head content" }),
                        Input({ name: 'gtags', label: 'Google tags ID', placeholder: 'Enter Google tags ID' }),
                        File({ name: 'favicon', label: 'Favicon', type: 'image' }),
                        File({ name: 'logo', label: 'Logo', type: 'image' }),
                    ]
                }),
                '<br/>',
                Card([
                    CardBody([
                        Label({
                            symbolic: true,
                            text: 'Backup site',
                            body: `<form method="POST" action="/api/export">${Button({ color: 'primary', text: 'Backup', type: 'submit' })}</form>`

                        })
                    ])
                ])

                // Form()
            ]
        })
    } else if (view === 'settings.appearance') {
        content = Page({ title: 'Appearance settings', body: 'Content' })
    } else if (view === 'settings.users.list') {
        content = Page({
            title: 'Users',
            actions: [
                Button({
                    href: getUrl({ view: 'settings.users.create' }),
                    color: 'primary',
                    text: 'Add user'
                })
            ],
            body: await UsersDataTable({})
        })
    } else if (view === 'settings.profile') {
        content = Page({ title: 'Profile settings', body: 'Content' })
    } else if (view === 'settings.users.create') {
        content = Page({
            title: 'Add User',
            back: '?mode=edit&view=settings.users.list',
            body: [
                Form({
                    handler: 'user.insert',
                    cancelHref: '?mode=edit&view=settings.users.list',
                    fields: userFields.filter(x => !x.hidden || x.slug === 'password').map(x => FieldInput(x))
                })
            ]
        })
    } else if (view === 'settings.users.update') {
        content = [
            Page({
                title: 'Edit User',
                back: '?mode=edit&view=settings.users.list',
                body: [
                    Form({
                        load: 'user.load',
                        cancelHref: '?mode=edit&view=settings.users.list',
                        id: query.id,
                        handler: 'user.update',
                        fields: userFields.filter(x => !x.hidden).map(x => FieldInput(x))
                    })
                ]
            }),
            Page({
                title: 'Set Password',
                body: [
                    Form({
                        handler: 'user.setPassword',
                        fields: userFields.filter(x => x.slug === 'password').map(x => FieldInput(x))
                    })
                ]
            }),
        ]
    }

    async function Sidebar() {
        return `
            <div data-sidebar data-active="${sidebar}">
                <div data-sidebar-header>
                    <div data-sidebar-logo>
                        ${settings.logo ? `<img style="height: 24px" src="/files/${settings.logo}">` : ''}
                        ${settings.site_name || 'Site builder'}
                    </div>
                    <div data-theme-switch>
                        <svg data-action="set-theme" data-theme-light xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17q-2.075 0-3.537-1.463T7 12t1.463-3.537T12 7t3.538 1.463T17 12t-1.463 3.538T12 17m-7-4H1v-2h4zm18 0h-4v-2h4zM11 5V1h2v4zm0 18v-4h2v4zM6.4 7.75L3.875 5.325L5.3 3.85l2.4 2.5zm12.3 12.4l-2.425-2.525L17.6 16.25l2.525 2.425zM16.25 6.4l2.425-2.525L20.15 5.3l-2.5 2.4zM3.85 18.7l2.525-2.425L7.75 17.6l-2.425 2.525z"/></svg>
                        <svg data-action="set-theme" data-theme-dark xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21q-3.75 0-6.375-2.625T3 12t2.625-6.375T12 3q.35 0 .688.025t.662.075q-1.025.725-1.638 1.888T11.1 7.5q0 2.25 1.575 3.825T16.5 12.9q1.375 0 2.525-.613T20.9 10.65q.05.325.075.662T21 12q0 3.75-2.625 6.375T12 21"/></svg>
                    </div>
                </div>
                <div data-sidebar-items>
                    <div data-nested-sidebar ${!view ? 'data-active' : ''} ${view.startsWith('pages.') ? 'data-active' : ''}>
                        <div data-sidebar-toggler>
                            <svg data-sidebar-toggler-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M16 0H8C6.9 0 6 .9 6 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6zm4 18H8V2h7v5h5zM4 4v18h16v2H4c-1.1 0-2-.9-2-2V4z"/></svg>
                            <span data-sidebar-toggler-text>Pages</span>
                            <span data-sidebar-toggler-chevron>
                                <svg data-sidebar-toggler-icon-down xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"/></svg>
                                <svg data-sidebar-toggler-icon-up xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z"/></svg>
                            </span>
                        </div>
                        <div data-sidebar-menu>
                            ${await sidebarPages(pages, currentPage,{ permissions })}
                        </div>
                    </div>
                    <div data-nested-sidebar ${view.startsWith('blocks.') ? 'data-active' : ''}>
                        <div data-sidebar-toggler>
                            <svg data-sidebar-toggler-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 14 14"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M13.39 3a.47.47 0 0 0-.21-.16l-6-2.27a.45.45 0 0 0-.36 0l-6 2.31A.47.47 0 0 0 .61 3a.48.48 0 0 0-.11.3v7.32a.5.5 0 0 0 .32.46l6 2.31h.36l6-2.31a.5.5 0 0 0 .32-.46V3.34a.48.48 0 0 0-.11-.34Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M7 13.46V5.5m0 0v7.96M.61 3.04L7 5.5l6.39-2.46"/></svg>
                            <span data-sidebar-toggler-text>Blocks</span>
                            <span data-sidebar-toggler-chevron>
                                <svg data-sidebar-toggler-icon-down xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"/></svg>
                                <svg data-sidebar-toggler-icon-up xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z"/></svg>
                            </span>
                        </div>
                        <div data-sidebar-menu>
                            ${sidebarBlocks(query.id, { permissions })}
                        </div>
                    </div>
                    <div data-nested-sidebar ${view.startsWith('collections.') ? 'data-active' : ''}>
                        <div data-sidebar-toggler>
                            <svg data-sidebar-toggler-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.59 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4m6 14c0 .5-2.13 2-6 2s-6-1.5-6-2v-2.23c1.61.78 3.72 1.23 6 1.23s4.39-.45 6-1.23zm0-4.55c-1.3.95-3.58 1.55-6 1.55s-4.7-.6-6-1.55V9.64c1.47.83 3.61 1.36 6 1.36s4.53-.53 6-1.36zM12 9C8.13 9 6 7.5 6 7s2.13-2 6-2s6 1.5 6 2s-2.13 2-6 2"/></svg>    
                            <span data-sidebar-toggler-text>Collections</span>
                            <span data-sidebar-toggler-chevron>
                                <svg data-sidebar-toggler-icon-down xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"/></svg>
                                <svg data-sidebar-toggler-icon-up xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z"/></svg>
                            </span>
                        </div>
                        <div data-sidebar-menu>
                            ${sidebarCollections(collections, query.id, { permissions })}
                        </div>
                    </div>
                    <div data-nested-sidebar ${view.startsWith('settings.') ? 'data-active' : ''}>
                        <div data-sidebar-toggler>
                            <svg data-sidebar-toggler-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zM11 20h1.975l.35-2.65q.775-.2 1.438-.587t1.212-.938l2.475 1.025l.975-1.7l-2.15-1.625q.125-.35.175-.737T17.5 12t-.05-.787t-.175-.738l2.15-1.625l-.975-1.7l-2.475 1.05q-.55-.575-1.212-.962t-1.438-.588L13 4h-1.975l-.35 2.65q-.775.2-1.437.588t-1.213.937L5.55 7.15l-.975 1.7l2.15 1.6q-.125.375-.175.75t-.05.8q0 .4.05.775t.175.75l-2.15 1.625l.975 1.7l2.475-1.05q.55.575 1.213.963t1.437.587zm1.05-4.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5M12 12"/></svg>    
                            <span data-sidebar-toggler-text>Settings</span>
                            <span data-sidebar-toggler-chevron>
                                <svg data-sidebar-toggler-icon-down xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"/></svg>
                                <svg data-sidebar-toggler-icon-up xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z"/></svg>
                            </span>
                        </div>
                        <div data-sidebar-menu>
                            ${sidebarSettings(view)}
                        </div>
                    </div>
                </div>

                <div data-page-edit-sidebar ${view === 'iframe' ? 'data-active': ''}>
                    <div data-name="sidebar-add-block">
                        ${sidebarContent}
                    </div>
                    <div data-name="sidebar-module-settings" style="display: none">
                    </div>
                </div>
            </div>
        `
    }

    if (mode === 'edit') {
        return `
            <div data-body>
                ${await Sidebar()}
                <div data-main>
                    ${content}
                </div>
            </div>
            
            ${DeleteConfirm()}
            ${RelationFieldModal()}
            ${UpdateModuleAiModal({ id: null })}
            ${CreateModuleAiModal({ id: null })}
            <script src="/js/sortable.min.js"></script>
            <script src="/js/quill.library.js"></script>
            <script type="module" src="/js/sitebuilder.edit.js"></script>
        `
    }

    let previewContent = ''

    if (mode === 'preview') {

        previewContent = `
            <div data-last-section>
                ${Button({
            text: 'Add Section', color: 'primary', action: 'add-section', dataset: {
                order: (body.length + 1) ?? 1
            }
        })}
            </div>
        `
    }

    if (mode === 'view') {
        previewContent = '<script src="/js/sitebuilder.view.js"></script>'
    }

    if (mode === 'preview') {
        previewContent += `<script type="module" src="/js/sitebuilder.preview.js"></script>`
    }

    const request = {
        query,
        params
    }

    return `<div data-body data-page-id="${currentPage.id}">
        ${(await Promise.all(body.map(x => renderModule(x, { props, mode, definitions, permissions, request })))).join('')}
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
    const id = Math.random()
    console.time('page request ' + req.url + ' ' + id)
    const { page, params } = await getPage(req.params[0])
    const mode = req.query.mode ?? 'view'
    const view = req.query.view ?? ''

    let props = {}
    props.settings = await db('settings').query().first() ?? {}

    let stylesheet;
    if (mode === 'edit') {
        stylesheet = '<link rel="stylesheet" href="/css/sitebuilder.edit.css">'
    } else if (mode === 'preview') {
        stylesheet = '<link rel="stylesheet" href="/css/sitebuilder.preview.css">'
    } else if (mode === 'view') {
        stylesheet = '<link rel="stylesheet" href="/css/sitebuilder.view.css">'

    }
    if (mode === 'edit' || mode === 'preview') {
        stylesheet += `
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
        `

        stylesheet += `
            <link rel="stylesheet" href="/css/components/quill.snow.css">
        `
    }


    if (!page) {
        if (mode == 'edit') {

            const html = layouts.default({
                head: stylesheet,
                body: await renderBody([], { ...req.query, mode, url: req.url, view }),
                title: 'Untitled',
                theme: 'dark'
            })

            return res.send(html)
        } else {
            return res.send('404');
        }
    }

    if (page.dynamic) {
        props.params = params
        if (page.collectionId) {
            let collection = await db('collections').query().filter('id', '=', page.collectionId).first()
            let query = db('contents').query().filter('_type', '=', page.collectionId)
            for (let param in params) {
                query = query.filter(param, '=', params[param])
            }

            props.pageContent = await query.first()
            props.pageContent = await normalizeCollectionContent(collection, props.pageContent);
            console.log(props)
            props.collection = collection
        }
    }

    let { head } = page;
    let modules = await getPageModules(page.id)

    page.lang ??= 'en'
    page.dir ??= 'ltr'

    const seo = {}
    for (let key in page.seo) {
        seo[key] = hbs.compile(page.seo[key])({ ...props, content: props.pageContent, pageContent: undefined })
    }

    const tailwind = JSON.stringify({ darkMode: 'class' })

    const html = layouts.default({
        head: (head ?? '') + (stylesheet ?? ''),
        body: await renderBody(modules, { ...req.query, props, params, mode, url: req.url, view }),
        theme: 'dark',
        tailwind,
        script: page.script,
        style: page.style,
        dir: page.dir,
        lang: page.lang,
        include_site_head: page.include_site_head,
        seo,
        settings: await db('settings').query().first() ?? {}
    })

    console.timeEnd('page request ' + req.url + ' ' + id)
    res.send(html)
}