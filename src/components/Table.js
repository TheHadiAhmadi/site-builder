import { html } from "svelite-html"

export function Table({items, compact = false, head, row, body}) {
    return html`
        <div data-table-parent>
            <table data-table ${compact ? 'data-table-compact' : ''}>
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
