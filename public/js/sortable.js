import { request } from "./form.js";


function updateModules() {
    let index = 1;
    
    const body = { 
        slug: window.location.pathname, 
        modules: [] 
    }

    let iframeElement = document.querySelector('iframe')
    const moduleElements = iframeElement.contentDocument.querySelectorAll('[data-module-id]')

    for (let mod of moduleElements) {
        body.modules.push({ 
            id: mod.dataset.moduleId, 
            order: index++ 
        })
    }
    request('module.updateOrders', body)
}

export function initSortableIframe() {
    let iframeElement = document.querySelector('iframe')
    const bodyElement = iframeElement.contentDocument.querySelector('[data-body]')

    Sortable.get(bodyElement)?.destroy()
    new Sortable(bodyElement, {
        group: 'nested',
        animation: 150,
        draggable: '[data-module-id]',
        handle: '[data-action="drag-module-handle"]',
        onEnd(event) {
            updateModules()
        }
    })
}

export function initSortable() {
    const definitionsElement = document.querySelector('[data-definitions]')
    Sortable.get(definitionsElement)?.destroy()

    new Sortable(definitionsElement, {
        group: {
            name: 'nested',
            pull: 'clone',
            put: false,
        },
        sort: false,
        draggable: '[data-definition-id]',
        animation: 150,
        async onEnd(event) {
            if(event.to == definitionsElement) return;
            await request('module.create', { 
                slug: window.location.pathname, 
                definitionId: event.item.dataset.definitionId, 
                index: event.newIndex 
            })
            updateModules()
        }
    })
}
