export function Page({id, title, actions, body}) {
    return `
        <div data-page data-mode-${id}>
            <div data-content-header>
                <h2 data-header-title>${title}</h2>
                <div data-header-actions>
                    ${actions}
                </div>
            </div>
            ${body}
        </div>
    `
}

export function Input({name, placeholder, label}) {
    return `
        <label data-label>
            <span data-label-text>${label}</span>
            <input data-input name="${name}" placeholder="${placeholder}"/>
        </label>
    `
}

export function Form({handler, fields, cancelAction}) {
    return `
        <form data-form>
            <input type="hidden" name="_handler" value="${handler}"/>
            ${fields}
            <div data-form-actions>
                ${Button({text: 'Cancel', type: 'button', color: 'default', action: cancelAction})}
                ${Button({text: 'Submit', type: 'submit', color: 'primary'})}
            </div>
        </form>
    `
}

export function Button({text, color, action, type="button"}) {
    return `<button type="${type}" data-button data-button-color="${color}" data-button-action="${action}" data-action="${action}">${text}</button>`
}

export function Table({items, head, row}) {
    return `
        <table data-table>
            <thead>
                <tr>
                    ${head}
                    <th style="width: 0;"></th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => row(item)).join('')}
            </tbody>
        </table>
    `
}

export function EmptyTable({title, description}) {
    return `
        <div data-empty-table>
            <div data-empty-table-title>${title}</div>
            <div data-empty-table-description>${description}</div>
        </div>
    `
}
