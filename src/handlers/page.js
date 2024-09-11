import { getPageSlug, getUrl } from "#helpers"
import { db } from "#services"
import { DataTable, getDataTableItems } from "../pages/dataTable.js"

const pageListFields = [
    { label: "Name", slug: "name", type: 'input', default: true, },
    { label: "Slug", slug: "slug", type: 'input', default: true },
    { label: "Dynamic", slug: "dynamic", type: 'checkbox' },
    { label: "Collection", slug: "collectionId", type: 'collection' }
]

export async function PagesDataTable({page = 1, perPage = 10, filters = [], selectable = false}) {
    const query = db('pages').query()

    const items = await getDataTableItems({
        page, 
        perPage, 
        query, 
        fields: pageListFields, 
        filters, 
        expandRelations: true
    })

    return DataTable({
        selectable, 
        filters, 
        handler: 'page.loadTable', 
        fields: pageListFields, 
        items,
        actions(item) {
            return [
                { 
                    href: getUrl({view: 'iframe', id: item.id, contentId: ''}),
                    text: `<svg data-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h8.925l-2 2H5v14h14v-6.95l2-2V19q0 .825-.587 1.413T19 21zm4-6v-4.25l9.175-9.175q.3-.3.675-.45t.75-.15q.4 0 .763.15t.662.45L22.425 3q.275.3.425.663T23 4.4t-.137.738t-.438.662L13.25 15zM21.025 4.4l-1.4-1.4zM11 13h1.4l5.8-5.8l-.7-.7l-.725-.7L11 11.575zm6.5-6.5l-.725-.7zl.7.7z"/></svg>`, 
                    action: `open-page-edit`
                },
                { 
                    href: getUrl({view: 'pages.update', id: item.id, back: encodeURIComponent(getUrl({view: 'pages.list'}))}),
                    text: `<svg data-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>`, 
                    color: 'primary', 
                    action: `open-page-settings`
                },
                { 
                    text: `<svg data-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"/></svg>`, 
                    color: 'danger', 
                    action: 'open-page-delete'
                },
            ]
        }
    })

}

export default {
    async create(body) {
        // body.settings ??= []
        // body.contentType ??= []
        if(!body.slug.startsWith('/')) {
            body.slug = '/' + body.slug
        }
        await db('pages').insert(body)

        return {
            redirect: '/admin?view=pages.edit&slug=' + encodeURIComponent(body.slug)
        }        
    },
    async load(body) {
        return db('pages').query().filter('id', '=', body.id).first()
    },
    async update(body) {
        if(!body.slug.startsWith('/')) {
            body.slug = '/' + body.slug
        }

        await db('pages').update(body)
        return {
            pageReload: true
        }
    },
    async delete(body) {
        async function deleteModule(module) {
            const modules = await db('modules').query().filter('moduleId', '=', module.id).all()
            for(let mod of modules) {
                await deleteModule(mod)
            }
            await db('modules').remove(module.id)
        }

        await db('pages').remove(body.id)
        const modules = await db('modules').query().filter('pageId', '=', 'id').all()
        for(let module of modules) {
            deleteModule(module)
        }
        return {
            redirect: '/admin'
        }
    },
    async loadTable(body) {
        return PagesDataTable(body)
    }
}