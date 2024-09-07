export function FileUploader(el) {
    const name = el.getAttribute('name')
    const multiple = el.hasAttribute('data-multiple')
    const imagePreview = el.querySelector('[data-image-preview]')
    const imagesContainer = el.querySelector('[data-images]')

    el.removeAttribute('name')

    const element = document.createElement('input')
    element.setAttribute('name', name) 
    element.setAttribute('value', '') 
    element.setAttribute('type', 'hidden') 
    element.setAttribute('data-file-input', '') 
    let mode = 'replace'
    
    el.querySelector('[data-empty-mode] button')?.addEventListener('click', () => {
        mode = 'replace'
        el.querySelector('[data-file]').click()
    })
    el.querySelector('button[data-add-more]')?.addEventListener('click', () => {
        mode = 'add'
        el.querySelector('[data-file]').click()
    })

    el.appendChild(element)
    
    function setValue(id) {
        if(Array.isArray(id)) {
            let items;
            if(mode === 'add') {
                items = [...JSON.parse(element.value), ...id]
            } else {
                items = id
            }


            imagesContainer.innerHTML = ''

            for(let item of items) {
                
                const wrapper = document.createElement('div')
                wrapper.dataset.fileWrapper = true

                const image = document.createElement('img')
                image.setAttribute('src', '/files/' + item)
                image.dataset.imagePreview = true

                const removeButton = document.createElement('div')
                removeButton.dataset.fileRemove = true
                removeButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 7L7 17M7 7l10 10"/>
                    </svg>
                `
                removeButton.addEventListener('click', (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    wrapper.remove()
                    const value = JSON.parse(element.value)
                    const newValue = value.filter(x => x !== item)
                    element.value = JSON.stringify(newValue)
                })
                
                wrapper.appendChild(image)
                wrapper.appendChild(removeButton)
                imagesContainer.appendChild(wrapper)

                delete element.dataset.fileInput
                element.dataset.json = ''
                element.value = JSON.stringify(items)

            }
        } else {
            if(imagePreview) {
                imagePreview.setAttribute('src', '/files/' + id)
            }
            element.value = id
        }
    }

    el.setValue = setValue
    element.setValue = setValue

    el.querySelector('[data-file-remove]')?.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        element.value = ''
    })
    
    el.querySelector('[data-file]').addEventListener('change', async event => {
        
        if(multiple) {
            let value = []
            for(let file of event.target.files) {
                const form = new FormData()
                form.set('file', file)
                const res = await fetch('/api/file/upload', {method: 'POST', body: form}).then(res => res.json())
                value.push(res.id)
            }
            setValue(value)
        } else {

            const form = new FormData()
            form.set('file', event.target.files[0])
            const res = await fetch('/api/file/upload', {method: 'POST', body: form}).then(res => res.json())
            setValue(res.id)
        }
    })
    el.addEventListener('paste', async (event) => {
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile();
                const form = new FormData();
                form.set('file', file);
                const res = await fetch('/api/file/upload', { method: 'POST', body: form }).then(res => res.json());
                const id = res.id;
                
                if (multiple) {
                    let currentValue = JSON.parse(element.value) || [];
                    setValue([...currentValue, id]);
                } else {
                    setValue(id);
                }
            }
        }
    });
}