import { Button } from "#components"
import { db } from "#services"
import { html } from "svelite-html"
import { getPage, getPageSlug, getUrl } from "#helpers"

async function sidebarBlocks({ query, permissions }) {
    const blocks = (await db('blocks').query().all()).filter(x => !['Section', 'Columns', 'RichText'].includes(x.name))
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

            ${permissions.collection_create ? `<a data-enhance href="${getUrl({ view: 'collections.create' })}" data-sidebar-item-button>
                <svg data-sidebar-item-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                Create Collection
            </a>` : ''}
            
        </div>
    `
}

async function sidebarSettings({view, permissions}) {
    return permissions.settings_general || permissions.users || permissions.roles ? `
        <div data-sidebar-body>
            ${permissions.settings_general ? `<a data-enhance data-sidebar-item ${view.startsWith('settings.general') ? 'data-active' : ''} href="${getUrl({ view: 'settings.general' })}">General</a>` : ''}
            ${permissions.users ? `<a data-enhance data-sidebar-item ${view.startsWith('settings.users') ? 'data-active' : ''} href="${getUrl({ view: 'settings.users.list' })}">Users</a>` : ''}
            ${permissions.roles ? `<a data-enhance data-sidebar-item ${view.startsWith('settings.roles') ? 'data-active' : ''} href="${getUrl({ view: 'settings.roles.list' })}">Roles</a>` : ''}
            ${permissions.settings_appearance ? `<a data-enhance data-sidebar-item ${view.startsWith('settings.appearance') ? 'data-active' : ''} href="${getUrl({ view: 'settings.appearance' })}">Appearance (Soon)</a>` : ''}
            ${permissions.settings ? `<a data-enhance data-sidebar-item ${view.startsWith('settings.profile') ? 'data-active' : ''} href="${getUrl({ view: 'settings.profile' })}">Profile (Soon)</a>` : ''}
        </div>
    ` : ''
}

async function sidebarPages({ url, permissions }) {
    const pages = await db('pages').query().all()
    const {page: currentPage} = await getPage(url.split('?')[0])
    return `
        <div data-sidebar-body>
            ${await Promise.all(pages.map(async x => `
                <div data-sidebar-item ${currentPage?.id === x.id ? 'data-active' : ''} data-sidebar-page-item data-action="navigation.link" data-href="?view=pages.edit&slug=${encodeURIComponent(await getPageSlug(x))}">
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

function SidebarItem({title, active, href, items, icon}) {
    if(href) {
        return `
            <div data-sidebar-item-wrapper>
                <a data-enhance href="${href}" data-sidebar-item  ${active ? 'data-active' : ''}>
                    ${icon}
                    <span data-sidebar-toggler-text>${title}</span>
                </a>
            </div>
        `
    }

    return `
        <div data-nested-sidebar ${active ? 'data-active' : ''}>
            <div data-sidebar-toggler>
                ${icon}
                <span data-sidebar-toggler-text>${title}</span>
                <span data-sidebar-toggler-chevron>
                    <svg data-sidebar-toggler-icon-down xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"/></svg>
                    <svg data-sidebar-toggler-icon-up xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z"/></svg>
                </span>
            </div>
            <div data-sidebar-menu>
                ${items}
            </div>
        </div>
    `
}

function SidebarItems(body) {
    return html`<div data-sidebar-items>${body}</div>`
}

export async function Sidebar({query, url, view, permissions, config, context}) {
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

    async function sidebarFooter() {
        const profile = context.user

        if(!profile) return ''

        return `
            <a href="${getUrl({view: 'settings.profile'})}" data-sidebar-footer>
                ${profile.profile ? `<img data-avatar src="/files/${profile.profile}" alt="Avatar">` : `<span data-avatar>${profile.name[0].toUpperCase()}</span>`}
                
                <div data-sidebar-footer-center>
                    <div style="font-weight: bold;">${profile.name}</div>
                    <div style="opacity: 0.7;">@${profile.username}</div>
                </div>
                <div data-sidebar-footer-chevron>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12.6 12L8 7.4L9.4 6l6 6l-6 6L8 16.6z"/></svg>
                </div>
            </a>
        `
    }

    async function sidebarItems() {
        let result = []
        for(let item of config) {
            let items;
            if(item.dynamic) {
                if(item.items === 'pages') {
                    items = await sidebarPages({url, permissions})
                } else if(item.items === 'collections') {
                    items = await sidebarCollections({ query, permissions })
                } else if(item.items === 'blocks') {
                    items = await sidebarBlocks({ query, permissions })
                } else if(item.items === 'settings') {
                    items = await sidebarSettings({ view, permissions })
                }
            } else {
                items = item.items
            }

            result.push({
                href: item.href,
                icon: item.icon,
                items,
                title: item.title,
                active: item.href ? item.href === getUrl({view, ...query}) : view.startsWith(item.viewPrefix)
            })
        }
        return SidebarItems(result.map(SidebarItem))
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

    if(!context.user) return '';

    return `
        <div data-sidebar data-active="${mode}">
            ${sidebarHeader()}
            ${await sidebarItems()}
            ${await sidebarFooter()}
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
            ${await sidebarFooter()}
        </div>
        <div data-sidebar-offcanvas-backdrop></div>

    `
}

async function BlockList() {
    const blocks = (await db('blocks').query().all()).filter(x => !['Section', 'Columns'].includes(x.name))

    return `
        <div data-blocks>
            <span data-alert>
                <svg class="margin-right: 0.5rem" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/></svg>
                <span>Drag and drop blocks to page!</span>
            </span>
            
            ${blocks.map(x => `<div data-block-module data-block-id="${x.id}">
                <span>${x.name}</span>
            </div>`).join('')}
        </div>
    `
}