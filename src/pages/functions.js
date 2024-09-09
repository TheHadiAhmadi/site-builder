import { Form, Input, Modal, Page, Select } from "#components";
import { DataTable } from "./dataTable.js";


const functionFields = [
    {
        slug: 'name',
        label: 'Name',
        type: 'input',
        default: true,
    },
    {
        slug: 'slug',
        label: 'Slug',
        type: 'input',
        default: true,
    },
    {
        slug: 'status',
        label: 'Status',
        type: 'select',
        items: [
            "Enabled",
            "Disabled"
        ]
    }
]

function FunctionsDataTable({functions}) {
    const items = {
        perPage: Object.keys(functions).length,
        page: 1,
        data: Object.keys(functions).map(x => functions[x])
    }

    const actions = [
        {
            text: "Change Status",
            action: 'open-update-function-modal',
            dataset: {
                'modal-name': 'update-function'
            }
        },
        {
            text: "Call"
        },
        
    ]
    
    return DataTable({filters: [], selectable: false, items, fields: functionFields, actions, relationFilters: false})
}

export function FunctionListPage({functions}) {
    return Page({
        title: 'Functions',
        body: [
            FunctionsDataTable({functions}),
            ChangeFunctionStatusModal()
        ]
    })
}

function ChangeFunctionStatusModal() {
    return Modal({
        name: 'update-function',
        title: "Change function status",
        body: Form({
            handler: 'function.changeStatus',
            cancelAction: 'modal.close',
            card: false,
            fields: [
                `<input name="id"  data-input type="hidden" value="">`,
                Input({
                    name: 'name',
                    label: 'Function Name',
                    type: 'text'
                }),
                Select({
                    name: 'status',
                    label: 'New Status',
                    items: [
                        'Enabled',
                        "Disabled"
                    ]
                })
            ]
        })
    })
}