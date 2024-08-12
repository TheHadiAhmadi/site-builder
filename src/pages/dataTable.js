import { html } from "svelite-html";
import { Button, Checkbox, EmptyTable, Stack, Table } from "../components.js";

export function DataTable({filters = [], selectable, perPage = 10, page = 1, items, collectionId, fields, actions = ['edit', 'delete']}) {
    const filtersObject = filters.reduce((prev, curr) => {
        return {...prev, [curr.field]: curr.value}
    }, {})


    const ActionButtons = (item) => {
        return Stack({}, actions.map(action => {
            if(action === 'edit') {
                return Button({
                    text: 'Edit',
                    href: "?mode=edit&view=collection-data-update&id=" + item.id,
                    outline: true,
                    size: 'small',
                    color: 'primary'
                })
            } else if(action === 'delete') {
                return Button({
                    text: 'Delete',
                    action: 'delete-content',
                    outline: true,
                    size: 'small',
                    color: 'danger',
                    dataset: {
                        id: item.id
                    }
                })
            } else {
                return Button({
                    size: 'small',
                    outline: true,
                    ...action,
                    dataset: {
                        id: item.id,
                        ...(action.dataset ?? {})
                    }
                })
            }
        }))
    }
    
    function renderField(item, field) {
        if(field.type === 'input') return item[field.slug]
        if(field.type === 'textarea') return item[field.slug].slice(0, 100) + (item[field.slug].length > 100 ? '...' : '')
        if(field.type === 'checkbox') return item[field.slug] ? 'Yes' : 'No'
        if(field.type === 'select') return `<span data-badge>${item[field.slug]}</span>`
        if(field.type === 'file') return `<div>FILE${item[field.slug]}</div>`
        if(field.type === 'relation') {
            if(!item[field.slug]) return ''
            if(field.multiple) {
                return Stack({}, item[field.slug].map(x => `<a href="?mode=edit&view=collection-data-update&collectionId=${field.collectionId}&id=${x}" data-badge>${x}</a>`))
            } else {
                return `<a href="?mode=edit&view=collection-data-update&collectionId=${field.collectionId}&id=${item[field.slug]}" data-badge>${item[field.slug]}</a>`
            }
        }
    }

    let content;
    
    if(items.length) {
        content = Table({
            head: [
                selectable === 'multi' ? `<th style="width: 0"><input type="checkbox" name="select-all" data-checkbox/></th>` : (selectable === 'single' ?  '<th style="width: 0"></th>' : ''), 
                fields.map(x => `<th>${x.label}</th>`).join('')
            ].join(''),
            body: items.map(item => html`
                <tr>
                    ${selectable ? `<td><input name="data-table-select" value="${item.id}" type="${selectable === 'multi' ? 'checkbox': 'radio'}" data-${selectable === 'multi' ? 'checkbox': 'radio'}/></td>` : ''}
                    ${fields.map(x => `<td>${renderField(item, x)}</td>`)}
                    <td>
                        ${ActionButtons(item)}
                    </td>
                </tr>
            `), 
        })
    } else {
        content = EmptyTable({
            title: 'No Items',
            description: "This collection doesn't have any items yet!"
        })
    }

    function FilterContent(field) {
        if(field.type === 'select') {
            return `
                <div style="display: flex; flex-direction: column; gap: 8px">
                    ${field.items.map(item => `
                        <div data-dropdown-item>
                            ${Checkbox({
                                multiple: true,
                                name: 'filters.' + field.slug, 
                                label: item, 
                                checked: filtersObject[field.slug]?.includes(item),
                                value: item
                            })} 
                        </div>
                    `).join('')}
                
                </div>
            `
        }
        if(field.type === 'input' || field.type === 'textarea') {
            return `
            <div data-dropdown-item>
                <input data-input name="filters.${field.slug}" placeholder="Search by ${field.label}..." value="${filtersObject[field.slug] ?? ''}"/>
            </div>
            `

        }
        return ''
    }

    function FilterButton(field) {
        const content = FilterContent(field)

        if(!content) return ''
        const hasFilter = field.type == 'select' ? filtersObject[field.slug]?.length : filtersObject[field.slug]
        const filterValue = field.type == 'select' ? filtersObject[field.slug]?.length + ' Items' : filtersObject[field.slug]
        
        return `
            <div data-dropdown data-dropdown-trigger="focus" data-dropdown-placement="start">
                <button type="button" ${hasFilter ? `data-data-table-button-has-value` : ''} data-data-table-filter-button data-dropdown-target>
                    ${field.label}${hasFilter ? `: ${filterValue}
                        <div data-data-table-filter-button-icon data-name="${field.slug}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"/></svg>
                        </div>
                    ` : ''}
                </button>
                <div data-dropdown-menu>
                    ${FilterContent(field)}
                    <div data-dropdown-item>
                        ${
                            Button({
                                type: 'submit',
                                text: 'Submit', 
                                block: true,
                                color: 'primary',
                                dataset: {
                                    search: true
                                }
                            })
                        }
                    </div>
                </div>
            </div>
        `
    }

    return html`
        <div data-data-table data-collection-id="${collectionId}" data-selectable="${selectable}">
            <form data-data-table-filters-form>
                <div data-data-table-filter-buttons>
                    ${fields.map(x => FilterButton(x))}
                </div>
                <div>
                    
                </div>
                    
            </form>

            ${content}
            <div style="display: flex; align-items: start; padding: 8px; justify-content: space-between">
                <div style="display: flex; align-items: center; gap: 8px">
                    Show 
                    <select style="width: max-content;" data-select name="perPage">
                        <option ${perPage == 5 ? 'selected' : ''} value="5">5</option>
                        <option ${perPage == 10 ? 'selected' : ''} value="10">10</option>
                        <option ${perPage == 25 ? 'selected' : ''} value="25">25</option>
                        <option ${perPage == 50 ? 'selected' : ''} value="50">50</option>
                        <option ${perPage == 100 ? 'selected' : ''} value="100">100</option>
                    </select>
                    entries
                </div>
                <div>PAGINATION</div>
            </div>
        </div>
    `
     
            
}