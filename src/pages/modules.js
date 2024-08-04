import { Button, Form, Input, Page } from "../components.js"

export function pageCreateModule() {
    return Page({
        actions: [
            Button({text: 'Cancel', action: "navigation.navigate-to-default-view"})
        ].join(''),
        title: `Create New Module`,
        body: Form({
            handler: 'definition.create',
            fields: `
                <label data-label>
                    <span data-label-text>Name</span>
                    <input data-input name="name" placeholder="Enter module name" />
                </label>
                <label data-label>
                    <span data-label-text>Template</span>
                    <textarea data-textarea rows="20" name="template" placeholder="Enter module template (Handlebars)"></textarea>
                </label>
                <div>Content Type</div>
                <div>Is Multiple</div>
                <div>Settings</div>
            `,
            cancelAction: 'navigation.navigate-to-default-view'
        })
    })
}

export function pageUpdateModule(data) {

    console.log(data)
    return Page({
        actions: [
            Button({text: 'Cancel', action: "navigate-to-default-view"})
        ].join(''),
        title: `Update Module (${data.name})`,
        body: Form({
            load: 'definition.load',
            id: data.id,
            handler: 'definition.update',
            fields: `
                <input type="hidden" name="id" value="" />
                <label data-label>
                    <span data-label-text>Name</span>
                    <input data-input name="name" placeholder="Enter module name"/>
                </label>
                <label data-label>
                    <span data-label-text>Template</span>
                    <textarea data-textarea rows="20" name="template" placeholder="Enter module template (Handlebars)"></textarea>
                </label>

                <label data-label-inline>
                    <input ${data.multiple ? 'checked' : ''} data-checkbox type="checkbox" name="multiple" value="true"></textarea>
                    <span data-label-text>Multiple</span>
                </label>

                <label data-label>
                    <span data-label-text>Content Type</span>
                    <div data-content-type-fields>
                        ${(data.contentTypes??[]).map((contentType, index) => `TODOOOOO:`)}
                        <button type="button" data-button data-button-color="primary" style="align-self: start">Add Field</button>                    
                    </div>
                </label>
                <div>Is Multiple</div>
                <div>Settings</div>
            `,
            cancelAction: 'navigate-to-default-view'
        })
    })
}