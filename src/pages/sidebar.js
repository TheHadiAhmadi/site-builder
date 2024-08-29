import { Button } from "#components"
import { db } from "#services"
import { getPage, getPageSlug, getUrl } from "../helpers.js"

async function sidebarBlocks({ query, permissions }) {
    // const modules = Object.keys(definitions).map(key => definitions[key]).filter(x => !['Section', 'Columns', 'RichText'].includes(x.name))
    const blocks = (await db('definitions').query().all()).filter(x => !['Section', 'Columns', 'RichText'].includes(x.name))
    return `
            <div data-sidebar-body>
                ${blocks.map(x => `<a href="${getUrl({ view: 'blocks.update', id: x.id })}" data-sidebar-item ${query.id === x.id ? 'data-active' : ''}>
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

async function sidebarCollections({ query, permissions }) {
    const collections = await db('collections').query().all()
    return `
        <div data-sidebar-body>
            ${collections.map(x => `
                <div data-sidebar-item ${query.id === x.id ? 'data-active' : ''} data-action="navigation.link" data-href="${getUrl({ view: 'collections.data.list', id: x.id })}">
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

async function sidebarSettings({view}) {
    return `
        <div data-sidebar-body>
            <a data-enhance data-sidebar-item ${view.startsWith('settings.general') ? 'data-active' : ''} href="${getUrl({ view: 'settings.general' })}">General</a>
            <a data-enhance data-sidebar-item ${view.startsWith('settings.users') ? 'data-active' : ''} href="${getUrl({ view: 'settings.users.list' })}">Users</a>
            <a data-enhance data-sidebar-item ${view.startsWith('settings.appearance') ? 'data-active' : ''} href="${getUrl({ view: 'settings.appearance' })}">Appearance (Soon)</a>
            <a data-enhance data-sidebar-item ${view.startsWith('settings.profile') ? 'data-active' : ''} href="${getUrl({ view: 'settings.profile' })}">Profile (Soon)</a>
        </div>
    `
}

async function sidebarPages({ url, permissions }) {
    const pages = await db('pages').query().all()
    const {page: currentPage} = await getPage(url.split('?')[0])
    return `
        <div data-sidebar-body>
            
            ${await Promise.all(pages.map(async x => `
                <div data-sidebar-item ${currentPage?.id === x.id ? 'data-active' : ''} data-sidebar-page-item data-action="navigation.link" data-href="${await getPageSlug(x)}?mode=edit">
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

export async function Sidebar({query, url, view, permissions}) {
    const settings = await db('settings').query().first() ?? {}
    const mode = (view === 'iframe' || !view) ? 'modules' : ''

    function logo() {
        return `
            <div data-sidebar-logo>
                ${settings.logo ? `<img style="height: 24px" src="/files/${settings.logo}">` : ''}
                ${settings.site_name || 'Site builder'}
            </div>
        `
    }

    function themeSwitcher() {
        return `
            <div data-theme-switch>
                <svg data-action="set-theme" data-theme-light xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17q-2.075 0-3.537-1.463T7 12t1.463-3.537T12 7t3.538 1.463T17 12t-1.463 3.538T12 17m-7-4H1v-2h4zm18 0h-4v-2h4zM11 5V1h2v4zm0 18v-4h2v4zM6.4 7.75L3.875 5.325L5.3 3.85l2.4 2.5zm12.3 12.4l-2.425-2.525L17.6 16.25l2.525 2.425zM16.25 6.4l2.425-2.525L20.15 5.3l-2.5 2.4zM3.85 18.7l2.525-2.425L7.75 17.6l-2.425 2.525z"/></svg>
                <svg data-action="set-theme" data-theme-dark xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21q-3.75 0-6.375-2.625T3 12t2.625-6.375T12 3q.35 0 .688.025t.662.075q-1.025.725-1.638 1.888T11.1 7.5q0 2.25 1.575 3.825T16.5 12.9q1.375 0 2.525-.613T20.9 10.65q.05.325.075.662T21 12q0 3.75-2.625 6.375T12 21"/></svg>
            </div>
        `
    }

    function sidebarHeader() {
        return `
            <div data-sidebar-header>
                ${logo()}
                ${themeSwitcher()}
            </div>
        `
    }

    async function sidebarItems() {
        return `
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
                        ${await sidebarPages({ url, permissions })}
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
                        ${await sidebarBlocks({ query, permissions })}
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
                        ${await sidebarCollections({ query, permissions })}
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
                        ${await sidebarSettings({view})}
                    </div>
                </div>
            </div>
        `
    }

    async function pageEditorSidebar() {
        if(view === 'iframe') {
            return `
                <div data-page-edit-sidebar>
                    <div data-hide-desktop style="color: var(--sidebar-color); margin-bottom: 0.5rem; align-items: center; justify-content: space-between">
                    <div style="font-weight: bold; font-size: 18px; margin-left: 8px;">
                        <span data-sidebar-title-name-blocks>Blocks</span>
                        <span data-sidebar-title-name-settings>Block Settings</span>
                    </div>
                    ${Button({
                        icon: true,
                        ghost: true,
                        text: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m13.41 12l4.3-4.29a1 1 0 1 0-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 0 0-1.42 1.42l4.3 4.29l-4.3 4.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l4.29-4.3l4.29 4.3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42Z"/></svg>',
                        action: 'hide-block-list',
                        dataset: {
                            'hide-desktop': true,
                            
                        }
                    })}
                </div>
                    <div data-name="sidebar-add-block">
                        ${await BlockList()}
                    </div>
                    <div data-name="sidebar-module-settings">
                    </div>
                </div>
            `
        }
        return ''
    }

    return `
        <div data-sidebar data-active="${mode}">
            ${sidebarHeader()}
            ${await sidebarItems()}
        </div>
        ${await pageEditorSidebar()}
        <div data-sidebar-mobile>
            <div data-sidebar-mobile-start>
                ${Button({action: 'toggle-sidebar', icon: true, ghost: true, text: '<svg data-sidebar-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M4 18q-.425 0-.712-.288T3 17t.288-.712T4 16h16q.425 0 .713.288T21 17t-.288.713T20 18zm0-5q-.425 0-.712-.288T3 12t.288-.712T4 11h16q.425 0 .713.288T21 12t-.288.713T20 13zm0-5q-.425 0-.712-.288T3 7t.288-.712T4 6h16q.425 0 .713.288T21 7t-.288.713T20 8z"/></svg>'})}
                ${logo()}
            </div>
            <div data-sidebar-mobile-end>
                ${Button({icon: true, ghost: true, text: themeSwitcher()})}
            </div>
        </div>

        <div data-sidebar-offcanvas>
            ${await sidebarItems()}
            
        </div>
        <div data-sidebar-offcanvas-backdrop></div>
    `
}

async function BlockList() {
    const blocks = (await db('definitions').query().all()).filter(x => !['Section', 'Columns'].includes(x.name))

    return `
        <div data-definitions>
            <span data-alert>
                <svg class="margin-right: 0.5rem" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/></svg>
                <span>Drag and drop blocks to page!</span>
            </span>
            
            ${blocks.map(x => `<div data-definition-module data-definition-id="${x.id}">
                <span>${x.name}</span>
            </div>`).join('')}
        </div>
    `
}