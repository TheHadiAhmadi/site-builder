import { attributes } from "#helpers";
import { Label } from "./Label.js";

export function Textarea({name, placeholder, label, rows = 5}) {
    const attrs = attributes({
        'data-textarea': '',
        rows,
        name,
        placeholder
    })
    return Label({
        text: label,
        body: `<textarea${attrs}></textarea>`
    })
}