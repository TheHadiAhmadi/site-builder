import { Action } from "./actions.js"
import { FileUploader } from "./fileuploader.js"
import { Form } from "./form.js"
import { Components, reloadIframe, reload } from "./helpers.js"
import { Link } from "./link.js"
import { Modal } from "./modal.js"
import { initSortable, initSortableIframe } from "./sortable.js"

const components = Components()

components.register('action', Action)
components.register('form', Form)
components.register('file', FileUploader)
components.register('enhance', Link)
components.register('modal', Modal)

function onIframeInit() {
    let iframeElement = document.querySelector('iframe')
    components.init(iframeElement.contentDocument)
    console.log('onIframeInit')

    initSortableIframe()    
}

function onInit() {
    components.init(document)
    console.log('onInit')
    const iframeElement = document.querySelector('iframe')

    if(iframeElement) {
        initSortable()

        iframeElement.onload = () => {
            onIframeInit()
        }
    }
}

function onRequest(e) {
    console.log('onRequest', e.detail)
    const res = e.detail

    if(res.reload) {
        reloadIframe()
    }
    if(res.pageReload) {
        reload(window.location.href)
    } else if(typeof res.redirect == 'string') {
        reload(res.redirect)
    }
}

onInit()

window.addEventListener('sitebuilder:request', onRequest)
window.addEventListener('sitebuilder:init', onInit)
window.addEventListener('sitebuilder:iframe:init', onIframeInit)