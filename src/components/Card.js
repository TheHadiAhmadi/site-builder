import { html } from "svelite-html"

export function Card(body) {
    return html`<div data-card>${body}</div>`
}

export function CardBody(body) {
    return html`<div data-card-body>${body}</div>`
}
