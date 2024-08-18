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
        let value;
        if(json.value.startsWith('[') || json.value.startsWith('{')) {
            value = JSON.parse(json.value || '{}')
        } else {
            value = json.value ?? ''
        }

        setNestedValue(body, name, value)
    }

    for(let input of formEl.querySelectorAll('[data-rich-text][name]')) {
        const name = input.getAttribute('name')
        if(Quill.find(input)) {
            const value = Quill.find(input).root.innerHTML

            setNestedValue(body, name, value)
    
        }
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
        if(!multiple && inputValue === 'true') {
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
    if(!form) return;
    let formValue = flatObject(value)    

    form.querySelectorAll('[name]').forEach(input => {
        const name = input.getAttribute('name')
        if(formValue[name] || formValue[name] == '' || formValue[name] == 0 || value[name]) {
            if(input.hasAttribute('data-file-label')) {
                // input.setValue(formValue[name])
                setTimeout(() => {
                    console.log('setValue', input.setValue, {input})
                    input.setValue(value[name])
                }, 100)

            } else if(input.hasAttribute('data-checkbox')) {
                console.log('checkbox', name, formValue)
                if(input.hasAttribute('data-checkbox-multiple')) {
                    if(input.value === 'true' || input.value === 'false') {
                        input.checked = formValue[name]?.includes(input.value === 'true' ? true : false)

                    } else {
                        input.checked = formValue[name]?.includes(input.value)
                    }
                } else {
                    if(formValue[name] === 'true' || formValue[name] === true) {
                        input.checked = true
                    } else {
                        input.checked = false
                    }
                }
            } else if(input.hasAttribute('data-json')) { 
                if(input.hasAttribute('data-relation')) {
                    const el = input.nextElementSibling
                    const fieldValue = value[name]
                    if(fieldValue.filters) {
                        function hasValue(item) {
                            if(Array.isArray(item.value) && item.value.length === 0) return false;
                            return item.value !== ''
                        }
                
                        let filters = fieldValue.filters.filter(hasValue)
                        if(!filters.length) {
                            el.innerHTML = '<span data-badge>All Items</span>'
                        } else {
                            el.innerHTML = `<div data-stack>${filters.map(x => `<span data-badge>${x.field} ${x.operator} ${x.value}</span>`).join('')}</div>`
                        }
                    } else if(fieldValue) {
                        if(Array.isArray(fieldValue)) {
                            el.innerHTML = `<div data-stack>${fieldValue.map(x => `<span data-badge>${x}</span>`).join('')}</div>`
                        } else {
                            el.innerHTML = `<span data-badge>${fieldValue}</span>`
                        }
                    }
                }
                
                if(value[name]) {
                    if(typeof value[name] == 'object') {
                        input.value = JSON.stringify(value[name])
                    } else {
                        input.value = value[name] ?? ''
                    }
                } else {
                    input.value = '{}'
                }
            } else if(input.hasAttribute('data-rich-text')) {
                if(Quill.find(input)) {
                    Quill.find(input).root.innerHTML = formValue[name]
                } else {
                    setTimeout(() => {
                        Quill.find(input).root.innerHTML = formValue[name]
                    }, 200)
                }
            } else {
                console.log('here', input, name, formValue[name])
                if(input.hasAttribute('data-file-input')) {
                    input.setValue(value[name])

                } else {
                    input.value = formValue[name]
                }
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