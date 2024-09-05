
export function RichText(el) {
    if(el.dataset.initialized) return

    el.dataset.initialized = 'true'

    const instance = new window.Quill(el, {
        placeholder: 'Enter content...',
        theme: 'snow'

    })
}