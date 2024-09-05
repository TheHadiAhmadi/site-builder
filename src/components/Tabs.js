import { html } from "svelite-html";

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