export function NestedSidebar(el) {
    const toggler = el.querySelector('[data-sidebar-toggler]');
    
    toggler.addEventListener('click', () => {
        const isMenuVisible = el.hasAttribute('data-active')

        let shouldClose = isMenuVisible


        document.querySelectorAll('[data-nested-sidebar]').forEach(el => {
            delete el.dataset.active
        })
        console.log(shouldClose)

        if(shouldClose) {
            delete el.dataset.active
        } else {
            el.dataset.active = ''
        }
    });

}