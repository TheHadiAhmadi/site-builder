import { Button, Form, Page } from "#components";
import { userFields, UsersDataTable } from "../handlers/user.js";
import { getUrl } from "../helpers.js";
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
    return Page({
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
}

export async function UserUpdatePage({query}) {
    return [
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