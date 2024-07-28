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

        mod.querySelector('[data-data-icon]')?.addEventListener('click', async () => {
            mod.dataset.dataMode = 'list'
        })
        
        mod.querySelector('[data-header-button-insert]').addEventListener('click', () => {
            mod.dataset.dataMode = 'add'
        })

        mod.querySelectorAll('[data-header-button-back]').forEach(el => {
            el.addEventListener('click', () => {
                mod.dataset.dataMode = 'list'
            })
        })

        mod.querySelector('[data-header-button-cancel]').addEventListener('click', () => {
            delete mod.dataset.dataMode
        })
        mod.querySelectorAll('[data-table-action-delete]').forEach(deleteButton => {
            deleteButton.addEventListener('click', () => {
                mod.querySelector('[data-delete-confirm]').classList.add('open')
            
                mod.querySelector('[data-confirm-button-yes]').dataset.contentId = deleteButton.dataset.contentId;
                
            })
        })
        const yesButton = mod.querySelector('[data-confirm-button-yes]')
        const noButton = mod.querySelector('[data-confirm-button-no]')

        yesButton.addEventListener('click', async () => {
            mod.querySelector('[data-delete-confirm]').classList.remove('open')
            await request('deleteContent', { moduleId: mod.dataset.moduleId, id: yesButton.dataset.contentId})
        })

        noButton.addEventListener('click', async () => {
            mod.querySelector('[data-delete-confirm]').classList.remove('open')
        })

        mod.querySelectorAll('[data-table-action-edit]').forEach(editButton => {
            editButton.addEventListener('click', async() => {
                mod.dataset.dataMode = 'edit'

                const content = await fetch(`/api/content/${editButton.dataset.contentId}`).then(res => res.json())

                mod.querySelectorAll('[data-mode-edit] [data-form] [data-input]').forEach(input => {
                    input.value = content[input.getAttribute('name')]
                })

                // fill the form
            })
        })

        mod.querySelector('[data-delete-confirm]')
        

        mod.querySelectorAll('[data-form]').forEach(form => {
            form.querySelector('[data-form-button-cancel]').addEventListener('click', () => {
                mod.dataset.dataMode = 'list'
            })

            form.addEventListener('submit', async (e) => {
                e.preventDefault()
                let formData = new FormData(form)

                let object = {}

                let handler;
                for(let [key, value] of formData.entries()) {
                    if(key === '_handler') {
                        handler = value
                    } else {
                        object[key] = value
                    }
                }

                await request(handler, {content: object, moduleId: mod.dataset.moduleId})
            })
        })


    })

}

init()
