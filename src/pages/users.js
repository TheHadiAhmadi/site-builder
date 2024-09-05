import { Button, Form, Page } from "#components";
import { db } from "#services";
import { userFields, UsersDataTable } from "../handlers/user.js";
import { getUrl } from "#helpers";
import { FieldInput } from "./collections.js";

export async function UserListPage() {
    return Page({
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
}

export async function UserCreatePage() {
    const roles = await db('roles').query().all()
    return Page({
        title: 'Add User',
        back: '?view=settings.users.list',
        body: [
            Form({
                handler: 'user.insert',
                cancelHref: '?view=settings.users.list',
                fields: userFields.filter(x => !x.hidden || x.slug === 'password').map(x => FieldInput(x))
            })
        ]
    })
}

export async function UserUpdatePage({query}) {
    const roles = await db('roles').query().all()
    for(let field of userFields) {
        if(field.slug === 'role') {
            field.items = roles.map(x =>({text: x.name, value: x.id}))
        }
    }
    return [
        Page({
            title: 'Edit User',
            back: '?view=settings.users.list',
            body: [
                Form({
                    load: 'user.load',
                    cancelHref: '?view=settings.users.list',
                    id: query.id,
                    handler: 'user.update',
                    fields: [
                        `<input name="id" value="${query.id}" type="hidden" />`,
                        ...userFields.filter(x => !x.hidden).map(x => FieldInput(x))
                    ]
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
    ].join('')
}