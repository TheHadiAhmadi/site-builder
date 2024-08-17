import { Checkbox, Form, Input, Page, Select, Textarea } from "../components.js"

export function pageCreatePage({collections}) {
    return Page({
        title: 'Create Page',
        actions: '',
        body: Form({
            cancelAction: 'navigate-to-default-view',
            handler: 'page.create',
            fields: [
                Input({name: 'name', label: 'Name', placeholder: 'Enter Page Name'}),
                Input({name: 'title', label: 'Title', placeholder: 'Enter Title'}),
                Input({name: 'slug', label: 'Slug', placeholder: 'Enter Slug'}),
                Textarea({name: 'head', label: 'Head', placeholder: 'Enter Head content'}),
            ].join('')
        })
    })
}

export function pageUpdatePage(page, {collections}) {
    return Page({
        title: 'Update Page',
        actions: '',
        body: Form({
            name: 'page-update-form',
            cancelAction: 'navigate-to-default-view',
            handler: 'page.update',
            load: 'page.load',
            id: page.id,
            fields: [
                `<input type="hidden" name="id" value="${page.id}" />`,
                Input({name: 'name', label: 'Name', placeholder: 'Enter Page Name'}),
                Input({name: 'title', label: 'Title', placeholder: 'Enter Title'}),
                Input({name: 'slug', label: 'Slug', placeholder: 'Enter Slug'}),
                Checkbox({name: 'hidden', label: 'Hidden'}),
                Checkbox({name: 'dynamic', label: 'Dynamic'}),
                Select({
                    name: 'collectionId', 
                    label: 'Collection', 
                    placeholder: 'Choose Collection',
                    items: collections.map(x => ({text: x.name, value: x.id}))
                }),
                Textarea({name: 'head', label: 'Head', placeholder: 'Enter Head content'}),
            ].join('')
        })
    })
}