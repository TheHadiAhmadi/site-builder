import { Button, Form, Page } from "#components";
import { roleFields, RolesDataTable } from "../handlers/role.js";
import { getUrl } from "#helpers";
import { FieldInput } from "./field-input.js";

export async function RoleListPage() {
    return Page({
        title: 'Roles',
        actions: [
            Button({
                href: getUrl({ view: 'settings.roles.create' }),
                color: 'primary',
                text: 'Add role'
            })
        ],
        body: await RolesDataTable({})
    })
}

export async function RoleCreatePage() {
    return Page({
        title: 'Add Role',
        back: '?view=settings.roles.list',
        body: [
            Form({
                handler: 'role.insert',
                cancelHref: '?view=settings.roles.list',
                fields: roleFields.filter(x => !x.hidden).map(x => FieldInput(x))
            })
        ]
    })
}

export async function RoleUpdatePage({query}) {
    return [
        Page({
            title: 'Edit Role',
            back: '?view=settings.roles.list',
            body: [
                Form({
                    load: 'role.load',
                    cancelHref: '?view=settings.roles.list',
                    id: query.id,
                    handler: 'role.update',
                    fields: [
                        `<input name="id" value="${query.id}" type="hidden" />`,
                        ...roleFields.filter(x => !x.hidden).map(x => FieldInput(x))
                    ]
                    
                })
            ]
        }),
        // users of this role
    //     Page({
    //         title: 'Set Password',
    //         body: [
    //             Form({
    //                 handler: 'user.setPassword',
    //                 fields: userFields.filter(x => x.slug === 'password').map(x => FieldInput(x))
    //             })
    //         ]
    //     }),
    ].join('')
}