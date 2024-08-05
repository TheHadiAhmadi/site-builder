import { Button, Form, Input, Page, Stack, Textarea } from "../components.js"
import { FieldAddModal, FieldEditModal, FieldsList, FieldTypeModal } from "./fields.js"

export function pageCreateModule() {
    return Page({
        actions: [
            Button({text: 'Cancel', action: "navigation.navigate-to-default-view"})
        ].join(''),
        title: `Create New Module`,
        body: Form({
            handler: 'definition.create',
            fields: [
                Input({label: 'Name', placeholder: 'Enter Module name', name: 'name'}),
                Textarea({label: 'Template', rows: 15, placeholder: 'Enter Module template (Handlebars)', name: 'template'}),
            ],
            cancelAction: 'navigation.navigate-to-default-view'
        })
    })
}

export function pageUpdateModule(data) {

    console.log(data)
    return Page({
        actions: [
            Button({text: 'Cancel', action: "navigate-to-default-view"})
        ].join(''),
        title: `Update Module (${data.name})`,
        body: Stack({vertical: true}, [
            Form({
                load: 'definition.load',
                id: data.id,
                handler: 'definition.update',
                fields: [
                    `<input type="hidden" name="id" value="" />`,
                    Input({label: 'Name', placeholder: 'Enter Module name', name: 'name'}),
                    Textarea({label: 'Template', rows: 15, placeholder: 'Enter Module template (Handlebars)', name: 'template'}),
                    
                ],
                cancelAction: 'navigate-to-default-view'
            }),
            FieldsList({id: data.id, fields: data.props, name: 'props', deleteAction: 'delete-settings-field'}),             
            FieldTypeModal({}),
            FieldAddModal({id: data.id, handler: 'definition.addField'}),
            FieldEditModal({id: data.id, handler: 'definition.setField'})
        ])
    })
}