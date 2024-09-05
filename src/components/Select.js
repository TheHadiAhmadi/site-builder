import { html } from "svelite-html";
import { attributes, getText, getValue, isSelected } from "#helpers";
import { Label } from "./Label.js";

export function Select({name, placeholder, label, items = []}) {
    const attrs = attributes({
        'data-select': '',
        name
    })

    return Label({
        text: label,
        body: html`<select${attrs}>
            ${placeholder ? `<option value="null" selected>${placeholder}</option>` : ''}
            ${items.map(option => `<option ${isSelected(option) ? 'selected' : ''} value="${getValue(option)}">${getText(option)}</option>`)}
        </select>`
    })
}