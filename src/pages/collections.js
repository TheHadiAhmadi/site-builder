import { Button, Checkbox, EmptyTable, Form, Input, Label, Page, Select, Table, Textarea } from "../../public/shared/components.js"

function DeleteConfirm() {
    return `
        <div data-delete-confirm data-collection-content-delete>
            <div data-confirm-body>
                <h3 data-confirm-title>Remove Content</h3>
                <p data-confirm-description>Are you sure to remove this item?</p>

                <div data-confirm-actions>
                    <button data-action="collection-content-delete-no" data-button data-button-block>No</button>
                    <button data-action="collection-content-delete-yes" data-button data-button-block data-button-color="danger">Yes</button>
                </div>
            </div>
        </div>
    `
}

export function CollectionForm({id, handler, cancelAction, onSubmit}) {
    let load;

    if(id) {
        load = 'load-collection'
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
                                { text: 'Select', value: 'select' },
                            ]

                        })}
                        ${Button({text: 'Remove', color: 'danger', action: 'remove-field'})}
                    </div>
                </template>
            `})
        ].join('')
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
        checkbox: Checkbox
    }
    

    if(inputs[field.type]) {
        return inputs[field.type](options)
    }
}


export function createCollectionPage() {
    return Page({
        title: 'Create Collection',
        actions: [].join(''),
        body: CollectionForm({
            handler: 'createCollection'
        })
    })
}

export function updateCollectionPage(id) {
    return Page({
        title: 'Update Collection',
        actions: [].join(''),
        body: CollectionForm({
            id,
            handler: 'updateCollection'
        })
    })
}


export function collectionDataList(collection, items) {
    let content;
    
    if(items.length) {
        content = Table({
            items,
            head: collection.fields.map(field => `<th>${field.name}</th>`),
            row(item) {
                return `<tr>
                    ${collection.fields.map(field => 
                        `<td>${item[field.slug]}</td>`
                    ).join('')}
                    <td>
                        <div data-table-actions>
                            <a href="?mode=edit&view=collection-data-update&id=${item.id}" data-table-action data-table-action-edit>
                                Edit
                            </a>
                            <button data-action="open-delete-collection-content-confirm" data-content-id="${item.id}" data-table-action data-table-action-delete>
                                Delete
                            </button>
                        </div>
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
        ].join(''),
        body: content        
    }) + DeleteConfirm()
}

export function collectionDataCreate(collection, items) {
    return Page({
        title: 'Insert ' + collection.name,
        actions: [].join(''),
        body: Form({
            handler: 'insertCollectionContent',
            fields: [
                `<input type="hidden" value="${collection.id}" name="_type">`, 
                collection.fields.map(field => FieldInput(field)).join('')
            ].join(''),
            cancelAction: ''
        })
    })
}

export function collectionDataUpdate(collection, data) {
    const id = data.id.toString()
    return Page({
        title: 'Update ' + collection.name,
        actions: [].join(''),
        body: Form({ 
            load: 'load-collection-content',
            id,
            handler: 'updateCollectionContent',
            fields: [
                '<input type="hidden" value="' + id + '" name="id">',
                '<input type="hidden" value="' + data._type + '" name="_type">',
                collection.fields.map(field => FieldInput(field)).join('')
            ].join(''),
            cancelAction: ''
        })
    })
}
