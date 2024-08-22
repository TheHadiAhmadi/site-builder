import { getFormValue, request, setFormValue } from "./form.js"
import { getParentModule, reload } from "./helpers.js"
import { hydrate } from "./hydrate.js"
import { updateModules } from "./sortable.js"


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
    async 'module-add-field-choose-type'(el) {
        const value = el.dataset.value

        const modal = document.querySelector(`[data-modal="field"]`)

        const formHtml = await request('definition.getFieldForm', {
            type: value,
            handler: 'definition.addField',
            mode: 'add',
            id: modal.dataset.id
        })

        modal.querySelector('[data-modal-title]').textContent = 'Add ' + value
        modal.querySelector('[data-modal-body]').innerHTML = formHtml

        setTimeout(() => {
            const el = modal.querySelector('[data-modal-body]')
            hydrate(el)
        })
    },
    async 'open-module-add-prop-modal'(el) {
        const modal = document.querySelector(`[data-modal="field"]`)
        modal.dataset.id = modal.querySelector('[name="id"]').value

        modal.querySelector('[data-modal-body]').innerHTML = ''
        const html = await request('definition.getFieldTypeSelector', {})

        modal.querySelector('[data-modal-title]').textContent = 'Choose a type'
        modal.querySelector('[data-modal-body]').innerHTML = html
        modal.dataset.modalOpen = true

        setTimeout(() => {
            const el = modal.querySelector('[data-modal-body]')
            hydrate(el)
        })
    },
    async 'open-add-field-modal'(el) {
        const modal = document.querySelector(`[data-modal="field"]`)
        modal.dataset.id = modal.querySelector('[name="id"]').value

        modal.querySelector('[data-modal-body]').innerHTML = ''
        const html = await request('collection.getFieldTypeSelector', {})

        modal.querySelector('[data-modal-title]').textContent = 'Choose a type'
        modal.querySelector('[data-modal-body]').innerHTML = html
        modal.dataset.modalOpen = true

        setTimeout(() => {
            const el = modal.querySelector('[data-modal-body]')
            hydrate(el)
        })
    },
    async 'add-field-choose-type'(el) {
        const value = el.dataset.value

        const modal = document.querySelector(`[data-modal="field"]`)

        const formHtml = await request('collection.getFieldForm', {
            type: value,
            handler: 'collection.addField',
            mode: 'add',
            id: modal.dataset.id
        })

        modal.querySelector('[data-modal-title]').textContent = 'Add ' + value
        modal.querySelector('[data-modal-body]').innerHTML = formHtml

        setTimeout(() => {
            const el = modal.querySelector('[data-modal-body]')
            hydrate(el)
        })
        
    },
    async 'open-update-module-ai-modal'(el) {
        document.querySelector('[data-modal="update-ai"]').dataset.modalOpen = true

        setTimeout(() => {
            document.querySelector('[data-modal="update-ai"]').dataset.modalOpen = true

        }, 100)
        
    },
    async 'open-create-module-ai-modal'(el) {
        document.querySelector('[data-modal="create-ai"]').dataset.modalOpen = true

        setTimeout(() => {
            document.querySelector('[data-modal="create-ai"]').dataset.modalOpen = true

        }, 100)
        
    },
    async 'open-seo-update-ai-modal'(el) {
        document.querySelector('[data-modal="seo-ai"]').dataset.modalOpen = true

        setTimeout(() => {
            document.querySelector('[data-modal="seo-ai"]').dataset.modalOpen = true
        }, 100)
    },
    async 'open-edit-field-modal'(el) {
        const field = el.dataset
        
        const modal = document.querySelector(`[data-modal="field"]`)
        modal.dataset.id = modal.querySelector('[name="id"]').value
        
        const formHtml = await request('collection.getFieldForm', {
            type: field.type,
            handler: 'collection.setField',
            mode: 'edit',
            id: modal.dataset.id
        })

        modal.querySelector('[data-modal-title]').textContent = 'Edit ' + field.type
        modal.querySelector('[data-modal-body]').innerHTML = formHtml
        modal.dataset.modalOpen = true

        setTimeout(() => {
            const el = modal.querySelector('[data-modal-body]')
            hydrate(el)
            
            setFormValue(modal.querySelector('[data-form]'), field)
        })
    },
    async 'module-open-edit-field-modal'(el) {
        const field = el.dataset
        
        const modal = document.querySelector(`[data-modal="field"]`)
        modal.dataset.id = modal.querySelector('[name="id"]').value
        
        const formHtml = await request('definition.getFieldForm', {
            type: field.type,
            handler: 'definition.setField',
            mode: 'edit',
            id: modal.dataset.id
        })

        modal.querySelector('[data-modal-title]').textContent = 'Edit ' + field.type
        modal.querySelector('[data-modal-body]').innerHTML = formHtml
        modal.dataset.modalOpen = true

        setTimeout(() => {
            const el = modal.querySelector('[data-modal-body]')
            hydrate(el)
            
            setFormValue(modal.querySelector('[data-form]'), field)
        })
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
    'open-add-module'(el, ev) {
        ev.stopPropagation()
        let sidebarElement = document.querySelector('[data-sidebar]')

        sidebarElement.dataset.active = 'modules'
    },
    async 'toggle-full-width'(el, ev) {
        ev.stopPropagation()
        const mod = getParentModule(el)

        const section = mod.querySelector('[data-section]')
        const isFullWidth = section.hasAttribute('data-section-full-width')
        await request('module.saveSettings', {
            id: mod.dataset.moduleId,
            slug: decodeURIComponent(location.pathname),
            fullWidth: !isFullWidth,
            paddingTop: +section.style.paddingTop.replace('px', ''),
            paddingBottom: +section.style.paddingBottom.replace('px', ''),
        })
    },
    async 'open-module-settings'(el, ev) {
        ev.stopPropagation()

        const mod = getParentModule(el)
        const moduleId = mod.dataset.moduleId
        document.querySelector('iframe').contentDocument.querySelectorAll('[data-module-id][data-active]').forEach(el => {
            delete el.dataset.active
        })

        mod.dataset.active = true

        // reload(`?mode=edit&moduleId=` + moduleId)
        const settings = await request('module.loadSettings', {id: moduleId, slug: decodeURIComponent(location.pathname)})
        const template = await request('module.getSettingsTemplate', {id: moduleId})
        const moduleSettingsSidebar = document.querySelector('[data-name="sidebar-module-settings"]')
        moduleSettingsSidebar.innerHTML = template

        settings.slug = decodeURIComponent(location.pathname)
        setFormValue(moduleSettingsSidebar, settings)
        delete moduleSettingsSidebar.querySelector('[data-form]').dataset.load
        document.querySelector('[data-sidebar]').dataset.active = 'module-settings'
        setTimeout(() => {
            // (moduleSettingsSidebar)
            hydrate(moduleSettingsSidebar)
        })
    },
    async 'add-section'(el, ev) {
        ev.stopPropagation()
        // const order = el.dataset.order

        function getPageId() {
            return document.querySelector('iframe').contentDocument.querySelector('[data-body]').dataset.pageId
        }

        function getIndex() {
            const mod = getParentModule(el);
            return [...mod.parentElement.children].indexOf(mod) + 1
        }
        await request('module.createSection', {
            pageId: getPageId(),
            order: el.dataset.order ?? getIndex(),
        })
        await updateModules()
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
    async 'choose-collection-filters'(el) {
        const modal = document.querySelector(`[data-modal="relation-field-modal"]`)
        const fieldName = modal.dataset.fieldName
        const fieldMultiple = modal.dataset.fieldMultiple
        
        delete modal.dataset.modalOpen

        const dataTable = modal.querySelector('[data-data-table]')
        const filters = JSON.parse(dataTable.dataset.filters ?? '[]')
        const perPage = +dataTable.querySelector('[name="perPage"]').value
        const page = 1

        const result = {filters}

        if(fieldMultiple) {
            result.page = page
            result.perPage = perPage
        }
        const input = document.querySelector(`[data-form] [name="${fieldName}"]`)
        
        input.value = JSON.stringify(result)

        const el2 = input.nextElementSibling

        function hasValue(item) {
            if(Array.isArray(item.value) && item.value.length === 0) return false;
            return item.value !== ''
        }            
        let filters2 = filters.filter(x => hasValue(x))
        if(!filters2.length) {
            el2.innerHTML = '<span data-badge>All Items</span>'
        } else {
            el2.innerHTML = `<div data-stack>${filters2.map(x => `<span data-badge>${x.field} ${x.operator} ${x.value}</span>`).join('')}</div>`
        }
    },
    async 'choose-collection-items'(el) {
        const modal = document.querySelector(`[data-modal="relation-field-modal"]`)
        const fieldName = modal.dataset.fieldName
        const fieldMultiple = modal.dataset.fieldMultiple
        
        delete modal.dataset.modalOpen

        const input = document.querySelector(`[data-form] [name="${fieldName}"]`)
        const el2 = input.nextElementSibling


        if(fieldMultiple === "true") {
            let itemIds = [...modal.querySelectorAll('td [data-checkbox]')].filter(x => x.checked).map(item => item.value)
            input.value = JSON.stringify(itemIds)
            if(itemIds.length === 0) {
                el2.innerHTML = `<span data-badge>No Items</span>`
            } else {
                el2.innerHTML = `<div data-stack>${itemIds.map(x => `<span data-badge>${x}</span>`).join('')}</div>`
            }
            
        } else {
            const itemId = modal.querySelector('input[name="data-table-select"]:checked').value;
            input.value = itemId
            el2.innerHTML = `<span data-badge>${itemId}</span>`

        }

    },
    async 'open-relation-modal'(el) {
        const fieldName = el.dataset.fieldName
        const collectionId = el.dataset.collectionId

        const fieldMultiple = el.dataset.fieldMultiple  == 'true'
        let value = el.nextElementSibling.value
        console.log({value})
        if(value.startsWith('{') ||value.startsWith('[') ) {
            value = JSON.parse(value)
        }

        let filters = []
        let page = 1
        let perPage = 10

        if(value.filters) {
            filters = value.filters

            if(fieldMultiple) {
                page = value.page
                perPage = value.perPage
            }            
        }

        const html = await request('table.load', {
            filters, 
            perPage, 
            selectable: fieldMultiple ? 'multi' : 'single', 
            page, 
            actions: [],
            collectionId
        })

        const modal = document.querySelector(`[data-modal="relation-field-modal"]`)
        modal.dataset.fieldName = fieldName
        modal.dataset.fieldMultiple = fieldMultiple

        modal.querySelector('[data-modal-body]').innerHTML = html
        modal.dataset.modalOpen = true

        setTimeout(() => {
            hydrate(modal.querySelector('[data-modal-body]'))
            setTimeout(() => {

                if(value) {
                    console.log(fieldMultiple)
                    
                    if(!value.filters) {
                        if(fieldMultiple) {
                            for(let item of value) {
                                console.log(item, modal.querySelectorAll(`[name="data-table-select"]`).forEach(el => el.value))
                                modal.querySelector(`[name="data-table-select"][value="${item}"]`).click()
                            }
                        } else {
                            console.log(value, modal.querySelectorAll(`[name="data-table-select"]`).forEach(el => el.value))

                            modal.querySelector(`[name="data-table-select"][value="${value}"]`).click()
                        }
                    }
                }
            })
        })


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
        actionFn(el, null)
    } else {
        el.addEventListener(actionType, (ev) => {
            if(actionType === 'submit') {
                ev.preventDefault()
            }
            actionFn(el, ev)
        })
    }
}