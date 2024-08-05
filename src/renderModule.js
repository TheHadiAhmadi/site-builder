import { html } from 'svelite-html';

export async function renderModule(module, {mode, definitions, permissions}) {
    const definition = definitions[module.definitionId]

    let fields = []

    fields = definition.fields ?? []

    const props = {}

    for(let item of definition.props ?? []) {
        props[item.slug] = module.props[item.slug] ?? item.defaultValue
    }

    let rendered;
    try {
        rendered = definition.template(props);
    } catch(err) {
        rendered = 'Something went wrong: ' + err.message
    }

    let previewContent = ''

    function ModuleAction({icon, action}) {
        return `<div data-action="${action}">    
            ${icon}
        </div>`
    }

    const moduleActions = html`
        <div data-action="drag-module-handle" data-module-actions data-module-actions-start>
            ${[
                ModuleAction({
                    action: 'open-module-settings', 
                    icon: [
                        '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m12 22l-4.25-4.25l1.425-1.425L11 18.15V13H5.875L7.7 14.8l-1.45 1.45L2 12l4.225-4.225L7.65 9.2L5.85 11H11V5.85L9.175 7.675L7.75 6.25L12 2l4.25 4.25l-1.425 1.425L13 5.85V11h5.125L16.3 9.2l1.45-1.45L22 12l-4.25 4.25l-1.425-1.425L18.15 13H13v5.125l1.8-1.825l1.45 1.45z"/></svg>',
                        '<div data-module-action-text>' + definition.name + '</div>'
                    ].join('')
                })
            ]}
        </div>
        <div data-module-actions data-module-actions-end>
            ${[
                ModuleAction({
                    action: 'open-module-settings', 
                    icon: '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"/></svg>'
                }),
                ModuleAction({
                    action: 'open-delete-module-confirm', 
                    icon: '<svg data-action-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"/></svg>'
                }),
            ]}
        </div>
    `
    
    if(mode === 'preview' && permissions) {
        previewContent = `
            ${moduleActions}
        `
    }

    return `
        <div data-module-id="${module.id}">
            <div data-module-content>
                ${rendered}
            </div>
            ${previewContent}
        </div>
    `
}
