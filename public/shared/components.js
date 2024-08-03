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

export function Label({text, body, inline = false, symbolic = false}) {
    let tag = symbolic ? 'div' : 'label'
    if(inline)
        return `
            <${tag} data-label-inline>
                ${body}
                <span data-label-text>
                    ${text}
                </span>
            </${tag}>
        `

    return `
        <${tag} data-label>
            <span data-label-text>
                ${text}
            </span>
            ${body}
        </${tag}>
    `
}

export function Input({name, placeholder, label}) {
    return Label({
        text: label,
        body: `<input data-input name="${name}" placeholder="${placeholder}"/>`
    })
}

export function Select({name, placeholder, label, items = []}) {
    function getText(option) {
        return typeof option === 'object' ? option.text : option
    }
    function getValue(option) {
        return typeof option === 'object' ? option.value : option
    }
    return Label({
        text: label,
        body: `<select data-select name="${name}">
            ${placeholder ? `<option value="null" selected>${placeholder}</option>` : ''}
            ${items.map(option => `<option value="${getValue(option)}">${getText(option)}</option>`)}
        </select>`
    })
}

export function Textarea({name, placeholder, label, rows = 5}) {
    return Label({
        text: label,
        body: `<textarea data-textarea rows="${rows}" name="${name}" placeholder="${placeholder}"></textarea>`
    })
}

export function Checkbox({name, label}) {
    return Label({
        inline: true,
        text: label,
        body: `<input ${checked ? 'checked' : ''} type="checkbox" data-checkbox rows="${rows}" name="${name}" value="true"/>`
    })
}

export function Form({name ='', handler, fields, cancelAction, load, id, onSubmit}) {
    return `
        <form${onSubmit ? ` data-action="${onSubmit}" data-trigger="submit"` : ''} data-form="${name}" ${load ? `class="loading" data-action="${load}" data-trigger="load" data-id=${id}` : ''}>
            <input type="hidden" name="_handler" value="${handler}"/>
            ${fields}
            <div data-form-actions>
                ${Button({text: 'Cancel', type: 'button', color: 'default', action: cancelAction})}
                ${Button({text: 'Submit', type: 'submit', color: 'primary'})}
            </div>
        </form>
    `
}

export function Button({href, text, color, action, type="button"}) {
    if(href) {
        return `<a href="${href}" data-button data-button-color="${color}">${text}</a>`

    }
    return `<button type="${type}" data-button data-button-color="${color}" data-action="${action}">${text}</button>`
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

export function EmptyTable({title, description, body = ''}) {
    return `
        <div data-empty-table>
            <div data-empty-table-title>${title}</div>
            <div data-empty-table-description>${description}</div>
            <div style="padding-top: 1rem">${body}</div>
            
        </div>
    `
}


export function Modal({name = '', title, footer, body}) {
    return `<div data-modal="${name}">
        <div data-modal-content>

            ${title ? `
                <div data-modal-header>
                    <div data-modal-title>${title}</div>
                </div>
            ` : ''}
            <div data-modal-body>${body}</div>
            ${footer ? `<div data-modal-footer>${footer}</div>` : ''}
        </div>
    </div>`
}