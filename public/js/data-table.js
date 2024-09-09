import { request } from "./request.js"
import { getFormValue, setFormValue } from "./helpers.js"
import { hydrate } from "./hydrate.js";

export function DataTable(el) {
    console.log("DataTable", el)
    const form = el.querySelector('[data-data-table-filters-form]')

    const selectAllCheckbox = el.querySelector('[data-checkbox][name="select-all"]')
    const tableRows = [...el.querySelectorAll('[data-table] tbody tr')]

    tableRows.forEach(el => {
        el.addEventListener('click', () => {
            el.querySelector('[data-checkbox]')?.click()
            el.querySelector('[data-radio]')?.click()
        })
    })

    if(selectAllCheckbox) {
        const checkboxes = [...el.querySelectorAll('[data-table] tbody tr td [data-checkbox]')]

        selectAllCheckbox.addEventListener('change', (ev) => {
            checkboxes.forEach(el => el.checked = ev.target.checked)
        })

        checkboxes.forEach(el => {
            el.addEventListener('click', (event) => {
                event.stopPropagation()
            })

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
    } else {
        tableRows.forEach(el => {
            el.addEventListener('click', () => {
                el.querySelector('[data-button]')?.click()
            })
            el.querySelectorAll('[data-button]').forEach(el => {
                el.addEventListener('click', (ev) => {
                    ev.stopPropagation()
                })
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
        const handler = el.dataset.handler

        const selectable = el.dataset.selectable
        const relationFilters = el.hasAttribute('data-relation-filters')
        // const handler = el.dataset.handler

        let filters = []

        for(let key in value.filters) {
            
            const filter = {
                field: key, 
                operator: value.filters[key].operator, 
            }

            if(Array.isArray(value.filters[key].value)) {
                if(value.filters[key].value.length > 0) {
                    filter.value = value.filters[key].value
                }
            } else {
                if(value.filters[key].value) {
                    filter.value = value.filters[key].value
                }
            }

            if(filter.value && filter.value != {}) {
                filters.push(filter)
            }
        }

        if(true) {
            const currentUrl = new URL(window.location.href);
            const searchParams = new URLSearchParams(currentUrl.search);

            // Add or update parameters
            filters.forEach(filter => {
                searchParams.set(filter.field, JSON.stringify(filter.value));
            });

            // Update the URL with new parameters
            currentUrl.search = searchParams.toString();

            // Push the updated URL to the history
            window.history.pushState({}, null, currentUrl.toString());
        }
        
        el.dataset.filters = JSON.stringify(filters)

        let res;
        if(collectionId) {
            res = await request('table.load', {
                collectionId,
                selectable,
                relationFilters,
                filters,
                page: 1,
                perPage: +(el.querySelector('[name=perPage]').value ?? '10'),
            })
        } else {

            res = await request(handler, {
                selectable,
                relationFilters,
                filters,
                page: 1,
                perPage: +(el.querySelector('[name=perPage]').value ?? '10'),
            })
        }

        const template = document.createElement('template')
        template.innerHTML = res;
        
        el.innerHTML = template.content.querySelector('[data-data-table]').innerHTML

        setTimeout(() => {
            delete el.parentElement.querySelector('[data-data-table]').dataset.datatableHydrated
            hydrate(el.parentElement.querySelector('[data-data-table]'))
        })
    }
    
    const filterCloseIcons = el.querySelectorAll('[data-data-table-filter-button-icon]')

    filterCloseIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation()
            const value = getFormValue(form)
            if(value.filters[icon.dataset.name].operator === 'in') {
                value.filters[icon.dataset.name].value = []
            } else {
                value.filters[icon.dataset.name].value = '';
            }
            setFormValue(el, value)
            load()
        })
    })
    
}