import { Button, Form, Input, Modal, Page, Stack, Textarea } from "#components"
import { db } from "#services"
import { FieldModal, FieldsList } from "./fields.js"

export async function BlockCreatePage() {
    return [
        Page({
            actions: [
                Button({text: 'Create With AI', color: 'primary', action: "open-create-module-ai-modal"}),
                Button({text: 'Cancel', action: "navigation.navigate-to-default-view"})
            ].join(''),
            title: `Create New Block`,
            body: [
                Form({
                    handler: 'definition.create',
                    fields: [
                        Input({label: 'Name', placeholder: 'Enter Block name', name: 'name'}),
                        Textarea({label: 'Template', rows: 15, placeholder: 'Enter Block template (Handlebars)', name: 'template'}),
                    ],
                    cancelAction: 'navigation.navigate-to-default-view'
                })
            ]
        }),
        CreateBlockAiModal()
    ].join('')
}

export async function BlockUpdatePage({query}) {
    const block = await db('definitions').query().filter('id', '=', query.id).first()

    return [
        Page({
            actions: [
                Button({text: 'Update With AI', color: 'primary', action: "open-update-module-ai-modal"}),
                Button({text: 'Delete', color: 'danger', action: "delete-module", dataset: {id: block.id}}),
                Button({text: 'Cancel', action: "navigation.navigate-to-default-view"}),
                
            ].join(''),
            title: `Update Block (${block.name})`,
            body: Stack({vertical: true, gap: 'lg'}, [
                Form({
                    load: 'definition.load',
                    id: block.id,
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
        FieldsList({id: block.id, fields: block.props, updateAction: 'module-open-edit-field-modal', action: 'open-module-add-prop-modal', deleteAction: 'delete-settings-field'}),             
        FieldModal({ id: block.id }),
        UpdateBlockAiModal({id: block.id}),
        Page({
            title: 'Previous Prompts',
            body:[
            block.prompt ? Stack({vertical: true, gap: 'sm'}, [
                (typeof block.prompt.template === 'string' ? [block.prompt.template] : block.prompt.template).map(x => `
                    <div style="border-radius: 4px; border: 1px solid var(--border-color); background-color: var(--card-bg); padding: 1rem">
                        ${(x).replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                    </div>
                `).join('')
            ]) : '', 
        ]})
    ].join('')      
}

export function CreateBlockAiModal() {
    return Modal({
        name: 'create-ai',
        title: `Create Block with AI`,
        body: Form({
            card: false,
            cancelAction: 'modal.close',
            handler: 'ai.createModule',
            fields: [
                Input({label: 'Name', placeholder: 'Enter Block name', name: 'name'}),
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

export function UpdateBlockAiModal({id}) {
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

