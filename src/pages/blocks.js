import { Button, File, Form, Input, Modal, Page, Stack, Textarea } from "#components"
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
            startActions: [
                Button({ 
                    action: 'create-block-ai-modal-image-add',
                    text: `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h8v2H5v14h14v-8h2v8q0 .825-.587 1.413T19 21zm1-4h12l-3.75-5l-3 4L9 13zm11-8V7h-2V5h2V3h2v2h2v2h-2v2z"/></svg>
                        Add Image    
                    `, 
                    color: 'primary', 
                    outline: true 
                })
            ],
            fields: [
                Input({label: 'Name', placeholder: 'Enter Block name', name: 'name'}),
                Textarea({
                    label: 'Prompt', 
                    rows: 5, 
                    placeholder: `Create Card with red background and white text...`, 
                    name: 'template'
                }),
                File({name: 'image', label: "Image", type: 'image', multiple: false, hidden: true}),
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
            startActions: [
                Button({ 
                    action: 'update-block-ai-modal-image-add',
                    text: `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h8v2H5v14h14v-8h2v8q0 .825-.587 1.413T19 21zm1-4h12l-3.75-5l-3 4L9 13zm11-8V7h-2V5h2V3h2v2h2v2h-2v2z"/></svg>
                        Add Image    
                    `, 
                    color: 'primary', 
                    outline: true 
                })
            ],
            fields: [
                `<input type="hidden" name="id" value="${id}">`,
                Textarea({name: 'template', label: 'Prompt', rows: 5, placeholder: 'Which changes do you want to apply for this module?'}),
                File({name: 'image', label: "Image", type: 'image', multiple: false, hidden: true}),
            ]
        })
    })
}

