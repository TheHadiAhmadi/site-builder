function setNestedValue(obj, key, value) {
    if (key.indexOf('.') > -1) {
        const parts = key.split('.');
        const firstPart = parts.shift();

        if (!obj[firstPart]) {
            obj[firstPart] = isNaN(parts[0]) ? {} : [];
        }

        setNestedValue(obj[firstPart], parts.join('.'), value);
    } else {
        if (Array.isArray(obj)) {
            obj[parseInt(key, 10)] = value;
        } else {
            obj[key] = value;
        }
    }
}

function getNestedValue(obj, key) {
    return key.split('.').reduce((prev, curr) => prev[curr], obj)
}

export function getFormValue(formEl) {
    const body = {}
 
    for(let input of formEl.querySelectorAll('[type="hidden"][name]')) {
        const name = input.getAttribute('name')
        const value = input.value

        setNestedValue(body, name, value)
    }
    for(let input of formEl.querySelectorAll('[data-input][name]')) {
        const name = input.getAttribute('name')
        const value = input.value

        setNestedValue(body, name, value)
    }

    for(let json of formEl.querySelectorAll('[data-json][name]')) {
        const name = json.getAttribute('name')
        const value = JSON.parse(json.value)

        setNestedValue(body, name, value)
    }

    for(let input of formEl.querySelectorAll('[data-textarea][name]')) {
        const name = input.getAttribute('name')
        const value = input.value

        setNestedValue(body, name, value)
    }
    for(let input of formEl.querySelectorAll('[data-select][name]')) {
        const name = input.getAttribute('name')
        const value = input.value

        setNestedValue(body, name, value)
    }
    for(let input of formEl.querySelectorAll('[data-checkbox][name]')) {
        const name = input.getAttribute('name')
        const multiple = input.hasAttribute('data-checkbox-multiple')

        let currentValue;
        try {
            currentValue = getNestedValue(body, name)
        } catch(err) {
            currentValue = null
        }

        let inputValue = input.value
        if(inputValue === 'true') {
            inputValue = input.checked
        }

        if(!currentValue) {
            if(multiple) {
                setNestedValue(body, name, [])
            } else {
                setNestedValue(body, name, false)
            }
        }
        
        if(input.checked) {
            if(multiple) {
                setNestedValue(body, name, [...(currentValue ?? []), inputValue])
            } else {
                setNestedValue(body, name, inputValue)
            }
        }
    }
    return body
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
        if(formValue[name] || formValue[name] === false || formValue[name] == 0) {
            if(input.getAttribute('type') === 'file') {
                setTimeout(() => {
                    form.querySelector(`[name="${name}"]`).value = formValue[name]
                    input.dataset.fileId = formValue[name]
                }, 100)
            } else if(input.hasAttribute('data-checkbox') && input.value == 'true') {
                input.checked = formValue[name]
            } else if(input.hasAttribute('data-checkbox') && input.value !== 'true') {
                // TODO: Handle checkbox group
                input.checked = formValue[name]?.includes(input.value)
            } else if(input.hasAttribute('data-json')) { 
                input.value = JSON.stringify(formValue[name])
            } else {
                input.value = formValue[name]
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