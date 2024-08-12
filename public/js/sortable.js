import { request } from "./form.js";


export async function updateModules() {
    let sectionIndex = 1;
    
    const body = { 
        slug: window.location.pathname, 
        modules: [] 
    }

    let iframeElement = document.querySelector('iframe')
    const columnsList = iframeElement.contentDocument.querySelectorAll('[data-columns]')
    const sections = iframeElement.contentDocument.querySelectorAll('[data-section]')

    for (let section of sections) {
        const mod = section.parentElement.parentElement
        body.modules.push({ 
            id: mod.dataset.moduleId, 
            order: sectionIndex++,
        })
    }

    for (let columns of columnsList) {
        let moduleIndex = 1;

        columns.querySelectorAll('[data-column]').forEach(column => {            
            const mod = column.querySelector('[data-module-id]')
            body.modules.push({ 
                id: mod.dataset.moduleId, 
                moduleId: column.parentElement.dataset.columns,
                cols: +column.dataset.cols,
                order: moduleIndex++,
            })
        })

    }

    await request('module.updateOrders', body)
}

export function initSortableIframe() {
    let iframeElement = document.querySelector('iframe')
    const bodyElement = iframeElement.contentDocument.querySelector('[data-body]')

    Sortable.get(bodyElement)?.destroy()
    new Sortable(bodyElement, {
        group: 'layout',
        animation: 150,
        draggable: '[data-module-id]',
        handle: '[data-action="drag-module-handle"]',
        onEnd(event) {
            updateModules()
        }
    })

    iframeElement.contentDocument.querySelectorAll('[data-columns]').forEach(el => {
        Sortable.get(el)?.destroy()

        new Sortable(el, {
            group: 'modules',
            animation: 150,
            draggable: '[data-column]',
            handle: '[data-action="drag-module-handle"]',
            onEnd(event) {
                updateModules()
            }
        })
    })
    
}

export function initSortable() {
    const definitionsElement = document.querySelector('[data-definitions]')
    Sortable.get(definitionsElement)?.destroy()
    
    new Sortable(definitionsElement, {
        group: {
            name: 'modules',
            pull: 'clone',
            put: false,
        },
        sort: false,
        draggable: '[data-definition-id]',
        animation: 150,
        async onEnd(event) {
            if(event.to == definitionsElement) return;
            const body = { 
                slug: window.location.pathname, 
                definitionId: event.item.dataset.definitionId, 
                order: event.newIndex + 1,
                moduleId: event.to.dataset.columns
            }

            await request('module.create', body)
            updateModules()
        }
    })

    // const layoutDefinitionsElement = document.querySelector('[data-definitions-layout]')
    // Sortable.get(layoutDefinitionsElement)?.destroy()
    
    // new Sortable(layoutDefinitionsElement, {
    //     group: {
    //         name: 'layout',
    //         pull: 'clone',
    //         put: false,
    //     },
    //     sort: false,
    //     draggable: '[data-definition-id]',
    //     animation: 150,
    //     async onEnd(event) {
    //         if(event.to == layoutDefinitionsElement) return;
    //         const body = { 
    //             slug: window.location.pathname, 
    //             definitionId: event.item.dataset.definitionId, 
    //             pageId: getPageId(),
    //             index: event.newIndex 
    //         }

    //         await request('module.create', body)
    //         updateModules()
    //     }
    // })
}
