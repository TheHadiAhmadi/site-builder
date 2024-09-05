import {html} from 'svelite-html'
import { attributes } from '../helpers.js'
import { Stack } from './Stack.js';
import { Button } from './Button.js';
import { Card, CardBody } from './Card.js';


export function Form({name ='', handler, fields, cancelAction, startActions = [], cancelDataset = {}, cancelHref = undefined, load, id, onSubmit, card = true}) {

    const form = html`
        <form${onSubmit ? ` data-action="${onSubmit}" data-trigger="submit"` : ''} data-form="${name}" ${load ? `data-load="${load}" data-id=${id}` : ''}>
            <input type="hidden" name="_handler" value="${handler}"/>
            ${fields}
            ${Stack({justify: 'end'}, [
                startActions.join(''),
                `<div style="margin-inline-start: auto;"></div>`,
                (cancelAction || cancelHref) ? Button({text: 'Cancel', type: 'button', color: 'default', href: cancelHref, action: cancelAction, dataset: cancelDataset}) : "",
                Button({text: 'Submit', type: 'submit', color: 'primary'})
            ])}
        </form>
    `

    if(card) {
        return Card([
            CardBody([
                form
            ])
        ])
    }
    return form;
}







