import {hydrate} from './hydrate.js'
import { reloadIframe, reload } from "./helpers.js"
import { initSortable, initSortableIframe } from "./sortable.js"
import { initColumns } from './columns.js'

function onIframeInit() {
    console.log('onIframeInit')
    let iframeElement = document.querySelector('iframe')
    hydrate(iframeElement.contentDocument)
    initColumns()
    initSortableIframe()    
}

function onInit() {
    hydrate(document)
    const iframeElement = document.querySelector('iframe')

    window.addEventListener("message", function(event) {
        console.log(event.data)
        if(event.data?.type === 'hydrate') {
            // hydrate(event.data.element);
            onIframeInit()
            
        }
        // Ensure the message is coming from the expected iframe source
        // if (event.origin !== "https://your-iframe-source.com") {
        //     return;
        // }

        // Assuming the message contains the element ID to hydrate
        // const element = event.data;

        // if (element) {
        // }
    });

    if(iframeElement) {
        initSortable()
        
        setTimeout(() => {
            console.log('calling onIframeInit')
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