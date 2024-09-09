import { Action } from "./actions.js"
import { FileUploader } from "./fileuploader.js"
import { Form, FormCheckbox, FormInput, FormJson, FormSelect, FormTextarea } from "./form.js"
import { Link } from "./link.js"
import { Modal } from "./modal.js"
import { Components } from "./helpers.js"
import { Dropdown } from "./dropdown.js"
import { DataTable } from './data-table.js'
import { SectionResizer } from './section-resizer.js'
import { RichText } from './rich-text.js'
import { Tabs } from "./tabs.js"
import { NestedSidebar } from "./sidebar.js"
import { CodeEditor } from "./code-editor.js"

const components = Components()

components.register('form', Form)
components.register('checkbox', FormCheckbox)
components.register('json', FormJson)
components.register('select', FormSelect)
components.register('input', FormInput)
components.register('textarea', FormTextarea)
components.register('code-editor', CodeEditor)
components.register('file-label', FileUploader)
components.register('rich-text', RichText)

components.register('action', Action)
components.register('enhance', Link)
components.register('modal', Modal)
components.register('dropdown', Dropdown)
components.register('tabs', Tabs)
components.register('data-table', DataTable)
components.register('section-resizer', SectionResizer)
components.register('nested-sidebar',NestedSidebar)

export function hydrate(el) {
    components.init(el)
}