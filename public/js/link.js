import { reload } from '/js/helpers.js'

export function Link(el) {
    el.addEventListener('click', (e) => {
        e.stopPropagation()
        e.preventDefault()
        reload(el.getAttribute('href'))
    })
}

