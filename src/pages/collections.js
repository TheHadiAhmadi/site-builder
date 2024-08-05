import { Button, Card, CardBody, Checkbox, EmptyTable, File, Form, Input, Label, Modal, Page, Select, Stack, Table, Textarea } from "../components.js"
import { FieldAddModal, FieldEditModal, FieldsList, FieldTypeModal } from "./fields.js";

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
        })
    ])
}

export function FieldInput(field) {
    let options = {
        name: field.slug, 
        label: field.label,
        placeholder: 'Enter ' + field.label
    }
    if(field.type === 'select') {
        options.items = ['t', 'o', 'd', 'o']
        options.placeholer = 'Choose' + field.label
        // return Input({name: field.slug, label: field.name, placeholder: 'Enter ' + field.name})
    }
    const inputs = {
        input: Input,
        select: Select,
        textarea: Textarea,
        checkbox: Checkbox,
        file: File
    }
    
    if(inputs[field.type]) {
        return inputs[field.type](options)
    }
}


export function createCollectionPage() {
    return Page({
        title: 'Create Collection',
        actions: [],
        body: CollectionForm({
            handler: 'collection.create'
        })
    })
}

export function updateCollectionPage(collection) {
    return [
        Page({
        title: 'Update Collection',
        actions: [],
        body: CollectionForm({
                id: collection.id,
                fields: collection.fields ?? [],
                handler: 'collection.update'
            }),
        }),
        FieldsList({id: collection.id, fields: collection.fields}),             
        FieldTypeModal({}),
        FieldAddModal({collectionId: collection.id}),
        FieldEditModal({collectionId: collection.id})
    ].join('')
}


export function collectionDataList(collection, items) {
    let content;

    function render(item, field) {
        if(field.type === 'input') return item[field.slug]
        if(field.type === 'textarea') return item[field.slug].slice(0, 100) + (item[field.slug].length > 100 ? '...' : '')
        if(field.type === 'checkbox') return item[field.slug] ? 'Yes' : 'No'
        if(field.type === 'select') return `<div>BADGE: ${item[field.slug]}</div>`
        if(field.type === 'file') return `<div>FILE${item[field.slug]}</div>`
    }
    
    if(items.length) {
        content = Table({
            items,
            head: collection.fields.map(field => `<th>${field.label}</th>`),
            row(item) {
                return `<tr>
                    ${collection.fields.map(field => 
                        `<td>${render(item, field)}</td>`
                    ).join('')}
                    <td>
                        ${Stack({}, [
                            Button({
                                text: 'Edit',
                                href: "?mode=edit&view=collection-data-update&id=" + item.id,
                                outline: true,
                                size: 'small',
                                color: 'primary'
                            }),
                            Button({
                                text: 'Delete',
                                action: 'delete-content',
                                outline: true,
                                size: 'small',
                                color: 'danger',
                                dataset: {
                                    id: item.id
                                }
                            })
                        ])}
                    </td>
                </tr>`
            }
        })
    } else {
        content = EmptyTable({
            title: 'No Items',
            description: "This collection doesn't have any item yet!"
        })
    }
    
    return Page({
        title: collection.name + ' List',
        actions: [
            Button({text: 'Insert', color: 'primary', href: `?mode=edit&view=collection-data-create&id=` + collection.id})
        ],
        body: content        
    })
}

export function collectionDataCreate(collection, items) {
    return Page({
        title: 'Insert ' + collection.name,
        actions: [],
        body: Form({
            handler: 'content.insertCollectionContent',
            fields: [
                `<input type="hidden" value="${collection.id}" name="_type">`, 
                collection.fields.map(field => FieldInput(field)).join('')
            ],
            cancelAction: ''
        })
    })
}

export function collectionDataUpdate(collection, data) {
    const id = data.id.toString()
    return Page({
        title: 'Update ' + collection.name,
        actions: [],
        body: Form({ 
            load: 'content.loadCollectionContent',
            id,
            handler: 'content.updateCollectionContent',
            fields: [
                '<input type="hidden" value="' + id + '" name="id">',
                '<input type="hidden" value="' + data._type + '" name="_type">',
                collection.fields.map(field => FieldInput(field)).join('')
            ],
            cancelAction: ''
        })
    })
}
