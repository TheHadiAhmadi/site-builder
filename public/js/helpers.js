
export async function reloadIframe() {
    let iframeElement = document.querySelector('iframe')
    if(!iframeElement) {
        return reload(window.location.href)   
    }

    const res = await fetch(new URL(window.location.href).searchParams.get('slug') + '?mode=preview').then(res => res.text())

    const template = document.createElement('template')
    template.innerHTML = res
    
    if(iframeElement.contentDocument) {
        iframeElement.contentDocument.querySelector('[data-body]').innerHTML = template.content.querySelector('[data-body]').innerHTML

        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('sitebuilder:iframe:init'))
        })
    }

}

export async function reload(url) {
    history.pushState({}, {}, url)
    const res = await fetch(url).then(res => res.text())
    const template = document.createElement('template')
    template.innerHTML = res
    
    document.querySelector('[data-body]').innerHTML = template.content.querySelector('[data-body]').innerHTML

    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('sitebuilder:init'))
    })
}

export function Components() {
    let components = {}
    return {
        register(name, fn) {
            components[name] = fn
        },
        init(doc) {
            for(let key in components) {
                if(doc.hasAttribute && doc.hasAttribute(`data-${key}`)) {
                    if(!doc.dataset[key.replace(/-/g, '') + `Hydrated`]) {
                        doc.dataset[key.replace(/-/g, '') + `Hydrated`] = true
                        components[key](doc)
                    }
                }
                
                doc.querySelectorAll(`[data-${key}]`).forEach((el) => {
                    if(!el.dataset[key.replace(/-/g, '') + `Hydrated`]) {
                        el.dataset[key.replace(/-/g, '') + `Hydrated`] = true
                        components[key](el)
                    }
                })
                
            }
        }
    }
}

export function getParentModule(el) {
    if(el.dataset.moduleId) return el;
    return getParentModule(el.parentElement)
}


export function setNestedValue(obj, key, value) {
    if (key.indexOf('.') > -1) {
        const parts = key.split('.');
        const firstPart = parts.shift();

        if (!obj[firstPart]) {
            obj[firstPart] = isNaN(parts[0]) ? {} : [];
        }

        setNestedValue(obj[firstPart], parts.join('.'), value);
    } else {
        if (Array.isArray(obj)) {
            obj[parseInt(key, 10)] = value;
        } else {
            obj[key] = value;
        }
    }
}

export function getFormValue(formEl) {
    const body = {}

    for(let input of formEl.querySelectorAll('[name]')) {
        const name = input.getAttribute('name')
        const value = input.getValue()
        setNestedValue(body, name, value)
    }

    return body
}

export function setFormValue(form, value) {
    if(!form) return;

    form.querySelectorAll('[name]').forEach(input => {
        const name = input.getAttribute('name')
        const val = name.split('.').reduce((p, c) => p?.[c], value)

        console.log(input)
        if(val || val == '' || val == 0 || val == []) {
            input.setValue(val)
        }
    })
}