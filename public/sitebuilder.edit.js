//#region Globals
let iframeElement = document.querySelector('iframe')
let sidebarElement = document.querySelector('[data-sidebar]')

function openConfirm({title, description, action, id}) {
    const confirm = document.querySelector('[data-delete-confirm]')

    confirm.dataset.open = true
    confirm.dataset.id = id
    confirm.dataset.handler = action
    
    confirm.querySelector('[data-confirm-title]').textContent = title
    confirm.querySelector('[data-confirm-description]').textContent = description
}

const confirmActions = {
    close(el) {
        delete document.querySelector('[data-delete-confirm]').dataset.open
    },
    handle(el) {
        const confirm = document.querySelector('[data-delete-confirm]')
        delete confirm.dataset.open

        const id = confirm.dataset.id;
        const handler = confirm.dataset.handler;

        request(handler, {id})
    },
}

const actions = {
    confirm: confirmActions,
    'delete-content'(el) {
        openConfirm({
            title: 'Are you sure?',
            description: 'Are you sure to remove this item?',
            action: 'content.removeCollectionContent',
            id: el.dataset.id
        })
    },
    navigate(el) {
        const path = el.dataset.path
        const [sidebar, view] = path.split('.')

        sidebarElement.dataset.active = sidebar
               
    },
    link(el) {
        // window.location.href = el.dataset.href
        reload(el.dataset.href)
    },
    'navigate-to-default-view'() {
        reload(window.location.pathname + '?mode=edit')
    },
    'close-sidebar': () => {
        delete sidebarElement.dataset.active        
    },
    'open-delete-module-confirm'(el) {
        const mod = getParentModule(el)
        mod.querySelector(`[data-module-delete]`).classList.add('open')
    },
    'module-delete-no'(el) {
        const mod = getParentModule(el)
        mod.querySelector(`[data-module-delete]`).classList.remove('open')
    },
    async 'module-delete-yes'(el) {
        const mod = getParentModule(el)
        mod.querySelector(`[data-module-delete]`).classList.remove('open')
        await request('deleteModule', {moduleId: mod.dataset.moduleId})
    },
    async 'open-module-settings'(el) {
        const mod = getParentModule(el)
        mod.dataset.dataMode = 'settings'
        const settings = await request('loadModuleSettings', {moduleId: el.dataset.id})
        setFormValue(mod.querySelector('[data-mode-settings] [data-form]'), settings)

    },
    async 'open-module-data'(el) {
        const mod = getParentModule(el)

        if(mod.dataset.multiple) {
            mod.dataset.dataMode = 'list'
        } else {
            mod.dataset.dataMode = 'edit-single'

            const contentId = mod.dataset.contentId

            if(contentId) {
                // load data if have
                const content = await request('getContent', {contentId}).then(res => res.data[0])
                
                setFormValue(mod.querySelector('[data-mode-edit-single] [data-form]'), content)
            } else {
                mod.querySelector('[data-mode-edit-single] [data-form] [name="_handler"]').value = 'createContent'
            }
        }
    },
    'open-module-default'(el) {
        const mod = getParentModule(el)
        delete mod.dataset.dataMode 
    },
    async 'content-delete-yes'(el) {
        const mod = getParentModule(el)

        const id = mod.dataset.contentId
        mod.querySelector('[data-content-delete]').classList.remove('open')

        await request('deleteContent', { moduleId: mod.dataset.moduleId, id})
    },
    async 'content-delete-no'(el) {
        const mod = getParentModule(el)
        delete mod.dataset.contentId
        mod.querySelector('[data-content-delete]').classList.remove('open')
    },
    'open-module-insert'(el) {
        const mod = getParentModule(el)

        mod.dataset.dataMode = 'add'

    },
    'open-module-list'(el) {
        const mod = getParentModule(el)

        mod.dataset.dataMode = 'list'
    },
    'open-delete-content-confirm'(el) {
        const mod = getParentModule(el)
        mod.querySelector('[data-content-delete]').classList.add('open')

        mod.dataset.contentId = el.dataset.id
    },
    async 'open-edit-content'(el) {
        const mod = getParentModule(el)
        mod.dataset.dataMode = 'edit'
        const content = await request('getContent', {contentId: el.dataset.contentId}).then(res => res.data[0])
        setFormValue(mod.querySelector('[data-mode-edit] [data-form]'), {content})
    },
    async 'load-collection'(el) {
        const id = el.dataset.id;
        const res = await request('loadCollection', {id})
        
        setFormValue(el, res)

        for(let index in res.fields) {
            const field = res.fields[index]
            const list = el.querySelector('[data-field-list]')
            const template = el.querySelector('#field-inputs')
            const button  = el.querySelector('[data-add-field-button]')

            const element = template.content.cloneNode(true)

            element.querySelectorAll('[name]').forEach(el => {
                let name = el.getAttribute('name')
                el.setAttribute('name', 'fields.' + index + '.' + name)
                el.value = field[name]
            })

            list.insertBefore(element, button)

            const insertedElement = [...list.querySelectorAll('[data-field-item]')].pop()
            initActions(insertedElement)            
        }
        el.classList.remove('loading')
    },
    async 'load-collection-content'(el) {
        const id = el.dataset.id;
        const res = await request('loadCollectionContent', {id})
        
        setFormValue(el, res)

        el.classList.remove('loading')
    },
    'add-field'(el) {
        const id = 'id_' + Math.random()
        const element = document.getElementById('field-inputs').content.cloneNode(true)

        const fieldItems = el.parentElement.parentElement.querySelectorAll('[data-field-item]')

        element.querySelectorAll('[name]').forEach(el => {
            el.setAttribute('name', 'fields.' + fieldItems.length + '.' + el.getAttribute('name'))
        })
        
        el.parentElement.parentElement.insertBefore(element, el.parentElement)
        const insertedElement = [...el.parentElement.parentElement.querySelectorAll('[data-field-item]')].pop()
        initActions(insertedElement)

    },
    'remove-field'(el) {
        console.log('clicked')
        el.parentNode.remove()
        
        const remainingFields = [...el.parentElement.parentElement.querySelectorAll('[data-field-item]')]

        for(let index in remainingFields) {
            const field = remainingFields[index]

            field.querySelectorAll('[name]').forEach(el => {
                const currentName = el.getAttribute('name')
                const lastPart = currentName.pop()
                el.setAttribute('name', `fields.${index}.${lastPart}`)
            })
        }
    },
    'open-delete-collection-content-confirm'(el) {
        const id = el.dataset.contentId

        document.querySelector('[data-collection-content-delete]').classList.add('open')
        document.querySelector('[data-action="collection-content-delete-yes"]').dataset.contentId = id

    },
    'collection-content-delete-no'(el) {
        document.querySelector('[data-collection-content-delete]').classList.remove('open')
    },
    async 'collection-content-delete-yes'(el) {
        document.querySelector('[data-collection-content-delete]').classList.remove('open')
        const id = document.querySelector('[data-action="collection-content-delete-yes"]').dataset.contentId

        await request('removeCollectionContent', {id})
    },
    'choose-collection'(el) {
        const mod = getParentModule(el)
        const moduleId = mod.dataset.moduleId
        document.querySelector('[data-modal="choose-collection"]').dataset.moduleId = moduleId
        document.querySelector('[data-modal="choose-collection"]').dataset.modalOpen = true
    },
    'create-collection'(el) {
        const mod = getParentModule(el)
        const moduleId = mod.dataset.moduleId
        document.querySelector('[data-modal="create-collection"]').dataset.moduleId = moduleId
        document.querySelector('[data-modal="create-collection"]').dataset.modalOpen = true
    },
    'close-choose-collection-modal'(el) {
        delete document.querySelector('[data-modal="choose-collection"]').dataset.modalOpen        
    },
    'close-create-collection-modal'(el) {
        delete document.querySelector('[data-modal="create-collection"]').dataset.modalOpen        
    },
    async 'choose-collection-button'(el) {
        delete document.querySelector('[data-modal="choose-collection"]').dataset.modalOpen
        const moduleId = document.querySelector('[data-modal="choose-collection"]').dataset.moduleId
        const id = el.dataset.collectionId

        const res = await request('getModule', {id: moduleId})
        res.collectionId = id

        request('updateModule', res)
    },
    async 'create-collection-modal-submit'(el) {
        delete document.querySelector('[data-modal="choose-collection"]').dataset.modalOpen
        const moduleId = document.querySelector('[data-modal="create-collection"]').dataset.moduleId

        const data = getFormValue(el)

        delete data._handler
        const collection = await request('createCollectionForModule', data)

        const res = await request('getModule', {id: moduleId})
        res.collectionId = collection.id

        request('updateModule', res)
    }
}
//#endregion
function initModals(doc) {
    doc.querySelectorAll('[data-modal]').forEach(el => {
        el.addEventListener('click', () => {
            delete el.dataset.modalOpen
        })

        el.querySelector('[data-modal-content]').addEventListener('click', e => {
            e.stopPropagation()
        })

    })

}


