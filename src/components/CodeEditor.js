import { attributes } from "#helpers";
import { Label } from "./Label.js";

export function CodeEditor({name, placeholder, readonly = false, disabled = false, label, lang = 'js'}) {
    const attrs = attributes({
        'data-code-editor': '',
        readonly,
        disabled,
        name,
        placeholder,
        lang
    })
    return Label({
        text: label,
        body: `<div${attrs}></div>`
    })
}