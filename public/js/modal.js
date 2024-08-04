export function Modal(el) {
    el.addEventListener('click', () => {
        delete el.dataset.modalOpen
    })

    el.querySelector('[data-modal-content]').addEventListener('click', e => {
        e.stopPropagation()
    })
}
