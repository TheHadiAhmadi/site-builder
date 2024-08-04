import { Button, Card, CardBody, Checkbox, EmptyTable, File, Form, Input, Label, Modal, Page, Select, Stack, Table, Textarea } from "../components.js"

const fieldTypes = [
    { text: 'Input', value: 'input' },
    { text: 'Textarea', value: 'textarea' },
    { text: 'Checkbox', value: 'checkbox' },
    { text: 'File', value: 'file' },
    { text: 'Select', value: 'select' },
]

function fieldTypeText(key) {
    return fieldTypes.find(x => x.value === key).text

}

function FieldTypeModal() {
    return Modal({
        name: 'field-type', 
        title: 'Choose a type',
        body: [
            Stack({}, fieldTypes.map(x => `
                    <button type="button" style="width: calc(50% - 8px);" data-button data-action="add-field-choose-type" data-value="${x.value}">
                        ${x.text}
                    </button>
                `)
            )
        ],
        footer: Stack({justify: 'end'}, [
            Button({text: 'Cancel', action: 'modal.close'}),
            Button({text: 'Next', color: 'primary', action: 'add-field-next'}),
        ])
    
    })
}

function FieldAddModal(collectionId) {
    return Modal({
        name: 'field-add', 
        title: 'Add Field', 
        body: Form({
            cancelAction: 'modal.close',
            handler: 'collection.addField',
            fields: [
                `<input name="id" value="${collectionId}" type="hidden">`,
                `<input name="type" value="" type="hidden">`,
                Input({
                    name: 'slug', 
                    placeholder: 'Enter Slug', 
                    label: 'Slug'
                }),
                Input({
                    name: 'label', 
                    placeholder: 'Enter Label', 
                    label: 'Label'
                }),
            ]
        })
    })
}

function FieldEditModal(collectionId) {
    return Modal({
        name: 'field-edit', 
        title: 'Edit Field', 
        body: Form({
            cancelAction: 'modal.close',
            handler: 'collection.setField',
            fields: [
                `<input name="id" value="${collectionId}" type="hidden">`,
                `<input name="type" value="" type="hidden">`,
                Input({
                    name: 'slug', 
                    disabled: true,
                    placeholder: 'Enter Slug', 
                    label: 'Slug'
                }),
                Input({
                    name: 'label', 
                    placeholder: 'Enter Label', 
                    label: 'Label'
                }),
            ]
        })
    })
}

function CollectionFields(id, fields) {
    return Label({
        symbolic: true,
        text: 'Fields', 
        body: [
            Stack({vertical: true}, [
                Table({
                    items: fields ?? [],
                    head: `
                        <th>Slug</th>
                        <th>Label</th>
                        <th>Type</th>
                    `,
                    row(item) {
                        return `<tr>
                            <td>${item.slug}</td>
                            <td>${item.label}</td>
                            <td>${fieldTypeText(item.type)}</td>
                            <td>
                                ${Stack({}, [
                                    Button({
                                        text: 'Edit', 
                                        size: 'small', 
                                        outline: true, 
                                        color: 'primary',
                                        action: 'open-edit-field-modal',
                                        dataset: {
                                            slug: item.slug,
                                            label: item.label,
                                            type: item.type
                                        }
                                    }),
                                    Button({
                                        text: 'Delete', 
                                        size: 'small', 
                                        outline: true, 
                                        color: 'danger',
                                        action: 'delete-field',
                                        dataset: {
                                            id: id,
                                            slug: item.slug
                                        }
                                    }),
                                ])}
                            </td>
                        </tr>`
                    }
                }),
                Button({
                    outline: true,
                    text: 'Add Field', 
                    color: 'primary', 
                    action: 'modal.open',
                    dataset: {
                        'modal-name': 'field-type'
                    }
                })
            ]),
            FieldTypeModal(id),
            FieldAddModal(id),
            FieldEditModal(id)
        ]
    })
}

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
        (id ? CollectionFields(id, fields) : null)
    ].filter(Boolean).join(''))
}

// `
//                     <template id="field-inputs">
//                         ${Stack({}, [
//                             Input({
//                                 name: 'name', 
//                                 placeholder: 'Enter Name', 
//                                 label: 'Name'
//                             }),
//                             Input({
//                                 name: 'slug', 
//                                 placeholder: 'Enter Slug', 
//                                 label: 'Slug'
//                             }),
//                             Select({
//                                 name: 'type', 
//                                 placeholder: 'Choose Type', 
//                                 label: 'Type',
//                                 items: [
//                                     { text: 'Input', value: 'input' },
//                                     { text: 'Textarea', value: 'textarea' },
//                                     { text: 'Checkbox', value: 'checkbox' },
//                                     { text: 'File', value: 'file' },
//                                     { text: 'Select', value: 'select' },
//                                 ]
//                             }),
//                             Button({
//                                 text: 'Remove', 
//                                 color: 'danger', 
//                                 action: 'remove-field'
//                             })
//                         ])}
//                     </template>
//                 `

function FieldInput(field) {
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
    return Page({
        title: 'Update Collection',
        actions: [],
        body: CollectionForm({
            id: collection.id,
            fields: collection.fields ?? [],
            handler: 'collection.update'
        })
    })
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
