import { getFormValue, request, setFormValue } from "./form.js"
import { hydrate } from "./hydrate.js";

export function DataTable(el) {
    const form = el.querySelector('[data-data-table-filters-form]')

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
        // const handler = el.dataset.handler

        const res = await request('table.load', {
            collectionId,
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