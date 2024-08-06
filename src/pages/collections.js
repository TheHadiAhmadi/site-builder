import { Button, Card, CardBody, Checkbox, EmptyTable, File, Form, Input, Label, Modal, Page, Select, Stack, Table, Textarea } from "../components.js"
import { DataTable } from "./dataTable.js";
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
        options.items = field.items ?? []
        options.placeholder = 'Choose ' + field.label
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
        FieldAddModal({id: collection.id}),
        FieldEditModal({id: collection.id})
    ].join('')
}


export function collectionDataList(collection, items) {
    let filters = collection.fields.map(x => {
        return {
            label: x.label,
            slug: x.slug,
            type: x.type,
            ...x
        }
    })
    let content = DataTable({filters, items, collectionId: collection.id, fields: collection.fields})
    
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
            cancelAction: 'navigate-back'
        })
    })
}
