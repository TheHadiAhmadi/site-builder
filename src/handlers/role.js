import { db } from "#services"
import { DataTable, getDataTableItems } from "../pages/dataTable.js"

export const roleFields = [
    {
        slug: 'name',
        label: 'Name',
        type: 'input',
        default: true,
    },
    {
        slug: 'slug',
        label: 'Slug',
        type: 'input',
        hidden: true,
    },
    {
        slug: 'permissions',
        label: 'permissions',
        type: 'select',
        multiple: true,
        items: [
            {
                text: 'Collections',
                value: 'collections'
            },
            {
                text: 'Sidebar Collections',
                value: 'collections_sidebar'
            },
            {
                text: 'Create Collection',
                value: 'collection_create'
            },
            {
                text: 'Update Collection',
                value: 'collection_update'
            },
            {
                text: 'Delete Collection',
                value: 'collection_delete'
            },
            {
                text: 'Pages',
                value: 'pages'
            },
            {
                text: 'Create Page',
                value: 'page_create'
            },
            {
                text: 'Update Page',
                value: 'page_update'
            },
            {
                text: 'Update Page SEO',
                value: 'page_seo'
            },
            {
                text: 'Update Page Content',
                value: 'page_content'
            },
            {
                text: 'Delete Page',
                value: 'page_delete'
            },
            {
                text: 'Functions',
                value: 'functions'
            },
                {
                text: 'Blocks',
                value: 'blocks'
            },
            {
                text: 'Create Block',
                value: 'block_create'
            },
            {
                text: 'Update Block',
                value: 'block_update'
            },
            {
                text: 'Update Block AI',
                value: 'block_update_ai'
            },
            {
                text: 'Create Block AI',
                value: 'block_create_ai'
            },
            {
                text: 'Delete Block',
                value: 'block_delete'
            },
            {
                text: 'General Settings',
                value: 'settings_general'
            },
            {
                text: 'Users',
                value: 'users'
            },
            {
                text: 'Roles',
                value: 'roles'
            },
            {
                text: 'Appearance',
                value: 'settings_appearance'
            },
            {
                text: 'Create content',
                value: 'content_create'
            },
            {
                text: 'Update content',
                value: 'content_update'
            },
            {
                text: 'Delete content',
                value: 'content_delete'
            },
            {
                text: 'Edit profile',
                value: 'settings_profile'
            },
        ]
    }
]

const roleTableFields = roleFields.filter(x => x.slug !== 'permissions')

export async function RolesDataTable({filters = [], perPage = 10, page = 1, selectable = false} = {}) {
    const query = db('roles').query()

    const items = await getDataTableItems({
        page, 
        perPage, 
        query, 
        fields: roleTableFields, 
        filters, 
        expandRelations: true
    })

    return DataTable({
        selectable, 
        filters, 
        handler: 'role.loadTable', 
        fields: roleTableFields, 
        items,
        actions: [
            { 
                icon: true,
                text: `<svg data-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h8.925l-2 2H5v14h14v-6.95l2-2V19q0 .825-.587 1.413T19 21zm4-6v-4.25l9.175-9.175q.3-.3.675-.45t.75-.15q.4 0 .763.15t.662.45L22.425 3q.275.3.425.663T23 4.4t-.137.738t-.438.662L13.25 15zM21.025 4.4l-1.4-1.4zM11 13h1.4l5.8-5.8l-.7-.7l-.725-.7L11 11.575zm6.5-6.5l-.725-.7zl.7.7z"/></svg>`, 
                color: 'primary', 
                action: `open-role-edit`
            },
            { icon: true, text: `<svg data-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"/></svg>`, color: 'danger', action: 'open-role-delete' },
        ]
    })

}

export default {
    async insert(body) {
        body.permissions ??= []
        await db('roles').insert(body)

        return {
            redirect: '?view=settings.roles.list'
        }
    },
    async update(body) {
        await db('roles').update(body)
    },
    async loadTable(body) {
        return RolesDataTable(body)
    },
    async delete(body) {
        await db('roles').remove(body.id)

        return {reload: true}
    },
    async load(body) {
        const role = await db('roles').query().filter('id', '=', body.id).first()

        return role;
    }
    
}