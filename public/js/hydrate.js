import { Action } from "./actions.js"
import { FileUploader } from "./fileuploader.js"
import { Form, request } from "./form.js"
import { Link } from "./link.js"
import { Modal } from "./modal.js"
import { Components } from "./helpers.js"
import { Dropdown } from "./dropdown.js"
import { DataTable } from './data-table.js'
import { SectionResizer } from './section-resizer.js'
import { RichText } from './rich-text.js'
import { Tabs } from "./tabs.js"

const components = Components()

components.register('action', Action)
components.register('file-label', FileUploader)
components.register('form', Form)
components.register('enhance', Link)
components.register('modal', Modal)
components.register('dropdown', Dropdown)
components.register('tabs', Tabs)
components.register('data-table', DataTable)
components.register('section-resizer', SectionResizer)
components.register('rich-text', RichText)


export function hydrate(el) {
    console.log('hydrate', el)
    components.init(el)
}