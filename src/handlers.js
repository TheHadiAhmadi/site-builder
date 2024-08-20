import { db } from "#services"
import ai from "./handlers/ai.js"
import collection from "./handlers/collection.js"
import content from "./handlers/content.js"
import definition from "./handlers/definition.js"
import module from './handlers/module.js'
import page from "./handlers/page.js"
import settings from "./handlers/settings.js"
import setup from "./handlers/setup.js"
import table from "./handlers/table.js"
import user from "./handlers/user.js"
import { DataTable } from "./pages/dataTable.js"

export default {
    module,
    page,
    definition,
    collection,
    content,
    setup,
    ai,
    user,
    table,
    settings
}