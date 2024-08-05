export function FileUploader(el) {
    const name = el.getAttribute('name')
    el.removeAttribute('name')
    const element = document.createElement('input')
    element.setAttribute('name', name) 
    element.setAttribute('type', 'hidden') 
    
    el.parentElement.insertBefore(element, el)
    el.addEventListener('change', async event => {
        const form = new FormData()
        form.set('file', el.files[0])
        const res = await fetch('/api/file/upload', {method: 'POST', body: form}).then(res => res.json())

        el.dataset.fileId = res.id
        element.value = res.id
    })
}