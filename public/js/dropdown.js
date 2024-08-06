export function Dropdown(el) {
    const trigger = el.dataset.dropdownTrigger
    const target = el.querySelector('[data-dropdown-target]')
    const menu = el.querySelector('[data-dropdown-menu]')

    let timeout;
    
    function show() {
        if(timeout) clearTimeout(timeout)

        menu.style.display = 'flex'
    }

    function hide() {
        if(trigger === 'focus') {
            menu.style.display = 'none'
        } else {
            if(timeout) clearTimeout(timeout)
            timeout = setTimeout(() => {
                menu.style.display = 'none'
            }, 200)
        }

    }

    function toggle() {
        if(timeout) clearTimeout(timeout)
        
        const currentDisplay = menu.style.display
        if(currentDisplay === 'flex') {
            menu.style.display = 'none'
        } else {
            menu.style.display = 'flex'
        }
    }

    function clickOutside(e) {
        if(!target.contains(e.target) && !menu.contains(e.target)) {
            hide()
        }
    }
    
    if(trigger === 'focus') {
        target.addEventListener('click', toggle)
        menu.addEventListener('click', show)
        window.addEventListener('click', clickOutside)
    }

    if(trigger === 'hover') {
        target.addEventListener('mouseenter', show)
        target.addEventListener('mouseleave', hide)

        menu.addEventListener('mouseenter', show)
        menu.addEventListener('mouseleave', hide)
    }
}