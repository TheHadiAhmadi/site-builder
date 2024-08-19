export function Modal(el) {
    const content = el.querySelector('[data-modal-content]')

    window.addEventListener('click', (e) => {
        if(!content.contains(e.target)) {
            delete el.dataset.modalOpen
        }
    })
}
