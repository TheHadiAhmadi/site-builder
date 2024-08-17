import { html } from "svelite-html";
import { Button, Checkbox, EmptyTable, Stack, Table } from "../components.js";

export function DataTable({filters = [], selectable, items, collectionId, fields, actions = ['edit', 'delete']}) {
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
        if(field.type === 'textarea') return item[field.slug] ? item[field.slug].slice(0, 100) + (item[field.slug].length > 100 ? '...' : '') : ''
        if(field.type === 'checkbox') return item[field.slug] ? 'Yes' : 'No'
        if(field.type === 'select') return `<span data-badge>${item[field.slug]}</span>`
        if(field.type === 'file') {
            console.log(field, item)
            
            function renderFile(file) {
                if(field.file_type == 'image') {
                    return `
                        <a href="/files/${file.id}" style="max-height: 40px; overflow: hidden">
                            <img src="/files/${file.id}" style="width: 64px; height: auto"/>
                        </a>
                    `
                }
    
                const file_icons = {
                    video: '<svg data-file-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m14 2l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4 18V9h-5V4H6v16zm-2-2l-2.5-1.7V18H8v-5h5.5v1.7L16 13z"/></svg>',
                    document: '<svg data-file-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 2h7v5h5v11H6zm2 8v2h8v-2zm0 4v2h5v-2z"/></svg>',
                    all: '<svg data-file-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm4 18H6V4h7v5h5z"/></svg>',
                }
                
                return `
                    <div data-file-item>
                        <svg data-download-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z"/></svg>
                        ${file_icons[field.file_type]}
                        <div>
                            ${file.name ?? 'Download'}
                        </div>
                    </div>
                `
            }

            if(field.multiple && Array.isArray(item[field.slug])) {
                return Stack({}, item[field.slug].map(x => renderFile(x)))
            }

            return renderFile(item[field.slug])
        }
        if(field.type === 'rich-text') return '...'
        if(field.type === 'relation') {
            if(!item[field.slug]) return ''

            console.log(item, item[field.slug])
            if(item[field.slug].filters) {
                return Stack({}, item[field.slug].filters.map(x => `<span data-badge>${x.field} ${x.operator} ${x.value}</span>`))
            } else {
                if(field.multiple) {
                    return Stack({}, item[field.slug].map(x => `<a href="?mode=edit&view=collection-data-update&collectionId=${field.collectionId}&id=${x}" data-badge>${x}</a>`))
                } else {
                    return `<a href="?mode=edit&view=collection-data-update&collectionId=${field.collectionId}&id=${item[field.slug]}" data-badge>${item[field.slug]}</a>`
                }
            }
        }
    }

    let content;
    
    console.log(items)
    if(items.data.length) {
        content = Table({
            head: [
                selectable === 'multi' ? `<th style="width: 0"><input type="checkbox" name="select-all" data-checkbox/></th>` : (selectable === 'single' ?  '<th style="width: 0"></th>' : ''), 
                fields.map(x => `<th>${x.label}</th>`).join('')
            ].join(''),
            body: items.data.map(item => html`
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
        if(field.type === 'checkbox') {
            return `
                <div style="display: flex; flex-direction: column; gap: 8px">
                    ${[{key: "true", text: 'True'}, {key: "false", text: 'False'}].map(item => `
                        <div data-dropdown-item>
                            ${Checkbox({
                                multiple: true,
                                name: 'filters.' + field.slug, 
                                label: item.text, 
                                checked: filtersObject[field.slug]?.includes(item.key),
                                value: item.key
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
        const hasFilter = ['select', 'checkbox'].includes(field.type) ? filtersObject[field.slug]?.length : filtersObject[field.slug]
        let filterValue;
        
        if(field.type === 'select') {
            filterValue = filtersObject[field.slug]?.length + ' Items'
        } else if(field.type === 'Checkbox') {
            filterValue = filtersObject[field.slug].join(' or ')
        } else {
            filterValue = filtersObject[field.slug]
        }
        
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
                        <option ${items.perPage == 5 ? 'selected' : ''} value="5">5</option>
                        <option ${items.perPage == 10 ? 'selected' : ''} value="10">10</option>
                        <option ${items.perPage == 25 ? 'selected' : ''} value="25">25</option>
                        <option ${items.perPage == 50 ? 'selected' : ''} value="50">50</option>
                        <option ${items.perPage == 100 ? 'selected' : ''} value="100">100</option>
                    </select>
                    entries
                </div>
                <div>PAGINATION</div>
            </div>
        </div>
    `
     
            
}