export function FileUploader(el) {
    const name = el.getAttribute('name')
    const imagePreview = el.parentElement.querySelector('[data-image-preview]')

    el.removeAttribute('name')

    const element = document.createElement('input')
    element.setAttribute('name', name) 
    element.setAttribute('value', '') 
    element.setAttribute('type', 'hidden') 
    element.setAttribute('data-file-input', '') 
    
    el.parentElement.querySelector('[data-empty-mode] button')?.addEventListener('click', () => {
        el.parentElement.querySelector('[data-file]').click()
    })

    el.parentElement.appendChild(element)
    
    function setValue(id) {
        console.log('setValue', {id, imagePreview})
        if(imagePreview) {
            imagePreview.setAttribute('src', '/files/' + id)
        }
        element.value = id
    }

    element.setValue = setValue

    el.parentElement.querySelector('[data-file-remove]').addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        element.value = ''
    })
    
    el.addEventListener('change', async event => {
        const form = new FormData()
        form.set('file', el.files[0])
        const res = await fetch('/api/file/upload', {method: 'POST', body: form}).then(res => res.json())

        setValue(res.id)
    })
}