import { setFormValue } from "/js/form.js";

document.querySelector('[data-form]').action = '/api/setup'
document.querySelector('[data-form]').method = 'POST'

setFormValue(document.querySelector('[data-form]'), {
    password: 'Passw0rd!', 
    template: 'test'
})