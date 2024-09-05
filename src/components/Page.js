import { html } from "svelite-html";

export function Page({id, title, back, backText = 'Back', actions, body}) {
    return html`
        <div data-page data-mode-${id}>
            <div data-content-header>
                <div>
                    ${back ? `<a data-page-back href="${back}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m7.825 13l5.6 5.6L12 20l-8-8l8-8l1.425 1.4l-5.6 5.6H20v2z"/></svg>
                        ${backText}
                    </a>` : ''}
                    <h2 data-header-title>${title}</h2>
                </div>
                <div data-header-actions>
                    ${actions}
                </div>
            </div>
            ${body}
        </div>
    `
}