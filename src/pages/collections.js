import { Button, Checkbox, EmptyTable, File, Form, Input, Label, Page, Select, Stack, Table, Textarea } from "../../public/shared/components.js"

function DeleteConfirm() {
    return ''
    // return `
    //     <div data-delete-confirm data-collection-content-delete>
    //         <div data-confirm-body>
    //             <h3 data-confirm-title>Remove Content</h3>
    //             <p data-confirm-description>Are you sure to remove this item?</p>

    //             <div data-confirm-actions>
    //                 <button data-action="collection-content-delete-no" data-button data-button-block>No</button>
    //                 <button data-action="collection-content-delete-yes" data-button data-button-block data-button-color="danger">Yes</button>
    //             </div>
    //         </div>
    //     </div>
    // `
}

export function CollectionForm({id, handler, cancelAction, onSubmit}) {
    let load;

    if(id) {
        load = 'collection.load'
    }

    return Form({
        handler,
        cancelAction,
        load,
        id,
        onSubmit,
        fields: [
            (id ? `<input type="hidden" name="id" value="${id}">` : ''),
            Input({name: 'name', label: 'Name', placeholder: 'Enter Name'}),
            Label({
                symbolic: true,
                text: 'Fields', 
                body: `<div data-card><div data-card-body data-field-list data-stack-vertical>
                    
                    <div data-add-field-button style="margin-top: 1rem;">
                            ${Button({text: 'Add Field', color: 'primary', action: 'add-field'})}
                    </div>
                </div></div>

                <template id="field-inputs">
                    <div data-field-item data-stack>
                        ${Input({name: 'name', placeholder: 'Enter Name', label: 'Name'})}
                        ${Input({
                            name: 'slug', 
                            placeholder: 'Enter Slug', 
                            label: 'Slug'
                        })}
                        ${Select({
                            name: 'type', 
                            placeholder: 'Choose Type', 
                            label: 'Type',
                            items: [
                                { text: 'Input', value: 'input' },
                                { text: 'Textarea', value: 'textarea' },
                                { text: 'Checkbox', value: 'checkbox' },
                                { text: 'File', value: 'file' },
                                { text: 'Select', value: 'select' },
                            ]

                        })}
                        ${Button({text: 'Remove', color: 'danger', action: 'remove-field'})}
                    </div>
                </template>
            `})
        ]
    })
}

function FieldInput(field) {
    let options = {
        name: field.slug, 
        label: field.name,
        placeholder: 'Enter ' + field.name
    }
    if(field.type === 'select') {
        options.items = ['t', 'o', 'd', 'o']
        options.placeholer = 'Choose' + field.name
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

export function updateCollectionPage(id) {
    return Page({
        title: 'Update Collection',
        actions: [],
        body: CollectionForm({
            id,
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
            head: collection.fields.map(field => `<th>${field.name}</th>`),
            row(item) {
                return `<tr>
                    ${collection.fields.map(field => 
                        `<td>${render(item, field)}</td>`
                    ).join('')}
                    <td>
                        ${Stack({
                            body: [
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
                            ]
                        })}
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
    }) + DeleteConfirm()
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
