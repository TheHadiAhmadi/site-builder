export function FileUploader(el) {
    const name = el.getAttribute('name')
    const imagePreview = el.querySelector('[data-image-preview]')

    el.removeAttribute('name')

    const element = document.createElement('input')
    element.setAttribute('name', name) 
    element.setAttribute('value', '') 
    element.setAttribute('type', 'hidden') 
    element.setAttribute('data-file-input', '') 
    
    el.querySelector('[data-empty-mode] button')?.addEventListener('click', () => {
        el.querySelector('[data-file]').click()
    })

    el.appendChild(element)
    
    function setValue(id) {

        console.log('setValue', {id, imagePreview})
        if(imagePreview) {
            imagePreview.setAttribute('src', '/files/' + id)
        }
        element.value = id
    }

    el.setValue = setValue

    el.querySelector('[data-file-remove]').addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        element.value = ''
    })
    
    el.querySelector('[data-file]').addEventListener('change', async event => {
        const form = new FormData()
        form.set('file', event.target.files[0])
        const res = await fetch('/api/file/upload', {method: 'POST', body: form}).then(res => res.json())

        setValue(res.id)
    })
}