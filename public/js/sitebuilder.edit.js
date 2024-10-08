import {hydrate} from './hydrate.js'
import { reloadIframe, reload } from "./helpers.js"
import { initSortable, initSortableIframe } from "./sortable.js"
import { initColumns } from './columns.js'

function onIframeInit() {
    let iframeElement = document.querySelector('iframe')
    hydrate(iframeElement.contentDocument)
    initColumns()
    initSortableIframe()    
}

function onInit() {
    hydrate(document)
    const iframeElement = document.querySelector('iframe')

    if(!document.body.hasAttribute('hydrated-message'))
    {
        document.body.setAttribute('hydrated-message', '')
        window.addEventListener("message", function(event) {
            if(event.data?.type === 'hydrate') {
                onIframeInit()   
            }
            if(event.data?.type === 'navigate') {
                const view = new URL(window.location.href).searchParams.get('view') ?? ''
                const url = `/admin?view=${view}&slug=${encodeURIComponent(event.data.href)}`   
                reload(url)
            }
        });
    }
        
        if(iframeElement && iframeElement.src.includes('mode=preview')) {
            initSortable()
            
            setTimeout(() => {
                onIframeInit()
            }, 2000)
        }
    }
    
    function onRequest(e) {
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