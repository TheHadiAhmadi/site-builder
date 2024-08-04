function Confirm(el) {
    console.log('initialized confirm', el)

    el.querySelector('[a-confirm\\:close]')?.addEventListener('click', () => {
        el.removeAttribute('a-confirm-open')
    })
}

A.component('confirm', Confirm)