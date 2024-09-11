import { Button, File, Form, Input, Label, Modal, Page, Stack, Textarea } from "#components"
import { db } from "#services"
import { CodeEditor } from "#components"
import { FieldModal, FieldsList } from "./fields.js"

export async function BlockCreatePage({permissions}) {
    return [
        Page({
            actions: [
                permissions.block_create_ai ? Button({text: 'Create With AI', color: 'primary', action: "open-create-module-ai-modal"}) : '',
                Button({text: 'Cancel', action: "navigation.navigate-to-default-view"})
            ].join(''),
            title: `Create New Block`,
            body: [
                Form({
                    handler: 'block.create',
                    fields: [
                        Input({label: 'Name', placeholder: 'Enter Block name', name: 'name'}),
                        CodeEditor({label: 'Template', lang: 'hbs', placeholder: 'Enter Block template (Handlebars)', name: 'template'}),
                    ],
                    cancelAction: 'navigation.navigate-to-default-view'
                })
            ]
        }),
        CreateBlockAiModal()
    ].join('')
}

export async function BlockUpdatePage({query, permissions}) {
    const block = await db('blocks').query().filter('id', '=', query.id).first()

    return [
        Page({
            actions: [
                permissions.block_update_ai ? Button({text: 'Update With AI', color: 'primary', action: "open-update-module-ai-modal"}) : '',
                permissions.block_delete ? Button({text: 'Delete', color: 'danger', outline: true, action: "delete-module", dataset: {id: block.id}}) : '',
                Button({text: 'Cancel', action: "navigation.navigate-to-default-view"}),
                
            ].join(''),
            title: `Update Block (${block.name})`,
            body: Stack({vertical: true, gap: 'lg'}, [
                Form({
                    load: 'block.load',
                    id: block.id,
                    handler: 'block.update',
                    fields: [
                        `<input data-input type="hidden" name="id" value="" />`,
                        Input({label: 'Name', placeholder: 'Enter Module name', name: 'name'}),
                        BlockPreview({id: block.id}),
                        CodeEditor({label: 'Template', lang: 'hbs', placeholder: 'Enter Module template (Handlebars)', name: 'template'}),
                    ],
                    cancelAction: 'navigation.navigate-to-default-view'
                }),
            ])
        }),
        FieldsList({
            id: block.id, 
            fields: block.props, 
            updateAction: 'module-open-edit-field-modal', 
            action: 'open-module-add-prop-modal', 
            deleteAction: 'delete-settings-field'
        }),             
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
                `<input data-input type="hidden" name="id" value="${id}">`,
                Textarea({name: 'template', label: 'Prompt', rows: 5, placeholder: 'Which changes do you want to apply for this module?'}),
                File({name: 'image', label: "Image", type: 'image', multiple: false, hidden: true}),
            ]
        })
    })
}

function BlockPreview({id}) {

    return Label({
        text: 'Preview (TODO)',
        symbolic: true, 
        // body: `
        //     <div style="display: flex; flex-direction: column; border-radius: 8px; height: 50vh; max-width: 400px; height: 80vh; overflow: auto; border: 1px solid var(--border-color)" data-block-preview>
        //         <div style="border-bottom: 1px solid var(--border-color); data-block-preview-header>
        //             <svg data-preview-action="light" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17q-2.075 0-3.537-1.463T7 12t1.463-3.537T12 7t3.538 1.463T17 12t-1.463 3.538T12 17m-7-4H1v-2h4zm18 0h-4v-2h4zM11 5V1h2v4zm0 18v-4h2v4zM6.4 7.75L3.875 5.325L5.3 3.85l2.4 2.5zm12.3 12.4l-2.425-2.525L17.6 16.25l2.525 2.425zM16.25 6.4l2.425-2.525L20.15 5.3l-2.5 2.4zM3.85 18.7l2.525-2.425L7.75 17.6l-2.425 2.525z"/></svg>
        //             <svg data-preview-action="dark" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21q-3.75 0-6.375-2.625T3 12t2.625-6.375T12 3q.35 0 .688.025t.662.075q-1.025.725-1.638 1.888T11.1 7.5q0 2.25 1.575 3.825T16.5 12.9q1.375 0 2.525-.613T20.9 10.65q.05.325.075.662T21 12q0 3.75-2.625 6.375T12 21"/></svg>
                    
        //             <svg data-preview-action="desktop" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M8 21v-2h2v-2H4q-.825 0-1.412-.587T2 15V5q0-.825.588-1.412T4 3h16q.825 0 1.413.588T22 5v10q0 .825-.587 1.413T20 17h-6v2h2v2zm-4-6h16V5H4zm0 0V5z"/></svg>
        //             <svg data-preview-action="mobile" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7 23q-.825 0-1.412-.587T5 21V3q0-.825.588-1.412T7 1h10q.825 0 1.413.588T19 3v18q0 .825-.587 1.413T17 23zm0-3v1h10v-1zm0-2h10V6H7zM7 4h10V3H7zm0 0V3zm0 16v1z"/></svg>
        //         </div>
        //         <div data-block-preview-iframe-wrapper style="height: 100%; padding: 1rem;">
        //             <iframe style="height: 100%" src="/preview/${id}"></iframe>
        //         </div>
        //     </div>
        // `  
    })
}
