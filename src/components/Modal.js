import { html } from "svelite-html"
import { attributes } from "#helpers"

export function Modal({name = '', size = 'medium', title, footer, body}) {
    const attrs = attributes({
        'data-modal': name ?? '',
        'data-modal-size': size
    })
    return html`<div${attrs}>
        <div data-modal-content>
            <button data-modal-close-btn data-action="modal.close">
                <svg data-modal-close-icon xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 7L7 17M7 7l10 10"/></svg>   
            </button>
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