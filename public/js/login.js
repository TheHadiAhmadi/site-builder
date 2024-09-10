import { setFormValue } from "/js/helpers.js";

document.querySelector('[data-form]').action = '/api/login'
document.querySelector('[data-form]').method = 'POST'

setFormValue(document.querySelector('[data-form]'), {
    // password: 'Passw0rd!', 
    // template: 'test'
})