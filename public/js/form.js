export function getFormValue(formEl) {
    const form = new FormData(formEl);

    const body = {};

    for (let [key, value] of form.entries()) {
        if (key.includes('.')) {
            let parts = key.split('.');
            let current = body;

            parts.forEach((part, index) => {
                if (!current[part]) {
                    if (index === parts.length - 1) {
                        current[part] = value;
                    } else if (parts[index + 1] >= '0' && parts[index + 1] <= '9') {
                        current[part] = [];
                    } else {
                        current[part] = {};
                    }
                }
                current = current[part];
            });
        } else {
            body[key] = value;
        }
    }

    return body;
}

export function flatObject(object, prefix = '') {
    let flat = {}
    for(let key in object) {
        if(typeof object[key] =='object') {
            const flatted = flatObject(object[key], prefix + key + '.')
            for(let k in flatted) {
                flat[k] = flatted[k]
            }
        } else {
            flat[prefix + key] = object[key]
        }
    }
    return flat;
}

export function setFormValue(form, value) {
    let formValue = flatObject(value)    

    if(!form) return;
    form.querySelectorAll('[name]').forEach(input => {
        const name = input.getAttribute('name')
        console.log('set value: ', {name, formValue})
        if(formValue[name]) {
            if(input.getAttribute('type') !== 'file') {
                input.value = formValue[name]
                console.log('set value: ', input.value)

            } else {
                console.log('TODO: File input', input, formValue[name])
            }
        }
    })
}

export async function request(handler, body) {
    return await fetch('/api/query', {
        method: 'POST',
        body: JSON.stringify({ handler, body }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        return res.json()
    }).then(async res => {
        window.dispatchEvent(new CustomEvent('sitebuilder:request', {detail: res}))
        return res;
    })
}

export function Form(el) {
    if(el.dataset.load) {
        request(el.dataset.load, {
            id: el.dataset.id
        }).then(res => {
            delete el.dataset.load
            delete el.dataset.id
            setFormValue(el, res)
        })
    }

    el.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const body = getFormValue(e.target)

        const handler = body._handler;
        delete body._handler
        
        const res = await request(handler, body);
    });
}