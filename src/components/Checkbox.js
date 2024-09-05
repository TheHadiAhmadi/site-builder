import { attributes } from "#helpers";
import { Label } from "./Label.js";

export function Checkbox({name, checked, label, multiple, value = "true"}) {
    const attrs = attributes({
        'data-checkbox': '',
        checked,
        'data-checkbox-multiple': multiple,
        type: 'checkbox',
        name,
        value
    })
    return Label({
        inline: true,
        text: label,
        body: `<input${attrs}/>`
    })
}
