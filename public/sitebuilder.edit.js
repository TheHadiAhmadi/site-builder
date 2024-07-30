const iframeElement = document.querySelector('iframe')

async function reloadIframe() {
    const res = await fetch(window.location.href.replace('mode=edit', 'mode=preview')).then(res => res.text())
    iframeElement.contentDocument.documentElement.innerHTML = res

    setTimeout(() => {
        initIframe()
    })
}

async function request(handler, body, reload = true) {
    return await fetch('/api/query', {
        method: 'POST',
        body: JSON.stringify({ handler, body }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        return res.json()
    }).then(async res => {
        if(res.reload) {
            await reloadIframe()
        }
        return res;
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
            if(event.to == definitionsElement) return;
            await request('createModule', { slug: window.location.pathname, definitionId: event.item.dataset.definitionId, index: event.newIndex })
            await updateModules()
        }
    })

    iframeElement.onload = () => {
        initIframe()
    }

    document.querySelector('[data-create-module]').addEventListener('click', () => {
        document.body.dataset.mode = 'create-definition'
        // 
    })
    document.querySelectorAll('[data-mode-create-definition]').forEach(createDef => {

        createDef.querySelectorAll('[data-button-action="close-create-definition"]').forEach(el => {
            el.addEventListener('click', () => {
                delete document.body.dataset.mode
            })
        })

        createDef.querySelectorAll('[data-form]').forEach(el => {
            el.addEventListener('submit', async (e) => {
                console.log('submitted')
                e.preventDefault();
                delete document.body.dataset.mode;
                const form = new FormData(e.target);
                const body = {};
                let handler;
            
                for (let [key, value] of form.entries()) {
                    if(key === '_handler') {
                        handler = value
                    } else {
                        if (key.includes('.')) {
                            let parts = key.split('.');
                            let current = body;
                
                            parts.forEach((part, index) => {
                                if (!current[part]) {
                                    if (index === parts.length - 1) {
                                        current[part] = value;
                                    } else if (parts[index + 1] >= '0' && parts[index + 1] <= '9') {
                                        current[part] = [];
                                    } else {
                                        current[part] = {};
                                    }
                                }
                                current = current[part];
                            });
                        } else {
                            body[key] = value;
                        }
                    }
                }
            
                await request(handler, body);
                window.location.reload()
            });
        })
    })
    document.querySelectorAll('[data-mode-update-definition]').forEach(updateDef => {

        updateDef.querySelectorAll('[data-button-action="close-update-definition"]').forEach(el => {
            el.addEventListener('click', () => {
                delete document.body.dataset.mode
            })
        })

        updateDef.querySelectorAll('[data-form]').forEach(el => {
            el.addEventListener('submit', async (e) => {
                e.preventDefault();
                delete document.body.dataset.mode;
                const form = new FormData(e.target);
                const body = {};
                let handler = 'updateDefinition';
            
                for (let [key, value] of form.entries()) {
                    if(key === '_handler') {
                        handler = value
                    } else {
                        if (key.includes('.')) {
                            let parts = key.split('.');
                            let current = body;
                
                            parts.forEach((part, index) => {
                                if (!current[part]) {
                                    if (index === parts.length - 1) {
                                        current[part] = value;
                                    } else if (parts[index + 1] >= '0' && parts[index + 1] <= '9') {
                                        current[part] = [];
                                    } else {
                                        current[part] = {};
                                    }
                                }
                                current = current[part];
                            });
                        } else {
                            body[key] = value;
                        }
                    }
                }
            
                // TODO: Handler from html
                await request('updateDefinition', body);
                window.location.reload()
            });
        })
    })

    document.querySelectorAll('[data-definition-id]').forEach(el => {
        setTimeout(() => {

            el.querySelector('[data-definition-settings]').addEventListener('click', async () => {
                console.log('clicked')
                document.body.dataset.mode = 'update-definition'
                
                const data = await request('getDefinition', {id: el.dataset.definitionId})

                console.log({data})
                
                document.querySelectorAll('[data-mode-update-definition] [data-form] [name]').forEach(input => {
                    input.value = data[input.getAttribute('name')]
                })

                document.querySelector('[data-mode-update-definition] [data-form] [name="id"]').value = el.dataset.definitionId
                // fill the form
                // document.querySelectorAll()
            })
        }, 200)
    })
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

        mod.querySelector('[data-delete-icon]')?.addEventListener('click', async () => {
            // mod.dataset.dataMode = 'list'
            mod.querySelector('[data-module-delete]').classList.add('open')
        })
        
        mod.querySelector('[data-module-confirm-button-no]').addEventListener('click', async () => {
            mod.querySelector('[data-module-delete]').classList.remove('open')
        })

        mod.querySelector('[data-module-confirm-button-yes]').addEventListener('click', async () => {
            mod.querySelector('[data-module-delete]').classList.remove('open')
            await request('deleteModule', {moduleId: mod.dataset.moduleId})
        })

        mod.querySelector('[data-settings-icon]')?.addEventListener('click', async () => {
            // mod.dataset.dataMode = 'list'
            // await request('deleteModule', {moduleId: mod.dataset.moduleId})
            mod.dataset.dataMode = 'settings'
            // load settings and fill form
            const settings = await request('loadModuleSettings', {moduleId: mod.dataset.moduleId})

            mod.querySelectorAll('[data-mode-settings] [data-form] [data-input]').forEach(input => {
                input.value = settings[input.getAttribute('name')]
            })

        })


        mod.querySelector('[data-data-icon]')?.addEventListener('click', async () => {
            if(mod.dataset.multiple) {
                mod.dataset.dataMode = 'list'
            } else {
                mod.dataset.dataMode = 'edit-single'

                const contentId = mod.querySelector('[data-data-icon]').dataset.contentId

                if(contentId) {
                    // load data if have
                    const content = await request('getContent', {contentId}).then(res => res.data[0])
                    
                    mod.querySelectorAll('[data-mode-edit-single] [data-form] [data-input]').forEach(input => {
                        input.value = content[input.getAttribute('name')]
                    })
                } else {
                    mod.querySelector('[data-mode-edit-single] [data-form] [name="_handler"]').value = 'createContent'
                }
            }
        })

        if(mod.dataset.multiple) {
            mod.querySelector('[data-content-header] [data-button-action="open-insert"]').addEventListener('click', () => {
                mod.dataset.dataMode = 'add'
            })
            mod.querySelectorAll('[data-button-action="open-default"]').forEach(el => {
                el.addEventListener('click', () => {
                    delete mod.dataset.dataMode 
                })
            })

            mod.querySelectorAll('[data-button-action="open-list"]').forEach(el => {
                el.addEventListener('click', () => {
                    mod.dataset.dataMode = 'list' 
                })
            })

            mod.querySelectorAll('[data-table-action-delete]').forEach(el => {
                el.addEventListener('click', () => {
                    mod.querySelector('[data-content-delete]').classList.add('open')
                
                    mod.querySelector('[data-content-confirm-button-yes]').dataset.contentId = el.dataset.contentId;
                })
            })
            

            const yesButton = mod.querySelector('[data-content-confirm-button-yes]')
            const noButton = mod.querySelector('[data-content-confirm-button-no]')

            yesButton.addEventListener('click', async () => {
                mod.querySelector('[data-content-delete]').classList.remove('open')
                await request('deleteContent', { moduleId: mod.dataset.moduleId, id: yesButton.dataset.contentId})
            })

            noButton.addEventListener('click', async () => {
                mod.querySelector('[data-content-delete]').classList.remove('open')
            })
        }

        mod.querySelectorAll('[data-button-action="open-default"]').forEach(el => {
            el.addEventListener('click', () => {
                delete mod.dataset.dataMode
            })
        })

        mod.querySelectorAll('[data-table-action-edit]').forEach(editButton => {
            editButton.addEventListener('click', async() => {
                mod.dataset.dataMode = 'edit'

                const content = await request('getContent', {contentId: editButton.dataset.contentId}).then(res => res.data[0])
 
                mod.querySelectorAll('[data-mode-edit] [data-form] [data-input]').forEach(input => {
                    input.value = content[input.getAttribute('name')]
                })
            })
        })

        mod.querySelectorAll('[data-form]').forEach(form => {
            form.querySelectorAll('[data-button]').forEach(el => {
                el.addEventListener('click', () => {
                    if(el.dataset.action == 'open-list') {
                        mod.dataset.dataMode = 'list'
                    } else if(el.dataset.action == 'open-default') {
                        delete mod.dataset.dataMode
                    }
                })
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
