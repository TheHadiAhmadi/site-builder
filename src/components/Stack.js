import { html } from "svelite-html"
import { attributes } from "#helpers"

export function Stack({vertical = false, wrap, justify, align, gap = 'md', ...rest}, body) {
    
    const attrs = attributes({
        ...rest,
        'data-stack': !vertical,
        'data-stack-gap': gap,
        'data-stack-vertical': !!vertical,
        'data-stack-justify': justify,
        'data-stack-align': align,
        'data-stack-wrap': wrap
    })

    return html`<div${attrs}>${body}</div>`
}