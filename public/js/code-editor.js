import {CodeJar} from './codejar.js'
// import * as hljs from '/js/highlight.js'
hljs.configure({
    ignoreUnescapedHTML: true
})

export function CodeEditor(el) {
    const value = (el.getAttribute('value') ?? '').replace(/\\n/g, '\n')
    const readonly = el.hasAttribute('readonly')
    const disabled = el.hasAttribute('disabled')
    el.classList.add('language-' + el.getAttribute('lang'))


    function highlight(el) {
        return hljs.highlightElement(el)
    }

    console.log(hljs.highlightElement)
    const instance = CodeJar(el, highlight, {
        tab: '  ',
        
        // catchTab: false
    })

    instance.onUpdate(val => delete el.dataset.highlighted)

    
    if(value) {
        instance.updateCode(value)
    }

    if(readonly) {
        el.setAttribute('contenteditable','false');
        el.setAttribute('tabindex','0');
    }

    if(disabled) {
        el.setAttribute('contenteditable','false');
    }

    el.setValue = (val) => {
        instance.updateCode(val)
    }
    el.getValue = () => {
        return instance.toString()
    }
}


    // let thisValue = instance.toString();
    // instance.onUpdate(code => {
    //     thisValue = code
    //     this.$data.value = code
    // })

        // Alpine.bind(el, {
        //     'u-modelable': 'value',
        //     'u-data'() {
        //         return {
        //             value: el.getAttribute('value')
        //         }
        //     },

                // cleanup(() => {
                //     instance.destroy()
                // })
                
        //         this.$watch('value', (value) => {

        //             if(thisValue === value) return;

        //             console.log('calling updateCode', value)
        //             instance.updateCode(value)
                    

        //         })        
        //     }
        // })
    // })