import { request } from "./form.js";

export function SectionResizer(element) {
    const section = element.parentElement.querySelector('[data-section]')
    let dragging = false;
    let mode = element.dataset.mode
    let y;
    let currentTop; 
    let currentBottom; 
    let changed = false;

    function onMouseDown(event) {
        dragging = true
        currentTop = +section.style.paddingTop.replace('px', '')
        currentBottom = +section.style.paddingBottom.replace('px', '')
        changed = false;
        y = event.y
    }
    function onMouseMove(event) {
        if(dragging) {
            let diff = event.y - y
            if(mode === 'top') {
                section.style.paddingTop = (currentTop + diff) + 'px'
                changed = true
            } else {
                section.style.paddingBottom = (currentBottom + diff) + 'px'
                changed = true
            }
        }
    }

    async function onMouseUp(e) {
        dragging = false;
        if(changed) {
            setTimeout(async () => {
                await request('module.saveSettings', {
                    id: element.parentElement.parentElement.dataset.moduleId,
                    slug: window.location.pathname,
                    paddingTop: +section.style.paddingTop.replace('px', ''),
                    paddingBottom: +section.style.paddingBottom.replace('px', ''),
                })
            }, 100)
            changed = false
        }
    }
    
    
    element.addEventListener('mousedown', onMouseDown)
    document.querySelector('iframe').contentDocument.addEventListener('mousemove', onMouseMove)
    document.querySelector('iframe').contentDocument.addEventListener('mouseup', onMouseUp)

    element.addEventListener('click', (e) => {
        e.stopPropagation()        
    })
}