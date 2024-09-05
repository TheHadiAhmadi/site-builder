import { db } from "#services"
import { Button, Checkbox, File, Form, Input, Label, Modal, Page, Select, Stack, TabItem, Tabs, Textarea } from "#components"

function PageSeoFields() {
    return Stack({vertical: true, gap: 'lg'}, [
        Label({
            symbolic: true,
            text: 'Use AI',
            body: Stack({justify: 'start'}, Button({text: 'Update with AI', color: 'primary', action: 'open-seo-update-ai-modal'}))
        }),
        Input({ name: 'seo.title', label: 'Title', placeholder: 'Enter Title' }),
        Input({ name: 'seo.meta_title', label: 'Meta Title', placeholder: "Enter meta title" }),
        Input({ name: 'seo.meta_description', label: 'Meta Description', placeholder: "Enter meta description" }),
        Input({ name: 'seo.meta_keywords', label: 'Meta Keywords', placeholder: "Enter meta keywords (comma separated)" }),

        Select({
            name: 'seo.robots',
            label: 'Robots',
            placeholder: 'Select Robots Directive',
            items: [
                { text: 'index, follow', value: 'index, follow' },
                { text: 'noindex, follow', value: 'noindex, follow' },
                { text: 'index, nofollow', value: 'index, nofollow' },
                { text: 'noindex, nofollow', value: 'noindex, nofollow' }
            ]
        }),

        File({ name: 'seo.social_image', label: 'Social Media Image', type: 'image' }),
        Select({
            name: 'seo.twitter_card',
            label: 'Twitter Card Type',
            placeholder: 'Select Twitter Card Type',
            items: [
                { text: 'Summary', value: 'summary' },
                { text: 'Summary with Large Image', value: 'summary_large_image' },
                { text: 'App', value: 'app' },
                { text: 'Player', value: 'player' }
            ]
        }),
        Select({
            name: 'seo.og_type',
            label: 'OG Type',
            placeholder: 'Select OG Type',
            items: [
                { text: 'Article', value: 'article' },
                { text: 'Website', value: 'website' },
                { text: 'Video', value: 'video' },
                { text: 'Product', value: 'product' }
            ]
        })
    ])
}

function PageHeadFields() {
    return Stack({vertical: true, gap: 'lg'}, [
        Textarea({ name: 'script', label: 'Script', placeholder: 'Enter page script' }),
        Textarea({ name: 'style', label: 'Style', placeholder: 'Enter page styles' }),
        Textarea({ name: 'head', label: 'Head', placeholder: 'Enter Head content' }),
    ])
}

function PageEditFields({ collections }) {
    return Stack({vertical: true, gap: 'lg'}, [
        Input({ name: 'name', label: 'Name', placeholder: 'Enter Page Name' }),
        Input({ name: 'slug', label: 'Slug', placeholder: 'Enter Slug' }),
        Checkbox({ name: 'dynamic', label: 'Dynamic' }),
        Select({
            name: 'collectionId',
            label: 'Collection',
            placeholder: 'Choose Collection',
            items: collections.map(x => ({ text: x.name, value: x.id }))
        }),
        Select({
            name: 'dir',
            label: 'Direction',
            placeholder: 'Choose page direction',
            items: [
                { text: 'left to right', value: 'ltr' },
                { text: 'right to left', value: 'rtl' },
            ]
        }),
        Select({
            name: 'lang',
            label: 'Language',
            placeholder: 'Choose page language',
            items: [
                { text: 'English', value: 'en' },
                { text: 'Persian', value: 'fa' },
                { text: 'Pashto', value: 'ps' },
                { text: 'Not defined', value: '' },
            ]
        }),
    ])
}

export async function PageCreatePage() {
    let collections = await db('collections').query().all()

    return Page({
        title: 'Create Page',
        actions: '',
        body: Form({
            cancelAction: 'navigation.navigate-back',
            handler: 'page.create',
            fields: PageEditFields({ collections })
        })
    })
}

export async function PageUpdatePage({query, permissions}) {
    let back = query.back ?? ''
    let collections = await db('collections').query().all()
    const page = await db('pages').query().filter('id', '=', query.id).first()

    console.log({back})

    return [
        Page({
            title: 'Update Page',
            back: back,
            actions: [
                permissions.page_delete ? Button({text: 'Delete', outline: true, action: 'delete-page', color: 'danger', dataset: {id: page.id}}): ""
            ],
            body: Form({
                name: 'page-update-form',
                cancelHref:  back,
                handler: 'page.update',
                load: 'page.load',
                id: page.id,
                fields: [
                    `<input type="hidden" name="id" value="${page.id}" />`,
                    Tabs({
                        items: ['General', 'Seo', 'Head'], 
                        body: [
                            TabItem([PageEditFields({collections})]),
                            TabItem([PageSeoFields()]),
                            TabItem([PageHeadFields()]),
                        ]
                    })
                ]
            })
        }),
        UpdateSeoAiModal({id: page.id})
    ].join('')
}

function UpdateSeoAiModal({id}) {
    return Modal({
        name: 'seo-ai',
        title: 'Update Seo with AI',
        footer: '',
        body: Form({
            card: false,
            cancelAction: 'modal.close',
            handler: 'ai.updateSeo',
            fields: [
                `<input type="hidden" name="id" value="${id}">`,
                Textarea({name: 'prompt', label: 'Prompt', rows: 5, placeholder: 'on which keywords and search queries should We focus while filling seo fields?'})
            ]
        })
    })
}