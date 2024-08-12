import { getFormValue, request, setFormValue } from "./form.js"
import { hydrate } from "./hydrate.js";

export function DataTable(el) {
    const form = el.querySelector('[data-data-table-filters-form]')

    const selectAllCheckbox = el.querySelector('[data-checkbox][name="select-all"]')

    if(selectAllCheckbox) {
        const checkboxes = [...el.querySelectorAll('[data-table] tbody tr td [data-checkbox]')]

        selectAllCheckbox.addEventListener('change', (ev) => {
            checkboxes.forEach(el => el.checked = ev.target.checked)
        })

        checkboxes.forEach(el => {
            el.addEventListener('change', (value) => {
                const allCheckboxes = checkboxes.map(x => x.checked)

                if(allCheckboxes.some(x => !x) && allCheckboxes.some(x => !!x)) {
                    selectAllCheckbox.indeterminate = true   
                } else if(allCheckboxes[0] == true) {
                    selectAllCheckbox.indeterminate = false   
                    selectAllCheckbox.checked = true   
                } else {
                    selectAllCheckbox.indeterminate = false   
                    selectAllCheckbox.checked = false   
                }
            })
        })
    }    
    
    form.addEventListener('submit', (e) => {
        e.preventDefault()
        load()        
    })

    el.querySelector('[name="perPage"]').addEventListener('change', () => {
        load()
    })

    async function load() {
        const value = getFormValue(form)

        const collectionId = el.dataset.collectionId
        const selectable = el.dataset.selectable
        // const handler = el.dataset.handler

        const res = await request('table.load', {
            collectionId,
            selectable,
            filters: Object.keys(value.filters).map(x => ({field: x, operator: '=', value: value.filters[x]})),
            perPage: +(el.querySelector('[name=perPage]').value ?? '10'),
        })

        const template = document.createElement('template')
        template.innerHTML = res;
        
        el.innerHTML = template.content.querySelector('[data-data-table]').innerHTML

        setTimeout(() => {
            hydrate(el.parentElement)
        })
    }
    
    const filterCloseIcons = el.querySelectorAll('[data-data-table-filter-button-icon]')

    filterCloseIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation()
            const value = getFormValue(form)
            value.filters[icon.dataset.name] = ''
            setFormValue(el, value)
            load()
        })
    })
    
}