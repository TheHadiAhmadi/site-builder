import hbs from 'handlebars'
import './handlebars.js'
import { Button, DeleteConfirm, EmptyTable, Page } from '#components'
import { join } from 'path'

import { db } from "#services";
import layouts from "./layouts.js";
import { CollectionCreatePage, CollectionDataCreatePage, CollectionDataListPage, CollectionDataUpdatePage, CollectionUpdatePage, RelationFieldModal } from './pages/collections.js';
import { PageCreatePage, PageUpdatePage } from './pages/pages.js';
import {PageEditorPage} from './pages/editor.js'
import { normalizeCollectionContent, renderModule } from './renderModule.js';
import { getPage, getPageSlug, getUrl } from "#helpers";
import { UserCreatePage, UserListPage, UserUpdatePage } from './pages/users.js';
import { SettingsAppearancePage, SettingsGeneralPage, SettingsProfilePage } from './pages/settings.js';
import { BlockCreatePage, BlockUpdatePage, CreateBlockAiModal, UpdateBlockAiModal } from './pages/blocks.js';
import { Sidebar } from './pages/sidebar.js';
import { RoleCreatePage, RoleListPage, RoleUpdatePage } from './pages/roles.js';
import { constants } from 'http2';
import { FunctionListPage } from './pages/functions.js';

let definitions = {}

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

export async function handleModuleAction({ module, method, body }) {
    const definition = definitions[module.definitionId]
    let res;

    if (definition.actions && definition.actions[method]) {
        res = await definition.actions[method](body)
    }

    return res;
}

