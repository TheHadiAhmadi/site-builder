import { request } from "./request.js";
import {setFormValue, getFormValue} from './helpers.js'

export function Form(el) {
    if(el.dataset.load) {
        request(el.dataset.load, {
            id: el.dataset.id
        }).then(res => {
            delete el.dataset.load
            delete el.dataset.id
            setFormValue(el, res)
        })
    }
    if(el.dataset.trigger != 'submit') {
        el.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const body = getFormValue(e.target)
            
            const handler = body._handler;
            delete body._handler
            
            const res = await request(handler, body);
        });
    }
}

export function FormInput(el) {
    console.log('FormInput')
    el.setValue = (val) => el.value = val
    el.getValue = () => el.value
}

export function FormTextarea(el) {
    el.setValue = (val) => el.value = val
    el.getValue = () => el.value
}

export function FormSelect(el) {
    el.setValue = (val) => el.value = val
    el.getValue = () => el.value
}

export function FormJson(el) {
    el.setValue = (val) => {
        if(el.hasAttribute('data-relation')) {
            const el2 = el.nextElementSibling
            const fieldValue = val
            if(fieldValue.filters) {
                function hasValue(item) {
                    if(Array.isArray(item.value) && item.value.length === 0) return false;
                    return item.value !== ''
                }
        
                let filters = fieldValue.filters.filter(hasValue)
                if(!filters.length) {
                    el2.innerHTML = '<span data-badge>All Items</span>'
                } else {
                    el2.innerHTML = `<div data-stack>${filters.map(x => `<span data-badge>${x.field} ${x.operator} ${x.value}</span>`).join('')}</div>`
                }
            } else if(fieldValue) {
                if(Array.isArray(fieldValue)) {
                    if(fieldValue.length === 0) {
                        el2.innerHTML = `<span data-badge>No Items</span>`
                    } else {
                        el2.innerHTML = `<div data-stack><span data-badge>${fieldValue.length} Items</span></div>`
                    }
                } else {
                    el2.innerHTML = `<span data-badge>1 Item</span>`
                }
            }
        }

        if(val) {
            if(typeof val == 'object') {
                el.value = JSON.stringify(val)
            } else {
                el.value = val ?? ''
            }
        } else {
            el.value = '{}'
        }
    }
    
    el.getValue = () => { 
        console.log('get value: ', el)
        let value;
        if(el.value.startsWith('[') || el.value.startsWith('{')) {
            value = JSON.parse(el.value || '{}')
        } else {
            value = el.value ?? ''
        }
        console.log('value: ', value)
        return value
    }
}

export function FormCheckbox(el) {
    const name = el.getAttribute('name')
    const multiple = el.hasAttribute('data-checkbox-multiple')

    el.setValue = (val) => {
        if(el.hasAttribute('data-checkbox-multiple')) {
            el.checked = val?.includes(el.value)
        } else {
            if(val === 'true' || val === true) {
                el.checked = true
            } else {
                el.checked = false
            }
        }
    }

    el.getValue = () => {
        let value
        if(multiple) {
        value = [] 
            const form = el.closest('form')
            const checkboxes = form.querySelectorAll(`[data-checkbox][name="${name}"]`)
            for(let checkbox of checkboxes) {
                if(checkbox.checked) {
                    value.push(checkbox.value)
                }
            }
        } else {
            if(el.checked) {
                value = el.value
            } else {
                value = false;
            }
        }
        return value
    }
}