//#region Helpers
function getParentModule(el) {
    if(el.dataset.moduleId) return el;
    return getParentModule(el.parentElement)
}

function initAction(el, ev) {
    let actionFn;

    const actionName = el.dataset.action
    if(actionName.includes('.')) {
        const [controller, action] = actionName.split('.')
        actionFn = actions[controller][action]
    } else {
        actionFn = actions[actionName]
    }
    if(!actionFn) {
        console.log('action not found: ' + actionName)
        return;
    }

    const actionType = el.dataset.trigger ?? 'click'
    if(actionType === 'load') {
        actionFn(el)
    } else {
        el.addEventListener(actionType, (ev) => {
            if(actionType === 'submit') {
                ev.preventDefault()
            }
            actionFn(el)
        })
    }
} 
function initActions(element) {
    console.log('init actions')
    if(element.dataset?.action) {
        initAction(element)
    }
    element.querySelectorAll("[data-action]").forEach((el) => initAction(el))
}

async function request(handler, body) {
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

function getFormValue(formEl) {
    const form = new FormData(formEl);

    const body = {};

    for (let [key, value] of form.entries()) {
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

    return body;
}


function initForm(formEl) {
    if(formEl.dataset.load) {
        request(formEl.dataset.load, {
            id: formEl.dataset.id
        }).then(res => {
            delete formEl.dataset.load
            delete formEl.dataset.id
            setFormValue(formEl, res)
        })
    }

    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const body = getFormValue(e.target)

        const handler = body._handler;
        delete body._handler
        
        const res = await request(handler, body);
        if(res.pageReload) {
            reload(window.location.href)
        } else if(res.redirect) {
            reload(res.redirect)
        }
    });
}

