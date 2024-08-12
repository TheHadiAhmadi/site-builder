import { Action } from "./actions.js"
import { FileUploader } from "./fileuploader.js"
import { Form, request } from "./form.js"
import { Link } from "./link.js"
import { Modal } from "./modal.js"
import { Components } from "./helpers.js"
import { Dropdown } from "./dropdown.js"
import { DataTable } from './data-table.js'

function SectionResizer(element) {
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
        console.log('clicked section resizer')

        console.log(section, element)
        
    })
}

const components = Components()

components.register('action', Action)
components.register('form', Form)
components.register('file', FileUploader)
components.register('enhance', Link)
components.register('modal', Modal)
components.register('dropdown', Dropdown)
components.register('data-table', DataTable)
components.register('section-resizer', SectionResizer)


export function hydrate(el) {
    components.init(el)
}