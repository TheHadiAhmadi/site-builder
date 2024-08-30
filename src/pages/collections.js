import { db } from "#services";
import { Button, Card, CardBody, Checkbox, EmptyTable, File, Form, Input, Label, Modal, Page, Select, Stack, Table, Textarea } from "../components.js"
import { CollectionDataTable, DataTable } from "./dataTable.js";
import { FieldModal, FieldsList } from "./fields.js";

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
                
            ]
        }),
    ])
}

function Relation(field) {
    return Label({
        symbolic: true,
        text: field.label,
        inline: false,
        body: Stack({ vertical: true, align: 'start'}, [
            Button({
                text: 'Choose', 
                color: 'primary', 
                action: 'open-relation-modal', 
                dataset: { 
                    'collection-id': field.collectionId,
                    'modal-name': 'relation-field-modal',
                    'field-name': field.name,
                    'field-multiple': field.multiple ? true : false
                }
            }),
            `<input data-relation data-json type="hidden" name="${field.name}" value="">`,
            '<div data-relation-value></div>',
        ]),
    })    
}

function RichText(field) {
    return Label({
        text: field.label,
        body: `<div data-rich-text-wrapper><div name="${field.name}" data-rich-text></div></div>`
    })
}

export function FieldInput(field, collections = []) {
    let options = {
        name: field.slug, 
        label: field.label,
        placeholder: field.placeholder ?? 'Enter ' + field.label
    }
    if(field.type === 'select') {
        options.items = field.items ?? []
        options.placeholder = field.placeholder ?? 'Choose ' + field.label
        options.multiple = field.multiple
    }

    if(field.type === 'relation') {
        options.collectionId = field.collectionId
        options.multiple = field.multiple
    }

    if(field.type === 'file') {
        options.type = field.file_type
        options.multiple = field.multiple
        options.size = field.size
    }

    if(field.type === 'input') {
        options.type = field.input_type
    }

    function CollectionField({name, label, placeholder}) {
        return Select({
            name,
            placeholder: 'Choose Collection',
            label,
            items: collections.map(x => ({text: x.name, value: x.id}))
        })
    }

    const inputs = {
        input: Input,
        select: Select,
        textarea: Textarea,
        checkbox: Checkbox,
        file: File,
        relation: Relation,
        'rich-text': RichText,
        collection: CollectionField,
        hidden: (options) => Label({text: options.label})
    }
    
    if(inputs[field.type]) {
        return inputs[field.type](options)
    }
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
            Button({text: 'View Data', href: '?mode=edit&view=collections.data.list&id=' + collection.id}),
            Button({text: 'Delete', color: 'danger', action: 'delete-collection', dataset: {id: collection.id}}),
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


export async function CollectionDataListPage({query}) {
    const collection = await db('collections').query().filter('id', '=', query.id).first()

    let content = await CollectionDataTable({filters: [], page: 1, perPage: 10, collectionId: collection.id, fields: collection.fields, relationFilters: true})
    
    return Page({
        title: collection.name + ' List',
        actions: [
            Button({text: 'Insert', color: 'primary', href: `?mode=edit&view=collections.data.create&id=` + collection.id})
        ],
        body: content    
    })
}

export async function CollectionDataCreatePage({query}) {
    const collection = await db('collections').query().filter('id', '=', query.id).first()
    const collections = await db('collections').query().all()

    return Page({
        title: 'Insert ' + collection.name,
        back: '?mode=edit&view=collections.data.list&id=' + collection.id,
        actions: [],
        body: [
            Form({
                handler: 'content.insertCollectionContent',
                cancelHref: '?mode=edit&view=collections.data.list&id=' + collection.id,
                fields: [
                    `<input type="hidden" value="${collection.id}" name="_type">`, 
                    collection.fields.filter(x => !x.hidden).map(field => FieldInput(field, collections)).join('')
                ],
            }),
        ]
    })
}

export async function CollectionDataUpdatePage({query}) {
    const data = await db('contents').query().filter('id', '=', query.id).first()
    const collection = await db('collections').query().filter('id', '=', data._type).first()
    const collections = await db('collections').query().first()

    const id = data.id.toString()
    return Page({
        title: 'Update ' + collection.name,
        actions: [],
        body: [
            Form({ 
                load: 'content.loadCollectionContent',
                id,
                handler: 'content.updateCollectionContent',
                cancelHref: '?mode=edit&view=collections.data.list&id=' + collection.id,
                fields: [
                    '<input type="hidden" value="' + id + '" name="id">',
                    '<input type="hidden" value="' + data._type + '" name="_type">',
                    collection.fields.filter(x => !x.hidden).map(field => FieldInput(field, collections)).join('')
                ],
            }),
        ]
    })
}
