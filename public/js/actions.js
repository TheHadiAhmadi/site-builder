import { getFormValue, request, setFormValue } from "./form.js"
import { getParentModule, reload } from "./helpers.js"
import { hydrate } from "./hydrate.js"


function openConfirm({title, description, action, ...dataset}) {
    const confirm = document.querySelector('[data-delete-confirm]')

    confirm.dataset.open = true

    for(let key in dataset) {
        confirm.dataset[key] = dataset[key]
    }
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

        let body = {}

        for(let key in confirm.dataset) {
            body[key] = confirm.dataset[key]
        }
        delete body['deleteConfirm']
        delete body['handler']
        
        const handler = confirm.dataset.handler;

        request(handler, body)
    },
}

const modalActions = {
    open(el) {
        const modalName = el.dataset.modalName
        const modal = document.querySelector(`[data-modal="${modalName}"]`)
        modal.dataset.modalOpen = true
    },
    close() {
        const modal = document.querySelector(`[data-modal-open]`)
        delete modal.dataset.modalOpen
    }
}

const navigationActions = {
    navigate(el) {
        let sidebarElement = document.querySelector('[data-sidebar]')

        const path = el.dataset.path
        const [sidebar, view] = path.split('.')

        sidebarElement.dataset.active = sidebar
    },
    link(el) {
        reload(el.dataset.href)
    },
    'navigate-to-default-view'() {
        reload(window.location.pathname + '?mode=edit')
    }
}

const actions = {
    confirm: confirmActions,
    modal: modalActions,
    navigation: navigationActions,
    async 'unlink-module-prop'(el) {
        const prop = el.dataset.prop
        const moduleId = el.dataset.modId

        await request('module.unlinkProp', {prop, moduleId})
        document.querySelector('iframe').contentDocument.querySelector(`[data-module-id="${moduleId}"]`).click()

    },
    async 'link-module-prop'(el) {
        const prop = el.dataset.prop
        const moduleId = el.dataset.modId
        const field = el.dataset.field
        
        await request('module.linkProp', {prop, moduleId, field})
        document.querySelector('iframe').contentDocument.querySelector(`[data-module-id="${moduleId}"]`).click()

    },
    'change-dynamic-page-content'(el) {
        reload(el.value + '?mode=edit')
    },
    'add-field-next'(el) {
        
    },
    'add-field-choose-type'(el) {
        const value = el.dataset.value
        const id = el.dataset.id
        
        delete document.querySelector(`[data-modal-open]`).dataset.modalOpen

        const addFieldModal = document.querySelector(`[data-modal="field-add"]`)
        addFieldModal.dataset.modalOpen = true

        setFormValue(addFieldModal, {type: value})
        
        const typeInput = addFieldModal.querySelector(`[name="type"]`)

        typeInput.value = value
    },
    'open-edit-field-modal'(el) {
        const field = el.dataset
        const form = document.querySelector(`[data-modal="field-edit"]`)
        form.dataset.modalOpen = true

        setFormValue(form, field)

        

    },
    'delete-content'(el) {
        openConfirm({
            title: 'Are you sure?',
            description: 'Are you sure to remove this item?',
            action: 'content.removeCollectionContent',
            id: el.dataset.id
        })
    },
    'delete-settings-field'(el) {
        openConfirm({
            title: 'Are you sure?',
            description: 'Are you sure to remove this field?',
            action: 'definition.removeField',
            id: el.dataset.id,
            slug: el.dataset.slug
        })
    },
    'delete-field'(el) {
        openConfirm({
            title: 'Are you sure?',
            description: 'Are you sure to remove this field?',
            action: 'collection.removeField',
            id: el.dataset.id,
            slug: el.dataset.slug
        })
    },
    
    'close-sidebar': () => {
        let sidebarElement = document.querySelector('[data-sidebar]')

        delete sidebarElement.dataset.active        
    },
    'open-delete-module-confirm'(el) {
        const mod = getParentModule(el)
        // mod.querySelector(`[data-module-delete]`).classList.add('open')
        openConfirm({
            title: 'Are you sure?',
            description: "Are you sure to remove this module?",
            action: 'module.delete',
            id: mod.dataset.moduleId
        })
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
        const moduleId = mod.dataset.moduleId
        document.querySelector('iframe').contentDocument.querySelectorAll('[data-module-id][data-active]').forEach(el => {
            delete el.dataset.active
        })

        mod.dataset.active = true

        // reload(`?mode=edit&moduleId=` + moduleId)
        const settings = await request('module.loadSettings', {id: moduleId})
        const template = await request('module.getSettingsTemplate', {id: moduleId})
        const moduleSettingsSidebar = document.querySelector('[data-name="sidebar-module-settings"]')
        moduleSettingsSidebar.innerHTML = template

        settings.slug = location.pathname
        setFormValue(moduleSettingsSidebar, settings)
        delete moduleSettingsSidebar.querySelector('[data-form]').dataset.load
        document.querySelector('[data-sidebar]').dataset.active = 'module-settings'
        setTimeout(() => {
            // (moduleSettingsSidebar)
            hydrate(moduleSettingsSidebar)
        })
    },

    'open-table-modal'() {
        document.querySelector('[data-modal="table-modal"]').dataset.modalOpen = true
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
            initComponents(insertedElement)            
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
        initComponents(insertedElement)

    },
    'remove-field'(el) {
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

        request('module.update', res)
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

export function Action(el) {
    let actionFn;

    const actionName = el.dataset.action
    if(actionName.includes('.')) {
        const [controller, action] = actionName.split('.')
        actionFn = actions[controller][action]
    } else {
        actionFn = actions[actionName]
    }
    if(!actionFn) {
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