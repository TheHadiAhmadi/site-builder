import { Button, Checkbox, File, Input, Label, Select, Stack, Textarea } from "#components"
import { getText, getValue, isSelected } from "#helpers"

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
        symbolic: true,
        text: field.label,
        body: `<div data-rich-text-wrapper><div name="${field.name}" data-rich-text></div></div>`
    })
}

export function FieldInput(field, collections = [], functions = {}) {
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

    function SelectFieldType({name, label, placeholder, items, multiple}) {
        if(multiple) {
            return Label({
                text: label, 
                body: items.map(item => Checkbox({multiple: true, name, checked: isSelected(item), multiple: true, label: getText(item), value: getValue(item)}))
            })
        }

        return Select({name, placeholder, label, items})
    }

    function FunctionField({name, label, placeholder}) {
        return Select({
            name,
            placeholder: 'Choose a Function',
            label,
            items: Object.keys(functions).map(x => ({value: x, text: functions[x].name}))
        })
    }

    function DateInput(options) {
        return Input({...options, type: 'datetime'})
    }
    
    const inputs = {
        input: Input,
        select: SelectFieldType,
        textarea: Textarea,
        checkbox: Checkbox,
        file: File,
        relation: Relation,
        'rich-text': RichText,
        collection: CollectionField,
        function: FunctionField,
        color: Input,
        date: DateInput,
        hidden: (options) => Label({text: options.label})
    }
    
    if(inputs[field.type]) {
        return inputs[field.type](options)
    }
}