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
        <div data-action="open-module-settings" data-module-id="${module.id}">
            <div data-module-content>
                ${rendered}
            </div>
            ${previewContent}
        </div>
    `
}
