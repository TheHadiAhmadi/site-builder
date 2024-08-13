import { Button, Form, Input, Page, Stack, Textarea } from "../components.js"
import { FieldModal, FieldsList } from "./fields.js"

export function pageCreateModule() {
    return [
        Page({
            actions: [
                Button({text: 'Cancel', action: "navigation.navigate-to-default-view"})
            ].join(''),
            title: `Create New Module`,
            body: [
                Form({
                    handler: 'definition.create',
                    fields: [
                        Input({label: 'Name', placeholder: 'Enter Module name', name: 'name'}),
                        Textarea({label: 'Template', rows: 15, placeholder: 'Enter Module template (Handlebars)', name: 'template'}),
                    ],
                    cancelAction: 'navigation.navigate-to-default-view'
                })
            ]
        }),
        Page({
            // actions: [
            //     Button({
            //         text: 'Cancel', 
            //         action: "navigation.navigate-to-default-view"
            //     })
            // ].join(''),
            title: `Create Module with AI`,
            body: [
                Form({
                    cancelAction: 'navigation.navigate-to-default-view',
                    handler: 'ai.createModule',
                    fields: [
                        Textarea({
                            label: 'Describe ui design of module', 
                            rows: 5, 
                            placeholder: `should have red background initially and when hovered it should be changed to blue. should have title and description with a hidden button aligned vertically. when hovered, hide texts and only show button.`, 
                            name: 'template'
                        }),
                        Textarea({
                            label: 'Describe props of module', 
                            rows: 5, 
                            placeholder: `title and description props are string button link and button text props are string too.`,
                            name: 'fields'
                        }),
                    ]
                })
            ]
        })
    ].join('')
}

export function pageUpdateModule(data) {
    return [
        Page({
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
            ])
        }),
        // FieldsList({id: data.id, fields: data.props, name: 'props', deleteAction: 'delete-settings-field'}),             
        FieldsList({id: data.id, fields: data.props, updateAction: 'module-open-edit-field-modal', action: 'open-module-add-prop-modal', deleteAction: 'delete-settings-field'}),             
        FieldModal({ id: data.id }),
        // FieldTypeModal({}),
        // FieldAddModal({id: data.id, handler: 'definition.addField'}),
        // FieldEditModal({id: data.id, handler: 'definition.setField'})
    ].join('')
}