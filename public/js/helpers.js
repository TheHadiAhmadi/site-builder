
export async function reloadIframe() {
    let iframeElement = document.querySelector('iframe')
    if(!iframeElement) {
        return reload(window.location.href)   
    }

    const res = await fetch(window.location.href.replace('mode=edit', 'mode=preview')).then(res => res.text())
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
                doc.querySelectorAll(`[data-${key}]`).forEach(components[key])
            }
        }
    }
}

export function getParentModule(el) {
    if(el.dataset.moduleId) return el;
    return getParentModule(el.parentElement)
}