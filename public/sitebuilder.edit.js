//#region Globals
const iframeElement = document.querySelector('iframe')
const mainElement = document.querySelector('[data-main]')
const sidebarElement = document.querySelector('[data-sidebar]')

const actions = {
    'navigate-back'(el) {
        history.back()
    },
    navigate(el) {
        const path = el.dataset.path
        const [sidebar, view] = path.split('.')

        sidebarElement.dataset.active = sidebar
        if(view) {
            mainElement.dataset.active = view
        } else {
            delete mainElement.dataset.active
        }        
    },
    link(el) {
        window.location.href = el.dataset.href

    },
    'create-module': () => {
        mainElement.dataset.active = 'create-module'

        const definitionEl = getElement(createDefinitionTemplate())        
        mainElement.appendChild(definitionEl)
    },
    'close-sidebar': () => {
        delete sidebarElement.dataset.active        
    },
    'create-page': () => {
        mainElement.dataset.active = 'create-page'
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
    }
}
//#endregion

//#region Helpers
function getParentModule(el) {
    if(el.dataset.moduleId) return el;
    return getParentModule(el.parentElement)
}

function initActions(element) {
    element.querySelectorAll("[data-action]").forEach(el => {
        const actionType = el.dataset.trigger ?? 'click'
        el.addEventListener(actionType, () => {
            if(actions[el.dataset.action]) {
                actions[el.dataset.action](el)
            }
        })
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

function initForm(formEl) {
    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        
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
    
        const res = await request(handler, body);
        if(res.pageReload) {
            window.location.reload()
        } else if(res.redirect) {
            window.location.href = res.redirect
        }
    });
}

function initForms(element) {
    element.querySelectorAll('[data-form]').forEach(el => {
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
    const res = await fetch(window.location.href.replace('mode=edit', 'mode=preview')).then(res => res.text())
    iframeElement.contentDocument.documentElement.innerHTML = res

    setTimeout(() => {
        initIframe()
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
    initForms(iframeElement.contentDocument)
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
            updateModules()
        }
    })

    initActions(document)
    initForms(document)

    iframeElement.onload = () => {
        initIframe()
    }
}

init()
