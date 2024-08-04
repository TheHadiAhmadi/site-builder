import {html} from 'svelite-html'

export function Page({id, title, actions, body}) {
    return html`
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
        body: `<input ${checked ? 'checked' : ''} type="checkbox" data-checkbox name="${name}" value="true"/>`
    })
}

export function File({name, label}) {
    return Label({
        text: label,
        body: `<input type="file" data-file name="${name}" /><div data-file-remove>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 7L7 17M7 7l10 10"/></svg>
        </div>`
    })
}

export function Form({name ='', handler, fields, cancelAction, load, id, onSubmit}) {
    return html`
        <form${onSubmit ? ` data-action="${onSubmit}" data-trigger="submit"` : ''} data-form="${name}" ${load ? `class="loading" data-load="${load}" data-id=${id}` : ''}>
            <input type="hidden" name="_handler" value="${handler}"/>
            ${fields}
            <div data-form-actions>
                ${Button({text: 'Cancel', type: 'button', color: 'default', action: cancelAction})}
                ${Button({text: 'Submit', type: 'submit', color: 'primary'})}
            </div>
        </form>
    `
}

export function Button({href, text, color, action, outline = false, size="medium", dataset = {} , type="button"}) {
    let attrs = ''
    for(let item in dataset) {
        if(dataset[item]) {
            attrs += `data-${item}="${dataset[item]}"`
        }
    }

    if(href) {
        return `<a href="${href}" ${attrs} ${outline ? 'data-button-outline' : ''} data-button-size="${size}" data-button data-button-color="${color}">${text}</a>`

    }
    return `<button type="${type}" ${attrs} ${outline ? 'data-button-outline' : ''} data-button-size="${size}" data-button data-button-color="${color}" data-action="${action}">${text}</button>`
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

export function Stack({body}) {
    return html`
        <div data-stack>
            ${body}
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

export function DeleteConfirm() {
    return `
        <div data-delete-confirm>
            <div data-confirm-body>
                <h3 data-confirm-title></h3>
                <p data-confirm-description></p>

                <div data-confirm-actions>
                    <button data-action="confirm.close" data-button data-button-block>No</button>
                    <button data-action="confirm.handle" data-button data-button-block data-button-color="danger">Yes</button>
                </div>
            </div>
        </div>
    `
}