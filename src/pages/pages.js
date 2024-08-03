import { Form, Input, Page, Textarea } from "../../public/shared/components.js"

export function pageCreatePage() {
    return Page({
        title: 'Create Page',
        actions: '',
        body: Form({
            cancelAction: 'navigate-to-default-view',
            handler: 'createPage',
            fields: [
                Input({name: 'name', label: 'Name', placeholder: 'Enter Page Name'}),
                Input({name: 'title', label: 'Title', placeholder: 'Enter Title'}),
                Input({name: 'slug', label: 'Slug', placeholder: 'Enter Slug'}),
                Textarea({name: 'head', label: 'Head', placeholder: 'Enter Head content'}),
            ].join('')
        })
    })
}

export function pageUpdatePage(page) {
    return Page({
        title: 'Update Page',
        actions: '',
        body: Form({
            name: 'page-update-form',
            cancelAction: 'navigate-to-default-view',
            handler: 'updatePage',
            load: 'load-page',
            id: page.id,
            fields: [
                `<input type="hidden" name="id" value="${page.id}" />`,
                Input({name: 'name', label: 'Name', placeholder: 'Enter Page Name'}),
                Input({name: 'title', label: 'Title', placeholder: 'Enter Title'}),
                Input({name: 'slug', label: 'Slug', placeholder: 'Enter Slug'}),
                Textarea({name: 'head', label: 'Head', placeholder: 'Enter Head content'}),
            ].join('')
        })
    })
}