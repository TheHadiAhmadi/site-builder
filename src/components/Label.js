import { html } from "svelite-html"
import { attributes } from "#helpers"

export function Label({text, hidden, body, inline = false, symbolic = false}) {
    const attrs = attributes({
        'data-label-inline': inline,
        'data-label': inline === false,
        'data-hidden': hidden
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
