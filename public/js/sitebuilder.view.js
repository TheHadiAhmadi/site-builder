document.querySelectorAll('form').forEach(form => {
    if(form.getAttribute('action').startsWith('this.')) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault()

            const module = getParentModule(form)
            const name = form.getAttribute('action').split('.')[1]

            const body = {}
            for(let entry of new FormData(form).entries()) {
                body[entry[0]] = entry[1]
            }


            const res = await fetch(`/api/module/${module.dataset.moduleId}/${name}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            }).then(res => res.json())

            if(res.reload) {
                window.location.reload()
            }
        })
    }
})

function getParentModule(el) {
    if(el.dataset.moduleId) return el;
    return getParentModule(el.parentElement)
}