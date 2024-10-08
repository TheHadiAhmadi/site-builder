import { updateModules } from "./sortable.js";

export function Columns(element, {
    doc,
    gridLines = true, 
    colSelector = '.col', 
    onResize = () => {},
    breakpointMd = 480, 
    breakpointLg = 992
} = {}) {
    let windowWidth = doc.body.clientWidth;
    let oneColWidth = element.clientWidth / 12;

    let dir = document.body.dataset.dir ?? 'ltr'

    function initColumn(el) {
        let resizer;
        let dragging = false
        let resized = 0
        let x = 0;

        if(isNaN(el.dataset.cols) || el.dataset.cols == 0) {
            el.dataset.cols = 12
        }

        function onMouseDown(event) {
            x = event.x;
            dragging = true
            element.classList.add('dragging')
            resizer.classList.add('dragging')
        }

        function onMouseMove(event) {
            if(dragging) {
                let field = 'cols'
                
                const diffLength = event.x - x
                if(dir === 'ltr') {
                    if(diffLength < -oneColWidth/2 || diffLength > oneColWidth / 2) {
                        if(el.dataset[field] == 0) {
                            if(field == 'colsLg' && el.dataset['colsMd']) {
                                el.dataset[field] = el.dataset['colsMd']
                            } 
                            el.dataset[field] = el.dataset['cols']
                        }
                        if(diffLength < -oneColWidth / 2) {
                                el.dataset[field] = +(el.dataset[field]) - 1
                                x = x - oneColWidth
                                resized +=1
                        } else {
                                el.dataset[field] = +(el.dataset[field]) + 1
                                x = x + oneColWidth
                                resized -=1
                        }
                    }
                } else {
                    if(diffLength < -oneColWidth/2 || diffLength > oneColWidth / 2) {
                        if(el.dataset[field] == 0) {
                            if(field == 'colsLg' && el.dataset['colsMd']) {
                                el.dataset[field] = el.dataset['colsMd']
                            } 
                            el.dataset[field] = el.dataset['cols']
                        }
                        if(diffLength > oneColWidth / 2) {
                                el.dataset[field] = +(el.dataset[field]) - 1
                                x = x + oneColWidth
                                resized +=1
                        } else {
                                el.dataset[field] = +(el.dataset[field]) + 1
                                x = x - oneColWidth
                                resized -=1
                        }
                    }
                }
            }
        }

        function onMouseUp(event) {
            if(dir === 'rtl') {
                resizer.style.left = '16px'
            } else {
                resizer.style.right = '-24px'
            }
            dragging = false

            if(resized !== 0) {
                onResize()
            }

            element.classList.remove('dragging')
            resizer.classList.remove('dragging')
        }

        function init() {
            resizer = doc.createElement('div')
            resizer.classList.add('resizer-handle')
            el.appendChild(resizer)

            resizer.addEventListener('mousedown', onMouseDown)
            doc.addEventListener('mousemove', onMouseMove)
            doc.addEventListener('mouseup', onMouseUp)
        }

        function destroy() {
            resizer.removeEventListener('mousedown', onMouseDown)
            doc.removeEventListener('mousemove', onMouseMove)
            doc.removeEventListener('mouseup', onMouseUp)

            resizer.remove()
        }

        init()
        return { init, destroy }
    }

    let columns = []

    function updateSize() {
        windowWidth = doc.body.clientWidth;
        oneColWidth = element.clientWidth / 12

        if(gridLines) {
            element.querySelectorAll('.line').forEach((el, index) => {
                el.style.left = (oneColWidth * index + 1) + 'px'
            })
        }
    }

    function init() {
        if(gridLines) {
            for(let i=0; i<12; i++) {
                const line = doc.createElement('div')
                line.classList.add('line')
                line.style.left = (oneColWidth * i) + 'px'

                element.appendChild(line)
            }
        }
        element.classList.add('active')

        element.querySelectorAll(colSelector).forEach(el => {
            columns.push(initColumn(el))
        })  
        window.addEventListener('resize', updateSize)
    }

    function destroy() {
        element.classList.remove('active')
        if(gridLines) {
            element.querySelectorAll('.line').forEach(el => el.remove())
        }
        columns.map(column => column.destroy())
        columns = []
        window.removeEventListener('resize', updateSize)
    }

    function append(el) {
        setTimeout(() => {
            columns.push(initColumn(el))
        })
    }

    return {
        init, 
        destroy, 
        append,
        updateSize
    }
}

export function initColumns() {
    const iframe = document.querySelector('iframe')
    const frameDocument = iframe.contentDocument

    frameDocument.querySelectorAll('[data-columns]').forEach(element => {
        let col = Columns(element, {
            doc: frameDocument,
            colSelector: '[data-column]',
            onResize() {
                updateModules()
            }
        })

        col.init()
    })        
}