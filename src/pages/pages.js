import { Checkbox, File, Form, Input, Page, Select, Textarea } from "../components.js"

function PageEditFields({collections}) {
    return [
        Input({name: 'name', label: 'Name', placeholder: 'Enter Page Name'}),
        Input({name: 'slug', label: 'Slug', placeholder: 'Enter Slug'}),               
        Checkbox({name: 'dynamic', label: 'Dynamic'}),
        Select({
            name: 'collectionId', 
            label: 'Collection', 
            placeholder: 'Choose Collection',
            items: collections.map(x => ({text: x.name, value: x.id}))
        }),
        Select({
            name: 'dir', 
            label: 'Direction', 
            placeholder: 'Choose page direction',
            items: [
                {text: 'left to right', value: 'ltr'},
                {text: 'right to left', value: 'rtl'},
            ]
        }),
        Select({
            name: 'lang', 
            label: 'Language', 
            placeholder: 'Choose page language',
            items: [
                {text: 'English', value: 'en'},
                {text: 'Persian', value: 'fa'},
                {text: 'Pashto', value: 'ps'},
                {text: 'Not defined', value: ''},
            ]
        }),
        `<div style="border-bottom: 1px solid #ddd; padding-top: 1.5rem; font-weight: bold; font-size: 18px; padding-bottom: 0.5rem;">SEO</div>`,
        Input({name: 'seo.title', label: 'Title', placeholder: 'Enter Title'}),
        Input({name: 'seo.meta_title', label: 'Meta Title', placeholder: "Enter meta title"}),
        Input({name: 'seo.meta_description', label: 'Meta Description', placeholder: "Enter meta description"}),
        Input({name: 'seo.meta_keywords', label: 'Meta Keywords', placeholder: "Enter meta keywords (comma separated)"}),

        Select({
            name: 'seo.robots', 
            label: 'Robots', 
            placeholder: 'Select Robots Directive',
            items: [
                {text: 'index, follow', value: 'index, follow'},
                {text: 'noindex, follow', value: 'noindex, follow'},
                {text: 'index, nofollow', value: 'index, nofollow'},
                {text: 'noindex, nofollow', value: 'noindex, nofollow'}
            ]
        }),

        File({name: 'seo.social_image', label: 'Social Media Image', type: 'image'}),
        Select({
            name: 'seo.twitter_card', 
            label: 'Twitter Card Type', 
            placeholder: 'Select Twitter Card Type',
            items: [
                {text: 'Summary', value: 'summary'},
                {text: 'Summary with Large Image', value: 'summary_large_image'},
                {text: 'App', value: 'app'},
                {text: 'Player', value: 'player'}
            ]
        }),
        Select({
            name: 'seo.og_type', 
            label: 'OG Type', 
            placeholder: 'Select OG Type',
            items: [
                {text: 'Article', value: 'article'},
                {text: 'Website', value: 'website'},
                {text: 'Video', value: 'video'},
                {text: 'Product', value: 'product'}
            ]
        }),
        `<div style="border-bottom: 1px solid #ddd; padding-top: 1.5rem; font-weight: bold; font-size: 18px; padding-bottom: 0.5rem;">Head</div>`,

        Textarea({name: 'script', label: 'Script', placeholder: 'Enter page script'}),
        Textarea({name: 'style', label: 'Style', placeholder: 'Enter page styles'}),
        Textarea({name: 'head', label: 'Head', placeholder: 'Enter Head content'}),
        Checkbox({name: 'include_site_head', label: 'Include Site\'s Head content'}),
    ]
}

export function pageCreatePage({collections}) {
    return Page({
        title: 'Create Page',
        actions: '',
        body: Form({
            cancelAction: 'navigate-to-default-view',
            handler: 'page.create',
            fields: PageEditFields({collections})
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
                PageEditFields({collections}).join('')
            ].join('')
        })
    })
}