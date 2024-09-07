import { db } from "#services";
import { Button, Card, CardBody, Checkbox, EmptyTable, File, Form, Input, Label, Modal, Page, Select, Stack, Table, Textarea } from "#components"
import { CollectionDataTable, DataTable } from "./dataTable.js";
import { FieldModal, FieldsList } from "./fields.js";
import { getText, getValue, isSelected } from "#helpers";
import { FieldInput } from "./field-input.js";

export function CollectionForm({id, fields, handler, cancelAction, onSubmit}) {
    let load;

    if(id) {
        load = 'collection.load'
    }

    return Stack({vertical: true}, [
        Form({
            handler,
            cancelAction,
            load,
            id,
            onSubmit,
            fields: [
                (id ? `<input type="hidden" name="id" value="${id}">` : ''),
                Input({
                    name: 'name', 
                    label: 'Name', 
                    placeholder: 'Enter Name'
                }),
                Checkbox({
                    name: 'sidebar',
                    label: 'Show in sidebar',
                }),
                `<div data-alert>
                <div>If <b><code>Show in sidebar</code></b> is checked, the Collection item will appear in the sidebar when user doesn't have <b><code>collections</code></b> permission.</div></div>`            ]
        }),
    ])
}

export function RelationFieldModal() {
    return Modal({
        name: 'relation-field-modal', 
        title: 'Choose items',
        size: 'large',
        footer: Stack({justify: 'end'}, [
            Button({text: 'Close', action: 'modal.close'}),
            Button({color: 'primary', outline:true, text: 'Save Filters', action: 'choose-collection-filters'}),
            Button({color: 'primary', text: 'Save Items', action: 'choose-collection-items'}),
        ]),
        body: `<div></div>`

    })
}

export async function CollectionCreatePage() {
    return Page({
        title: 'Create Collection',
        actions: [],
        body: CollectionForm({
            handler: 'collection.create'
        })
    })
}

export async function CollectionUpdatePage({query}) {
    const collection = await db('collections').query().filter('id', '=', query.id).first()

    return [
        Page({
        title: 'Update Collection',
        actions: [
            Button({text: 'View Data', href: '?view=collections.data.list&id=' + collection.id}),
            Button({text: 'Delete', color: 'danger', outline: true, action: 'delete-collection', dataset: {id: collection.id}}),
        ],
        body: CollectionForm({
                id: collection.id,
                fields: collection.fields ?? [],
                handler: 'collection.update'
            }),
        }),
        FieldsList({id: collection.id, fields: collection.fields}),             
        FieldModal({ id: collection.id }),
        
    ].join('')
}

function getFieldFilterOperator(field) {
    if(field.type === 'select') return 'in'
    if(field.type === 'relation') return field.filterMode ?? 'in'
    if(field.type === 'checkbox') return 'in'
    if(field.type === 'input') return 'like'
    if(field.type === 'textarea') return 'like'
    if(field.type === 'rich-text') return 'like'

    return '='
} 

export async function CollectionDataListPage({query}) {
    const {id, ...rest} = query
    const collection = await db('collections').query().filter('id', '=', id).first()

    let filters = []
    for(let key in rest) {
        filters.push({
            value: JSON.parse(rest[key]), 
            field: key, 
            operator: getFieldFilterOperator(collection.fields.find(x => x.slug === key))
        })
    }
    
    let content = await CollectionDataTable({filters, page: 1, perPage: 10, collectionId: collection.id, fields: collection.fields, relationFilters: true})
    
    return Page({
        title: collection.name + ' List',
        actions: [
            Button({text: 'Insert', color: 'primary', href: `?view=collections.data.create&id=` + collection.id})
        ],
        body: content    
    })
}

export async function CollectionDataCreatePage({query, functions}) {
    const collection = await db('collections').query().filter('id', '=', query.id).first()
    const collections = await db('collections').query().all()

    const filters = JSON.parse(decodeURIComponent(query.filters ?? '[]'))
    const back = '?view=collections.data.list&id=' + collection.id + '&' + filters.map(x => `${x.field}=${encodeURIComponent(JSON.stringify(x.value))}`).join('&')
    
    return Page({
        title: 'Insert ' + collection.name,
        back,
        backText: collection.name + ' List',
        actions: [],
        body: [
            Form({
                onSubmit: 'collection-data-create-submit',
                cancelHref: back,
                fields: [
                    `<input type="hidden" value="${collection.id}" name="_type">`, 
                    collection.fields.filter(x => !x.hidden).map(field => FieldInput(field, collections, functions)).join('')
                ],
            }),
        ]
    })
}

export async function CollectionDataUpdatePage({query, functions}) {
    const data = await db('contents').query().filter('id', '=', query.id).first()
    const collection = await db('collections').query().filter('id', '=', data._type).first()
    const collections = await db('collections').query().first()


    const filters = JSON.parse(decodeURIComponent(query.filters))
    const back = '?view=collections.data.list&id=' + collection.id + '&' + filters.map(x => `${x.field}=${encodeURIComponent(JSON.stringify(x.value))}`).join('&')
    
    const id = data.id.toString()
    return Page({
        title: 'Update ' + collection.name,
        actions: [],
        back,
        backText: collection.name + ' List',
        body: [
            Form({ 
                load: 'content.loadCollectionContent',
                id,
                onSubmit: 'collection-data-update-submit',
                cancelHref: back,
                fields: [
                    '<input type="hidden" value="' + id + '" name="id">',
                    '<input type="hidden" value="' + data._type + '" name="_type">',
                    collection.fields.filter(x => !x.hidden).map(field => FieldInput(field, collections, functions)).join('')
                ],
            }),
        ]
    })
}
