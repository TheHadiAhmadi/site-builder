import { Button, EmptyTable, Form, Input, Modal, Page, Stack, Table } from "../components.js"

const fieldTypes = [
    { text: 'Input', value: 'input' },
    { text: 'Textarea', value: 'textarea' },
    { text: 'Checkbox', value: 'checkbox' },
    { text: 'File', value: 'file' },
    { text: 'Select', value: 'select' },
    { text: 'Slot', value: 'slot' },
    { text: 'Rich Text', value: 'rich-text' },
]

function fieldTypeText(key) {
    return fieldTypes.find(x => x.value === key).text
}

export function FieldTypeModal({action = 'add-field-next'}) {
    return Modal({
        name: 'field-type', 
        title: 'Choose a type',
        body: Stack({}, fieldTypes.map(x => `
                <button type="button" style="width: calc(50% - 8px);" data-button data-action="add-field-choose-type" data-value="${x.value}">
                    ${x.text}
                </button>
            `)
        ),
        footer: Stack({justify: 'end'}, [
            Button({text: 'Cancel', action: 'modal.close'}),
            Button({text: 'Next', color: 'primary', action}),
        ])
    
    })
}

export function FieldForm({handler, id, mode = 'add', type = ''}) {
    return Form({
        cancelAction: 'modal.close',
        handler,
        fields: [
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
            Input({
                name: 'defaultValue', 
                placeholder: 'Enter Default Value', 
                label: 'Default Value'
            }),
            `MORE INPUTS: ${type}`
        ]
    })
}

export function FieldAddModal({id, handler = 'collection.addField'}) {
    return Modal({
        name: 'field-add', 
        title: 'Add Field', 
        body: FieldForm({handler, id})
    })
}

export function FieldEditModal({id, handler = 'collection.setField'}) {
    return Modal({
        name: 'field-edit', 
        title: 'Edit Field', 
        body: FieldForm({handler, id, type: '', mode: 'edit'})
    })
}

export function FieldsList({name, id, fields, deleteAction = 'delete-field'}) {
    return Page({
        title: 'Fields',
        actions: [
            Button({
                // outline: true,
                block: true,
                text: 'Add Field', 
                color: 'primary', 
                action: 'modal.open',
                dataset: {
                    'modal-name': 'field-type'
                }
            })
        ],
        body: fields.length === 0 ? (
            EmptyTable({
                title: "No fields", 
                description: 'There are no fields yet!'
            })
        ) : Table({
            items: fields ?? [],
            head: `
                <th>Slug</th>
                <th>Label</th>
                <th>Type</th>
            `,
            body: [
                fields.map(item => `<tr>
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
