const iframeElement = document.querySelector('iframe')

async function reloadIframe() {
    const res = await fetch(window.location.href.replace('mode=edit', 'mode=preview')).then(res => res.text())
    iframeElement.contentDocument.documentElement.innerHTML = res

    setTimeout(() => {
        initIframe()
    })
}

async function request(handler, body, reload = true) {
    await fetch('/api/update', {
        method: 'POST',
        body: JSON.stringify({ handler, body }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(async res => {
        await reloadIframe()
    })
}

function updateModules() {
    const body = { slug: window.location.pathname, modules: [] }
    let index = 1;
    for (let mod of iframeElement.contentDocument.querySelectorAll('[data-module-id]')) {
        body.modules.push({ id: mod.dataset.moduleId, order: index++ })
    }
    request('updateModules', body)
}
function init() {


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
            await request('createModule', { slug: window.location.pathname, definitionId: event.item.dataset.definitionId, index: event.newIndex })
            await updateModules()
        }
    })

    iframeElement.onload = () => {
        initIframe()
    }
}

function initIframe() {
    const bodyElement = iframeElement.contentDocument.querySelector('[data-body]')

    Sortable.get(bodyElement)?.destroy()
    new Sortable(bodyElement, {
        group: 'nested',
        animation: 150,
        draggable: '[data-module-id]',
        handle: '[data-drag-icon]',
        onEnd(event) {
            updateModules()
        }
    })

    const modules = iframeElement.contentDocument.querySelectorAll('[data-module-id]');
    modules.forEach(mod => {
        mod.querySelector('[data-add-icon]').addEventListener('click', async () => {
            console.log('add content clicked', mod)
            // const i
            const moduleId = mod.dataset.moduleId
            // const value = prompt('enter value:')
            alert('show edit form of this module with it\'s contentType inputs')
                        const content = {}
            await request('createContent', { moduleId, content })
        })
    })
}

init()
