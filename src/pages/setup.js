import layouts from '../layouts.js'
import { File, Form, Input, Select } from '#components'

export function SetupPage({templates}) {
    return layouts.default({
        title: 'Setup CMS',
        head: [
            '<link rel="stylesheet" href="/css/setup.css">',
            '<script type="module" src="/js/setup.js"></script>'
        ],
        body: `<div data-main>
            ${Form({
                handler: 'setup.setup',
                fields: [
                    Input({ 
                        name: 'password', 
                        placeholder: 'Enter Admin Password', 
                        label: 'Admin Password'
                    }),
                    Select({
                        items: templates, 
                        name: 'template', 
                        placeholder: 'Choose a template', 
                        label: 'Template'
                    }),
                    File({
                        name: 'file', 
                        label: 'Import zip'
                    })
                ]
            })}
        </div>`
    })
}