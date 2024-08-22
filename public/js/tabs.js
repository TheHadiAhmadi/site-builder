export function Tabs(el) {
    const tabs = el.querySelectorAll('[data-tab]');
    const tabContents = el.querySelectorAll('[data-tab-content]');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetIndex = tab.getAttribute('data-tab');
            
            // Remove active states
            tabs.forEach(t => t.removeAttribute('data-tab-active'));
            tabContents.forEach(content => content.removeAttribute('data-tab-content-active'));
            
            // Set active state for the clicked tab and corresponding content
            tab.setAttribute('data-tab-active', '');
            el.querySelector(`[data-tab-content="${targetIndex}"]`).setAttribute('data-tab-content-active', '');
        });
    });
}
