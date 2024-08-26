import { Button, Checkbox, EmptyTable, Form, Input, Modal, Page, Select, Stack, Table, Textarea } from "../components.js"

const fieldTypes = [
    { text: 'Input', value: 'input' },
    { text: 'Textarea', value: 'textarea' },
    { text: 'Checkbox', value: 'checkbox' },
    { text: 'File', value: 'file' },
    { text: 'Select', value: 'select' },
    { text: 'Slot', value: 'slot' },
    { text: 'Rich Text', value: 'rich-text' },
    { text: 'Relation', value: 'relation' }
]

function fieldTypeText(key) {
    console.log(key)
    return fieldTypes.find(x => x.value === key)?.text ?? '---'
}

export function FieldModal({id}) {
    return Modal({
        name: 'field', 
        title: '---',
        body: `<input type="hidden" name="id" value="${id}"/>`     
    })
}

export function FieldTypeSelector({action = 'add-field-choose-type'} = {}) {
    return [
        `<div data-field-type-buttons>
            ${fieldTypes.map(x => `
                <button type="button" style="width: calc(50% - 8px);" data-button data-button-block data-action="${action}" data-value="${x.value}">
                    ${x.text}
                </button>
            `).join('')}
        </div>
        `,
        Stack({justify: 'end'}, [
            Button({text: 'Cancel', action: 'modal.close'}),
            Button({text: 'Next', color: 'primary', action}),
        ])
    ].join('')
}

export function FieldForm({handler, collections, id, mode = 'add', type = ''}) {
    let fields = [
        `<input name="id" value="${id}" type="hidden">`,
        `<input name="type" value="${type}" type="hidden">`,
        Input({
            name: 'slug', 
            disabled: mode === 'edit',
            placeholder: 'Enter Slug', 
            label: 'Slug'
        }),
        Input({
            name: 'label', 
            placeholder: 'Enter Label', 
            label: 'Label'
        }),
    ]

    if(type == 'input') {
        fields.push(
            Select({
                name: 'input_type', 
                label: "Input Type", 
                items: [
                    {text: 'Text', value: 'text'},
                    {text: 'Password', value: 'password'},
                    {text: 'Number', value: 'number'},
                    {text: 'Email', value: 'email'},
                ]
            })
        )
    }
    if(['input', 'textarea'].includes(type)) {
        // fields.push(
        //     Input({
        //         name: 'defaultValue', 
        //         placeholder: 'Enter Default Value', 
        //         label: 'Default Value'
        //     }),
        // )
    }

    if(type === 'select') {
        fields.push(
            Textarea({name: 'items', placeholder: 'Enter select options (each item in single line)', label: 'Items', rows: 5})
        )
        fields.push(
            Checkbox({name: 'multiple', label: 'Multiple'})
        )
    }
    
    if(type === 'file') {
        fields.push(
            Select({
                name: 'file_type', 
                label: 'Type', 
                placeholder: 'Choose File type',
                items: [
                    {value: 'image', text: 'Image'},
                    {value: 'video', text: 'Video'},
                    {value: 'document', text: 'Document'},
                    {value: 'all', text: 'All Types'},
                ]
            })
        )
        fields.push(
            Checkbox({name: 'multiple', label: 'Multiple'})
        )
    }

    if(type === 'relation') {
        fields.push(
            Select({
                items: collections.map(x => ({text: x.name, value: x.id})),
                label: 'Collection',
                name: 'collectionId',
                placeholder: 'Choose collection'
            })
        )
        fields.push(
            Checkbox({name: 'multiple', label: 'Multiple'})
        )
    }

    return Form({
        cancelAction: 'modal.close',
        handler,
        card: false,
        fields
    })
}

export function FieldsList({name, updateAction = 'open-edit-field-modal', action = 'open-add-field-modal', id, fields, deleteAction = 'delete-field'}) {
    let _fields = JSON.parse(JSON.stringify(fields ?? []))
    for(let field of _fields) {
        if(field.type === 'select')
            field.items = field.items.join('\n')
    }
    
    return Page({
        title: 'Fields',
        actions: [
            Button({
                block: true,
                text: 'Add Field', 
                color: 'primary', 
                action,
                dataset: {
                    'modal-name': 'field'
                }
            })
        ],
        body: _fields.length === 0 ? (
            EmptyTable({
                title: "No fields", 
                description: 'There are no fields yet!'
            })
        ) : Table({
            head: `
                <th>Slug</th>
                <th>Label</th>
                <th>Type</th>
            `,
            body: [
                _fields.map(item => `<tr>
                    <td>${item.slug}</td>
                    <td>${item.label}</td>
                    <td>${fieldTypeText(item.type)}</td>
                    <td>
                        ${Stack({}, (item.default || item.hidden) ? [] : [
                            Button({
                                text: 'Edit', 
                                size: 'small', 
                                outline: true, 
                                color: 'primary',
                                action: updateAction,
                                dataset: {...item, 'collection-id': item.collectionId}
                            }),
                            Button({
                                text: 'Delete', 
                                size: 'small', 
                                outline: true, 
                                color: 'danger',
                                action: deleteAction,
                                dataset: {
                                    id: id,
                                    slug: item.slug
                                }
                            }),
                        ])}
                    </td>
                </tr>`).join(''),
            ]
        })
    })
}
