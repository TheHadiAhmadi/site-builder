import { html } from "svelite-html";
import { Button } from "./Button.js";
import { Label } from "./Label.js";

export function File({name, label, type, multiple, size = 'medium', hidden = false}) {
    let body;

    if(type === 'image') {
        body = `
            <label name="${name}" ${multiple ? 'data-multiple' : ''} data-file-label data-file-size="${size}" data-file-type="image">
                <div data-empty-mode>
                    ${Button({
                        color: 'primary', 
                        text: multiple ? 'Choose Images' : 'Choose Image'
                    })}
                </div>
                ${multiple ? '<div data-images></div>' : `<img data-image-preview /> <div data-file-remove>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 7L7 17M7 7l10 10"/>
                    </svg>
                </div>`}
                <input type="file" ${multiple ? 'multiple' : ''} data-file />
                
                ${multiple ? `<div data-add-more-wrapper>${Button({text: 'Add More', color: 'primary', dataset: {'add-more': ''}})}</div>` : ''}

            </label>
        `
    } else {
        body = html`
            <label name="${name}" ${multiple ? 'data-multiple' : ''} data-file-label data-file-type="${type}">
                <input type="file" ${multiple ? 'multiple' : ''} data-file />
                ${multiple ? '<div data-files></div>' : `<img data-file-preview /> <div data-file-remove>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 7L7 17M7 7l10 10"/>
                    </svg>
                </div>`}
                
                ${multiple ? `<div data-add-more-wrapper>${Button({text: 'Add More', color: 'primary', dataset: {'add-more': ''}})}</div>` : ''}

            </label>
        `
    }

    return Label({
        symbolic: true,
        hidden,
        text: label,
        body
    })
}
