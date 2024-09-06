import { getFormValue, request, setFormValue } from "./form.js"
import { getParentModule, reload, reloadIframe } from "./helpers.js"
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
    'navigate-back'() {
        history.back()
        setTimeout(() => {
            reload(window.location.href)
        }, 100)
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
    'open-create-block-modal'(el, ev) {
        ev.stopPropagation()
        const modal = document.querySelector('[data-modal="create-ai"]')
        modal.dataset.modalOpen = true

        const form = modal.querySelector('[data-form]')

        async function submit() {
            form.dataset.load = ''

            await request('ai.createModule', {
                name: form.querySelector('[name="name"]').value ?? '',
                image: form.querySelector('[name="image"]').value ?? '',
                template: form.querySelector('[name="template"]').value ?? ''
            }).then(async res => {
                delete modal.dataset.modalOpen
                delete form.dataset.load

                let body = { 
                    slug: window.location.pathname, 
                    definitionId: res.id, 
                    order: 1,
                    moduleId: el.parentNode.dataset.slot
                }

                await request('module.create', body)
                
                form.querySelector('[name="name"]').value = ''
                form.querySelector('[name="template"]').value = ''
                reload(window.location.href)
            })
        }
        async function onTextareaKeyDown(e) {
            if (e.keyCode === 13 && e.ctrlKey) {
                await submit()
            }
        }

        async function onButtonClick(ev) {
            ev.preventDefault()
            await submit()
        }

        const textarea = form.querySelector('[name="template"]')
        const submitButton = form.querySelector('button[type="submit"]')
        
        if(textarea.dataset.hydrated !== 'true') {
            textarea.dataset.hydrated = true
            textarea.addEventListener('keydown', onTextareaKeyDown)
        }

        if(submitButton.dataset.hydrated !== 'true') {
            submitButton.dataset.hydrated = true
            submitButton.addEventListener('click', onButtonClick)
        }
    },
    'change-dynamic-page-content'(el) {
        const view = new URL(window.location.href).searchParams.get('view') ?? ''
        reload('/admin?slug=' + encodeURIComponent(el.value) + (view ? '&view=' + view : ''))
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

        if(modal.querySelector('[name="id"]')?.value)
        {
            modal.dataset.id = modal.querySelector('[name="id"]')?.value
        }

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
    'open-user-edit'(el) {
        const userId = el.dataset.id

        reload('?view=settings.users.update&id=' + userId)
    },
    'open-user-delete'(el) {
        openConfirm({
            title: 'Are you sure?',
            description: 'Are you sure to remove this user?',
            action: 'user.delete',
            id: el.dataset.id
        })
        // reload('?view=user-edit&id=' + userId)
    },
    'open-role-edit'(el) {
        const roleId = el.dataset.id

        reload('?view=settings.roles.update&id=' + roleId)
    },
    'open-role-delete'(el) {
        openConfirm({
            title: 'Are you sure?',
            description: 'Are you sure to remove this role?',
            action: 'role.delete',
            id: el.dataset.id
        })
        // reload('?view=role-edit&id=' + roleId)
    },
    async 'logout'(el) {
        await fetch('/api/logout', {method: 'POST'}).then(res => reload('/'))
    },
    async 'open-filter-relation-table'(el) {
        const slug = el.dataset.slug
        const html = await request('table.load', {
            filters: [], 
            perPage: 10, 
            selectable: 'multi', 
            page: 1, 
            actions: [],
            collectionId: el.dataset.collectionId
        })
        const modal = document.querySelector(`[data-modal="relation-filter-modal"]`)
        modal.dataset.slug = slug
        modal.dataset.collectionId = el.dataset.collectionId

        modal.querySelector('[data-modal-body]').innerHTML = html
        modal.dataset.modalOpen = true

        setTimeout(() => {
            hydrate(modal.querySelector('[data-modal-body]'))
        })
    },
    async 'choose-filter-relation-items'(el) {
        const modal = document.querySelector(`[data-modal="relation-filter-modal"]`)
        modal.dataset.modalOpen = true

        let itemIds = [...modal.querySelectorAll('td [data-checkbox]')].filter(x => x.checked).map(item => item.value)
        
        const table = document.querySelector(`[data-page] > [data-data-table]`)

        const input = table.querySelector(`[name="filters.${modal.dataset.slug}.value"]`)
        input.value = JSON.stringify(itemIds)

        table.querySelector('[data-search]').click()

    },
    async 'choose-filter-relation-filters'(el) {
        const modal = document.querySelector(`[data-modal="relation-filter-modal"]`)
        modal.dataset.modalOpen = true
        const slug = modal.dataset.slug


        const dataTable = modal.querySelector('[data-data-table]')
        const filters = JSON.parse(dataTable.dataset.filters ?? '[]')
        const perPage = +dataTable.querySelector('[name="perPage"]').value
        const page = 1

        const result = {
            filters,
            page,
            perPage
        }

        const table = document.querySelector(`[data-page] [data-data-table]`)
        const input =  table.querySelector(`[name="filters.${slug}.value"]`)
        
        input.value = JSON.stringify(result)       
        table.querySelector('[data-search]').click() 
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
        const modal = document.querySelector('[data-modal="update-ai"]')
        modal.dataset.modalOpen = true

        const form = modal.querySelector('[data-form]')

        async function submit() {
            form.dataset.load = ''

            await request('ai.updateModule', {
                id: form.querySelector('[name="id"]').value,
                image: form.querySelector('[name="image"]').value,
                template: form.querySelector('[name="template"]').value ?? ''
            }).then(res => {
                modal.dataset.modalOpen
                delete form.dataset.load

                form.querySelector('[name="template"]').value = ''
                reload(window.location.href)
            })
        }
        async function onTextareaKeyDown(e) {
            if (e.keyCode === 13 && e.ctrlKey) {
                await submit()
            }
        }

        async function onButtonClick(ev) {
            ev.preventDefault()
            await submit()
        }

        const textarea = form.querySelector('[name="template"]')
        const submitButton = form.querySelector('button[type="submit"]')
        
        if(textarea.dataset.hydrated !== 'true') {
            textarea.dataset.hydrated = true
            textarea.addEventListener('keydown', onTextareaKeyDown)
        }

        if(submitButton.dataset.hydrated !== 'true') {
            submitButton.dataset.hydrated = true
            submitButton.addEventListener('click', onButtonClick)
        }
        
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
    'open-delete-module-confirm'(el, ev) {
        ev.stopPropagation()
        const mod = getParentModule(el)
        // mod.querySelector(`[data-module-delete]`).classList.add('open')
        openConfirm({
            title: 'Are you sure?',
            description: "Are you sure to remove this module?",
            action: 'module.delete',
            id: mod.dataset.moduleId
        })
    },
    'create-block-ai-modal-image-add'() {
        const form = document.querySelector('[data-modal="create-ai"] [data-form]')
        delete form.querySelector('[name="image"]').parentElement.parentElement.dataset.hidden
    },
    'update-block-ai-modal-image-add'() {
        const form = document.querySelector('[data-modal="update-ai"] [data-form]')
        delete form.querySelector('[name="image"]').parentElement.parentElement.dataset.hidden
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
    'open-edit-module-ai'(el) {
        document.querySelector('[data-modal="update-ai"]').dataset.modalOpen = true

        const definitionId = el.dataset.id

        const form = document.querySelector('[data-modal="update-ai"] [data-form]')
        setFormValue(form, { id: definitionId})


        async function onTextareaKeyDown(e) {
            if (e.keyCode === 13 && e.ctrlKey) {
                await submit()
            }
        }

        async function onButtonClick(ev) {
            ev.preventDefault()
            await submit()
        }

        const textarea = form.querySelector('[name="template"]')
        const submitButton = form.querySelector('button[type="submit"]')

        if(textarea.dataset.hydrated !== 'true') {
            textarea.dataset.hydrated = true
            textarea.addEventListener('keydown', onTextareaKeyDown)
        }

        if(submitButton.dataset.hydrated !== 'true') {
            submitButton.dataset.hydrated = true
            submitButton.addEventListener('click', onButtonClick)
        }
        

        async function submit() {
            form.dataset.load = ''

            await request('ai.updateModule', {
                id: definitionId,
                template: form.querySelector('[name="template"]').value ?? ''
            }).then(res => {
                delete document.querySelector('[data-modal="update-ai"]').dataset.modalOpen
                delete form.dataset.load

                form.querySelector('[name="template"]').value = ''
                reloadIframe()
            }) 
        }
    },
    async 'open-module-settings'(el, ev) {
        ev.stopPropagation()

        const mod = getParentModule(el)
        const moduleId = mod.dataset.moduleId

        if(document.querySelector('[data-page-edit-sidebar]').dataset.active && window.innerWidth < 768) {
            delete document.querySelector('[data-page-edit-sidebar]').dataset.active
            return;
        }
        if(!mod.dataset.active) {
            document.querySelector('iframe').contentDocument.querySelectorAll('[data-module-id][data-active]').forEach(el => {
                delete el.dataset.active
            })
    
            mod.dataset.active = true
            if(window.innerWidth < 768) {
                return;
            }

        }


        
        // reload(`?moduleId=` + moduleId)
        const settings = await request('module.loadSettings', {id: moduleId, slug: decodeURIComponent(location.pathname)})
        const template = await request('module.getSettingsTemplate', {id: moduleId})

        if(template.includes('This block doesn\'t have')) {
            return;
        }
        
        document.querySelector('[data-page-edit-sidebar]').dataset.active = true
        document.querySelector('[data-page-edit-sidebar]').dataset.mode = 'settings'

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
    'toggle-sidebar'() {
        const offcanvas = document.querySelector('[data-sidebar-offcanvas]')

        if(offcanvas.dataset.open) {
            delete offcanvas.dataset.open
        } else {
            offcanvas.dataset.open = true
        }
    },
    async 'add-section'(el, ev) {
        ev.stopPropagation()

        function getPageId() {
            return document.querySelector('[data-page-id]').dataset.pageId
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
    'open-add-block'(el, ev) {
        if(el.hasAttribute('data-slot-empty')) {
            el.dataset.active = true
        }
        ev.stopPropagation()
        document.querySelector('[data-page-edit-sidebar]').dataset.active = true       
        document.querySelector('[data-page-edit-sidebar]').dataset.mode = 'block'
    },
    'close-module-settings'(el, ev) {
        delete document.querySelector('[data-page-edit-sidebar]').dataset.active        
        document.querySelector('[data-page-edit-sidebar]').dataset.mode = 'block'

    },
    'hide-block-list'() {
        delete document.querySelector('[data-page-edit-sidebar]').dataset.active
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
    'delete-module'(el, ev) {
        ev.stopPropagation()
        openConfirm({
            title: 'Are you sure?',
            description: 'Are you sure to remove this module definition?',
            action: 'definition.delete',
            id: el.dataset.id
        })
    },
    'delete-page'(el) {
        openConfirm({
            title: 'Are you sure?',
            description: 'Are you sure to remove this page?',
            action: 'page.delete',
            id: el.dataset.id
        })
    },
    'delete-collection'(el) {
        openConfirm({
            title: 'Are you sure?',
            description: 'Are you sure to remove this collection?',
            action: 'collection.delete',
            id: el.dataset.id
        })
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
            el2.innerHTML = `<div data-stack>${filters2.map(x => `<span data-badge>${x.field}: ${x.value}</span>`).join('')}</div>`
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
                el2.innerHTML = `<div data-stack><span data-badge>${itemIds.length} Items</span></div>`
            }
            
        } else {
            const itemId = modal.querySelector('input[name="data-table-select"]:checked').value;
            input.value = itemId
            el2.innerHTML = `<span data-badge>${itemId}</span>`

        }

    },
    'set-theme'(el) {
        const theme = el.hasAttribute('data-theme-light') ? 'light' : 'dark'
        localStorage.setItem('THEME', theme)
        document.documentElement.dataset.theme = theme
    },
    async 'open-relation-modal'(el) {
        const fieldName = el.dataset.fieldName
        const collectionId = el.dataset.collectionId

        const fieldMultiple = el.dataset.fieldMultiple  == 'true'
        let value = el.nextElementSibling.value
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
                    
                    if(!value.filters) {
                        if(fieldMultiple) {
                            for(let item of value) {
                                modal.querySelector(`[name="data-table-select"][value="${item}"]`).click()
                            }
                        } else {
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