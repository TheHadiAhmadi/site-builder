import {html} from 'svelite-html'

function attributes(object) {
    let result = ''

    for(let key in object) {
        if(object[key]) {
            result += ` ${key}="${object[key]}"`
        }
    }
    
    return result; 
}

export function Card(body) {
    return html`<div data-card>${body}</div>`
}

export function CardBody(body) {
    return html`<div data-card-body>${body}</div>`
}

export function Page({id, title, back, actions, body}) {
    return html`
        <div data-page data-mode-${id}>
            ${back ? `<a data-page-back href="${back}">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m7.825 13l5.6 5.6L12 20l-8-8l8-8l1.425 1.4l-5.6 5.6H20v2z"/></svg>
                Back
            </a>` : ''}
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
    const attrs = attributes({
        'data-label-inline': inline,
        'data-label': inline === false,
    })
    
    let tag = symbolic ? 'div' : 'label'
    
    if(inline)
        return html`
            <${tag}${attrs}>
                ${body}
                <span data-label-text>
                    ${text}
                </span>
            </${tag}>
        `

    return html`
        <${tag}${attrs}>
            <span data-label-text>
                ${text}
            </span>
            ${body}
        </${tag}>
    `
}

export function Input({name, type = 'text', placeholder, label, disabled}) {
    return Label({
        text: label,
        body: `<input data-input type="${type}" ${disabled ? 'disabled' : ''} name="${name}" placeholder="${placeholder}"/>`
    })
}

export function Select({name, placeholder, label, items = []}) {
    function getText(option) {
        return typeof option === 'object' ? option.text : option
    }
    function getValue(option) {
        return typeof option === 'object' ? option.value : option
    }
    function isSelected(option) {
        return typeof option === 'object' && option.selected
    }
    return Label({
        text: label,
        body: `<select data-select name="${name}">
            ${placeholder ? `<option value="null" selected>${placeholder}</option>` : ''}
            ${items.map(option => `<option ${isSelected(option) ? 'selected' : ''} value="${getValue(option)}">${getText(option)}</option>`)}
        </select>`
    })
}

export function Textarea({name, placeholder, label, rows = 5}) {
    return Label({
        text: label,
        body: `<textarea data-textarea rows="${rows}" name="${name}" placeholder="${placeholder}"></textarea>`
    })
}

export function Checkbox({name, checked, label, multiple, value = "true"}) {
    return Label({
        inline: true,
        text: label,
        body: `<input ${checked ? 'checked' : ''} ${multiple ? `data-checkbox-multiple` : ''} type="checkbox" data-checkbox name="${name}" value="${value}"/>`
    })
}

export function File({name, label, type, multiple, size = 'medium'}) {
    let body;

    if(type === 'image') {
        body = `
            <label name="${name}" ${multiple ? 'data-multiple' : ''} data-file-label data-file-size="${size}" data-file-type="image">
                <div data-empty-mode>
                    ${Button({
                        color: 'primary', 
                        text: multiple ? 'Choose Images' : 'Choose Image'
                    })}
                </div>
                ${multiple ? '<div data-images></div>' : `<img data-image-preview /> <div data-file-remove>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 7L7 17M7 7l10 10"/>
                    </svg>
                </div>`}
                <input type="file" ${multiple ? 'multiple' : ''} data-file />
                
                ${multiple ? `<div data-add-more-wrapper>${Button({text: 'Add More', color: 'primary', dataset: {'add-more': ''}})}</div>` : ''}

            </label>
        `
    } else {
        body = `
            <label name="${name}" ${multiple ? 'data-multiple' : ''} data-file-label data-file-type="${type}">
                <input type="file" ${multiple ? 'multiple' : ''} data-file />
                ${multiple ? '<div data-files></div>' : `<img data-file-preview /> <div data-file-remove>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 7L7 17M7 7l10 10"/>
                    </svg>
                </div>`}
                
                ${multiple ? `<div data-add-more-wrapper>${Button({text: 'Add More', color: 'primary', dataset: {'add-more': ''}})}</div>` : ''}

            </label>
        `
    }

    return Label({
        symbolic: true,
        text: label,
        body
    })
}

export function Form({name ='', handler, fields, cancelAction, cancelDataset = {}, cancelHref = undefined, load, id, onSubmit, card = true}) {

    const form = html`
        <form${onSubmit ? ` data-action="${onSubmit}" data-trigger="submit"` : ''} data-form="${name}" ${load ? `data-load="${load}" data-id=${id}` : ''}>
            <input type="hidden" name="_handler" value="${handler}"/>
            ${fields}
            ${Stack({justify: 'end'}, [
                Button({text: 'Cancel', type: 'button', color: 'default', href: cancelHref, action: cancelAction, dataset: cancelDataset}),
                Button({text: 'Submit', type: 'submit', color: 'primary'})
            ])}
        </form>
    `

    if(card) {
        return Card([
            CardBody([
                form
            ])
        ])
    }
    return form;
}

export function Button({href, text, color, block, action, outline = false, size="medium", dataset = {} , type="button"}) {
    let attrs = ''
    for(let item in dataset) {
        if(dataset[item] != undefined) {
            attrs += `data-${item}="${dataset[item]}"`
        }
    }

    if(href) {
        return `<a data-enhance href="${href}" ${attrs} ${outline ? 'data-button-outline' : ''} data-button-size="${size}" data-button ${block ? 'data-button-block' : ''} data-button-color="${color}">${text}</a>`

    }
    return `<button type="${type}" ${attrs} ${outline ? 'data-button-outline' : ''} data-button-size="${size}" data-button ${block ? 'data-button-block' : ''} data-button-color="${color}" data-action="${action}">${text}</button>`
}

export function Table({items, head, row, body}) {
    return html`
        <div data-table-parent>
            <table data-table>
                <thead>
                    <tr>
                        ${head}
                        <th style="width: 0;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${body ? body : items.map(item => row(item)).join('')}
                </tbody>
            </table>
        </div>

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

export function Stack({vertical = false, wrap, justify, align, gap = 'md', ...rest}, body) {
    
    const attrs = attributes({
        ...rest,
        'data-stack': !vertical,
        'data-stack-gap': gap,
        'data-stack-vertical': vertical,
        'data-stack-justify': justify,
        'data-stack-align': align,
        'data-stack-wrap': wrap
    })

    return html`<div${attrs}>${body}</div>`
}

export function Modal({name = '', size = 'medium', title, footer, body}) {
    const attrs = attributes({
        'data-modal': name ?? '',
        'data-modal-size': size
    })
    return html`<div${attrs}>
        <div data-modal-content>
            ${title ? html`
                <div data-modal-header>
                    <div data-modal-title>${title}</div>
                </div>
            ` : ''}
            <div data-modal-body>${body}</div>
            ${footer ? html`<div data-modal-footer>${footer}</div>` : ''}
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

export function Tabs({ items, body }) {
    return html`
        <div data-tabs>
            <ul data-tabs-list>
                ${items.map((item, index) => `
                    <li data-tab="${index}" ${index === 0 ? 'data-tab-active' : ''}>
                        <button type="button" data-tab-trigger="${index}">
                            ${item}
                        </button>
                    </li>
                `).join('')}
            </ul>
            <div data-tabs-content>
                ${body.map((content, index) => `
                    <div data-tab-content="${index}" ${index === 0 ? 'data-tab-content-active' : ''}>
                        ${content}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

export function TabItem(content) {
    return html`${content}`;
}
