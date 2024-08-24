import { Button, CardBody, Form, Input, Modal, Page, Stack, Textarea } from "../components.js"
import { FieldModal, FieldsList } from "./fields.js"

function CreateModuleAiModal() {
    return Modal({
        name: 'create-ai',
        title: `Create Module with AI`,
        body: Form({
            card: false,
            cancelAction: 'modal.close',
            handler: 'ai.createModule',
            fields: [
                Input({label: 'Name', placeholder: 'Enter Module name', name: 'name'}),
                Textarea({
                    label: 'Describe ui design of module', 
                    rows: 5, 
                    placeholder: `Create Card with red background and white text...`, 
                    name: 'template'
                })
            ]
        })
    })
}

export function pageCreateModule() {
    return [
        Page({
            actions: [
                Button({text: 'Create With AI', color: 'primary', action: "open-create-module-ai-modal"}),
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
        CreateModuleAiModal()
    ].join('')
}

export function pageUpdateModule(data) {
    return [
        Page({
            actions: [
                Button({text: 'Update With AI', color: 'primary', action: "open-update-module-ai-modal"}),
                Button({text: 'Delete', color: 'danger', action: "delete-module", dataset: {id: data.id}}),
                Button({text: 'Cancel', action: "navigation.navigate-to-default-view"}),
                
            ].join(''),
            title: `Update Module (${data.name})`,
            body: Stack({vertical: true, gap: 'lg'}, [
                Form({
                    load: 'definition.load',
                    id: data.id,
                    handler: 'definition.update',
                    fields: [
                        `<input type="hidden" name="id" value="" />`,
                        Input({label: 'Name', placeholder: 'Enter Module name', name: 'name'}),
                        Textarea({label: 'Template', rows: 15, placeholder: 'Enter Module template (Handlebars)', name: 'template'}),
                        
                    ],
                    cancelAction: 'navigation.navigate-to-default-view'
                }),
            ])
        }),
        FieldsList({id: data.id, fields: data.props, updateAction: 'module-open-edit-field-modal', action: 'open-module-add-prop-modal', deleteAction: 'delete-settings-field'}),             
        FieldModal({ id: data.id }),
        UpdateModuleAiModal({id: data.id}),
        Page({
            title: 'Previous Prompts',
            body:[
            data.prompt ? Stack({vertical: true, gap: 'sm'}, [
                (typeof data.prompt.template === 'string' ? [data.prompt.template] : data.prompt.template).map(x => `
                    <div style="border-radius: 4px; border: 1px solid var(--border-color); background-color: var(--card-bg); padding: 1rem">
                        ${(x).replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                    </div>
                `).join('')
            ]) : '', 
        ]})
    ].join('')
}

export function UpdateModuleAiModal({id}) {
    return Modal({
        name: 'update-ai',
        title: 'Update Module with AI',
        footer: '',
        body: Form({
            card: false,
            cancelAction: 'modal.close',
            handler: 'ai.updateModule',
            fields: [
                `<input type="hidden" name="id" value="${id}">`,
                Textarea({name: 'template', label: 'Template', rows: 5, placeholder: 'Which changes do you want to apply for this module?'})
            ]
        })
    })
}