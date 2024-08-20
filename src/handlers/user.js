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
        slug: 'password',
        label: 'Password',
        type: 'input',
        hidden: true,
    },
]

export async function UsersDataTable({filters = [], perPage = 10, page = 1, selectable = false} = {}) {
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
        actions: [
            { text: 'edit', color: 'primary', href: `?mode=edit&view=user-add` },
            { text: 'delete', color: 'danger', action: 'user.delete' },
        ]
    })

}

export default {
    async insert(body) {
        body.password = hashPassword(body.password)

        await db('users').insert(body)
    },
    async update(body) {
        delete body.password

        await db('users').insert(body)
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
    }
    
}