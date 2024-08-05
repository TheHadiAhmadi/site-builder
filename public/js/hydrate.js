import { Action } from "./actions.js"
import { FileUploader } from "./fileuploader.js"
import { Form } from "./form.js"
import { Link } from "./link.js"
import { Modal } from "./modal.js"
import { Components } from "./helpers.js"

const components = Components()

components.register('action', Action)
components.register('form', Form)
components.register('file', FileUploader)
components.register('enhance', Link)
components.register('modal', Modal)


export function hydrate(el) {
    components.init(el)
}