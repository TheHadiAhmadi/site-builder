import { html } from "svelite-html";
import { Label } from "./Label.js";
import { attributes } from "#helpers";

export function Input({name, type = 'text', placeholder, label, disabled}) {
    const attrs = attributes({
        'data-input': '',
        type,
        disabled,
        name,
        placeholder
    })

    return Label({
        text: label,
        body: html`<input${attrs}/>`
    })
}
