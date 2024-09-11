import { getUrl } from "#helpers"
import { db } from "#services"
import { DataTable, getDataTableItems } from "../pages/dataTable.js"

function hashPassword(string) {
    return `_%${string}%_`
}

export const userFields = [
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
        slug: 'username',
        label: 'Username',
        type: 'input',
    },
    {
        slug: 'profile',
        label: 'Profile image',
        type: 'file',
        file_type: 'image',
        multiple: false
    },
    {
        slug: 'email',
        label: 'Email',
        type: 'input',
    },   
    {
        slug: 'role',
        label: 'Role',
        type: 'select',
        items: []
    },   
    {
        slug: 'password',
        label: 'Password',
        type: 'input',
        hidden: true,
        input_type: 'password'
    },
]

export async function UsersDataTable({filters = [], perPage = 10, page = 1, selectable = false} = {}) {
    const roles = await db('roles').query().all()

    for(let field of userFields) {
        if(field.slug === 'role') {
            field.items = roles.map(x => ({text: x.name, value: x.id}))
        }
    }
    const query = db('users').query()

    const items = await getDataTableItems({
        page, 
        perPage, 
        query, 
        fields: userFields, 
        filters, 
        expandRelations: true
    })

    return DataTable({
        selectable, 
        filters, 
        handler: 'user.loadTable', 
        fields: userFields, 
        items,
        actions(item) {
            return [
                { 
                    text: `<svg data-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h8.925l-2 2H5v14h14v-6.95l2-2V19q0 .825-.587 1.413T19 21zm4-6v-4.25l9.175-9.175q.3-.3.675-.45t.75-.15q.4 0 .763.15t.662.45L22.425 3q.275.3.425.663T23 4.4t-.137.738t-.438.662L13.25 15zM21.025 4.4l-1.4-1.4zM11 13h1.4l5.8-5.8l-.7-.7l-.725-.7L11 11.575zm6.5-6.5l-.725-.7zl.7.7z"/></svg>`, 
                    color: 'primary', 
                    href: getUrl({view: 'settings.users.update', id: item.id})
                },
                { 
                    text: `<svg data-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"/></svg>`, 
                    color: 'danger', 
                    dataset: {
                        id: item.id
                    },
                    action: 'open-user-delete' 
                },
            ]
        }
    })

}

export default {
    async insert(body) {
        body.password = hashPassword(body.password)

        await db('users').insert(body)

        return {
            redirect: '?view=settings.users.list'
        }
    },
    async update(body) {
        delete body.password

        await db('users').update(body)
    },
    async setPassword(body) {
        body.password = hashPassword(body.password)

        await db('users').update({
            id: body.id,
            password: body.password
        })
    },
    async loadTable(body) {
        
        return UsersDataTable(body)
    },
    async delete(body) {
        await db('users').remove(body.id)

        return {reload: true}
    },
    async load(body) {
        const user = await db('users').query().filter('id', '=', body.id).first()

        delete user.password
        return user;
    }
    
}