function DashboardPage() {
    return Page({
        title: 'Dashboard',
        body: '<div data-alert>Welcome!</div>'
    })
}
const pages = {
    'dashboard': [DashboardPage, []],
    'pages.edit' : [PageEditorPage, ['pages']],
    'iframe': [PageEditorPage, ['page_content', 'page_update']],
    'pages.create': [PageCreatePage, ['page_create']],
    'pages.update': [PageUpdatePage, ['page_update', 'page_seo']],
    'blocks.create': [BlockCreatePage, ['block_create']],
    'blocks.update': [BlockUpdatePage, ['block_update', 'block_delete']],
    'collections.create': [CollectionCreatePage, ['collection_create']],
    'functions.list': [FunctionListPage, ['functions']],
    'collections.update': [CollectionUpdatePage, ['collection_update']],
    'collections.data.list': [CollectionDataListPage, ['collections', 'collections_sidebar']],
    'collections.data.create': [CollectionDataCreatePage, ['content_create']],
    'collections.data.update': [CollectionDataUpdatePage, ['content_update', 'content_delete']],
    'settings.general': [SettingsGeneralPage, ['settings_general']],
    'settings.appearance': [SettingsAppearancePage, ['settings_appearance']],
    'settings.profile': [SettingsProfilePage, ['settings_profile']],
    'settings.users.list': [UserListPage, ['users']],
    'settings.users.create': [UserCreatePage, ['users']],
    'settings.users.update': [UserUpdatePage, ['users']],
    'settings.roles.list': [RoleListPage, ['roles']],
    'settings.roles.create': [RoleCreatePage, ['roles']],
    'settings.roles.update': [RoleUpdatePage, ['roles']],
}
//#region Render body
export async function renderBody(body, { props, mode, url, view, context, params, ...query }) {
    let permissions = context.permissions 
    let functions = context.functions 

    const collections = await db('collections').query().all().then(res => res.filter(x => x.sidebar))

    const sidebar = [
        permissions.pages && {
            title: 'Pages', 
            icon: '<svg data-sidebar-toggler-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M16 0H8C6.9 0 6 .9 6 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6zm4 18H8V2h7v5h5zM4 4v18h16v2H4c-1.1 0-2-.9-2-2V4z"/></svg>',
            dynamic: true,
            viewPrefix: 'pages.',
            items: 'pages'
        },
        permissions.blocks && {
            title: 'Blocks', 
            icon: '<svg data-sidebar-toggler-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 14 14"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M13.39 3a.47.47 0 0 0-.21-.16l-6-2.27a.45.45 0 0 0-.36 0l-6 2.31A.47.47 0 0 0 .61 3a.48.48 0 0 0-.11.3v7.32a.5.5 0 0 0 .32.46l6 2.31h.36l6-2.31a.5.5 0 0 0 .32-.46V3.34a.48.48 0 0 0-.11-.34Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M7 13.46V5.5m0 0v7.96M.61 3.04L7 5.5l6.39-2.46"/></svg>',
            dynamic: true,
            viewPrefix: 'blocks.',
            items: 'blocks'
        },
        permissions.functions && {
            title: 'Functions', 
            icon: '<svg data-sidebar-toggler-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m10.55 18.2l5.175-6.2h-4l.725-5.675L7.825 13H11.3zM8 22l1-7H4l9-13h2l-1 8h6L10 22zm3.775-9.75"/></svg>',
            href: getUrl({view: 'functions.list'}),
            viewPrefix: 'functions.',
        },
        permissions.collections && {
            title: 'Collections', 
            icon: '<svg data-sidebar-toggler-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.59 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4m6 14c0 .5-2.13 2-6 2s-6-1.5-6-2v-2.23c1.61.78 3.72 1.23 6 1.23s4.39-.45 6-1.23zm0-4.55c-1.3.95-3.58 1.55-6 1.55s-4.7-.6-6-1.55V9.64c1.47.83 3.61 1.36 6 1.36s4.53-.53 6-1.36zM12 9C8.13 9 6 7.5 6 7s2.13-2 6-2s6 1.5 6 2s-2.13 2-6 2"/></svg>',
            dynamic: true,
            viewPrefix: 'collections.',
            items: 'collections'
        },
        ...((permissions.collections_sidebar && !permissions.collections) ? collections.map(collection => {
            return {
                title: collection.name,
                icon: '<svg data-sidebar-toggler-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.59 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4m6 14c0 .5-2.13 2-6 2s-6-1.5-6-2v-2.23c1.61.78 3.72 1.23 6 1.23s4.39-.45 6-1.23zm0-4.55c-1.3.95-3.58 1.55-6 1.55s-4.7-.6-6-1.55V9.64c1.47.83 3.61 1.36 6 1.36s4.53-.53 6-1.36zM12 9C8.13 9 6 7.5 6 7s2.13-2 6-2s6 1.5 6 2s-2.13 2-6 2"/></svg>',
                href: getUrl({
                    view: 'collections.data.list',
                    id: collection.id,
                })
            }
        }) : []),
        permissions.settings_general && {
            title: 'Settings', 
            icon: '<svg data-sidebar-toggler-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zM11 20h1.975l.35-2.65q.775-.2 1.438-.587t1.212-.938l2.475 1.025l.975-1.7l-2.15-1.625q.125-.35.175-.737T17.5 12t-.05-.787t-.175-.738l2.15-1.625l-.975-1.7l-2.475 1.05q-.55-.575-1.212-.962t-1.438-.588L13 4h-1.975l-.35 2.65q-.775.2-1.437.588t-1.213.937L5.55 7.15l-.975 1.7l2.15 1.6q-.125.375-.175.75t-.05.8q0 .4.05.775t.175.75l-2.15 1.625l.975 1.7l2.475-1.05q.55.575 1.213.963t1.437.587zm1.05-4.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5M12 12"/></svg>',
            active: view.startsWith('settings.'),
            dynamic: true,
            viewPrefix: 'settings.',
            items: 'settings'
        },
    ].filter(Boolean)

    await loadModuleDefinitions()

    // let {page} = await getPage(url.split('?')[0])
    // if (!page && view === 'iframe') view = 'pages.create'
    if(mode === 'edit' && !view) view = 'dashboard'

    let pageContent;

    try {
        if(!pages[view]) {
            pageContent = Page({
                body: EmptyTable({title: "Page Not found!", description: "This page doesn't exists", body: [
                    Button({href: '/admin', text: "Go Home", color: 'primary'})
                ]})
            })
        } else {
            const [page, pagePermissions] = pages[view] 
            let access = false
            if(pagePermissions.length == 0) access = true
            for(let permission of pagePermissions) {
                if(permissions[permission]) {
                    access = true
                }
            }
            if(access) {
                pageContent = await page({query, view, url, permissions, context, functions})
            } else {
                pageContent = Page({
                    body: EmptyTable({title: "No Access!", description: "You don't have access to this page!", body: [
                        Button({href: '/admin', text: "Go Home", color: 'primary'})
                    ]})
                })
            }
        }
    } catch(err) {
        console.log(err)
        pageContent = Page({ 
            body: EmptyTable({title: "Something went wrong!", description: "there was an error while processing your request.", body: [
                Button({href: '/admin', text: "Go Home", color: 'primary'})
            ]})
        })
    }

    if (mode === 'edit') {
        return `
            <div data-body>
                ${await Sidebar({permissions, view, url, query, context, config: sidebar})}
                <div data-main>
                    ${pageContent}
                </div>
            </div>
            
            ${DeleteConfirm()}
            ${RelationFieldModal()}
            ${UpdateBlockAiModal({ id: null })}
            ${CreateBlockAiModal({ id: null })}
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

    return `
        <div data-body>
            ${(await Promise.all(body.map(x => renderModule(x, { props, mode, definitions, permissions, request })))).join('')}
            ${previewContent}
        </div>
    `
}
//#endregion