function initFileUploaders() {
    document.querySelectorAll('[data-file]').forEach(el => {
        const name = el.getAttribute('name')
        el.removeAttribute('name')
        const element =document.createElement('input')
        element.setAttribute('name', name) 
        element.setAttribute('type', 'hidden') 
        
        el.parentElement.insertBefore(element, el)
        el.addEventListener('change', async event => {
            const form = new FormData()
            form.set('file', el.files[0])
            const res = await fetch('/api/file/upload', {method: 'POST', body: form}).then(res => res.json())

            el.dataset.fileId = res.id
            element.value = res.id
        })
    })

}

function initLink(el) {
    el.addEventListener('click', (e) => {
        e.stopPropagation()
        e.preventDefault()
        reload(el.getAttribute('href'))
    })
}

function initLinks(element) {
    element.querySelectorAll('a[data-enhance]').forEach(el => {
        initLink(el)
    })
}

function initForms(element) {
    element.querySelectorAll('[data-form]:not([data-trigger="submit"]').forEach(el => {
        initForm(el)
    })
}

function flatObject(object, prefix = '') {
    let flat = {}
    for(let key in object) {
        if(typeof object[key] =='object') {
            const flatted = flatObject(object[key], prefix + key + '.')
            for(let k in flatted) {
                flat[k] = flatted[k]
            }
        } else {
            flat[prefix + key] = object[key]
        }
    }
    return flat;
}

function setFormValue(form, value) {
    let formValue = flatObject(value)    

    if(!form) return;
    form.querySelectorAll('[name]').forEach(input => {
        const name = input.getAttribute('name')
        if(formValue[name]) {
            input.value = formValue[name]
        }
    })
}
//#endregion


function ContentTypeField(contentType, index) {
    return `
        <div data-content-type-field-row>
            <label data-label>
                <span data-label-text>Name</span>
                <input data-input name="contentType.${index}.name" placeholder="Enter Field name" />
            </label>
            <label data-label>
                <span data-label-text>Slug</span>
                <input data-input name="contentType.${index}.slug" placeholder="Enter Field slug" />
            </label>
            <button data-id="contentType-${index}" type="button" data-button data-button-color="primary" style="margin-top: 20px">Remove</button>                    
        </div>
    `
}

async function reloadIframe() {
    if(!iframeElement) {
        return reload(window.location.href)   
    }

    const res = await fetch(window.location.href.replace('mode=edit', 'mode=preview')).then(res => res.text())
    const template = document.createElement('template')
    template.innerHTML = res
    
    iframeElement.contentDocument.querySelector('[data-body]').innerHTML = template.content.querySelector('[data-body]').innerHTML

    setTimeout(() => {
        initIframe()
    })
}

async function reload(url) {
    history.pushState({}, {}, url)
    const res = await fetch(url).then(res => res.text())
    const template = document.createElement('template')
    template.innerHTML = res
    
    document.querySelector('[data-body]').innerHTML = template.content.querySelector('[data-body]').innerHTML

    setTimeout(() => {
        init()
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

function getElement(str) {
    const el = document.createElement('template')
    el.innerHTML = str

    return el.content.cloneNode(true)
}

function initIframe() {
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

    initActions(iframeElement.contentDocument)
    initLinks(iframeElement.contentDocument)
    initForms(iframeElement.contentDocument)
    initModals(iframeElement.contentDocument)
    initFileUploaders(iframeElement.contentDocument)

}

function init() {
    iframeElement = document.querySelector('iframe')
    sidebarElement = document.querySelector('[data-sidebar]')

    const definitionsElement = document.querySelector('[data-definitions]')
    Sortable.get(definitionsElement)?.destroy()

    if(iframeElement) {
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
                updateModules()
            }
        })
    }

    initActions(document)
    initForms(document)
    initLinks(document)
    initModals(document)
    initFileUploaders(document)
    
    if(iframeElement) {
        iframeElement.onload = () => {
            initIframe()
        }
    }
}

init()
