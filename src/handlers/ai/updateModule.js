import { db } from "#services";
import { generateResponse } from "../ai.js";

function generateUpdateModuleSystemPrompt({ collections, definition }) {
    return `
    You are a Tailwind CSS and Handlebars template expert.

    Update an existing Tailwind CSS/Handlebars template based on the following details:

    - Module name: ${definition.name}.
    
    - Previous prompts: 
    ${JSON.stringify(definition.prompt?.template ?? [])}
    
    - Current Template:
    ${definition.template}

    - Available Props: 
    ${definition.props}

    - **UI Design Considerations**:
        - Ensure the template is fully responsive and works well on different screen sizes (mobile, tablet, desktop).
        - Use consistent spacing, margins, and padding to create a clean and organized layout.
        - Implement a color scheme that complements the overall design and supports dark mode if mentioned.
        - Include hover states, focus states, and active states for interactive elements to improve the user experience.
        - Use components like buttons, cards, modals, and grids effectively to build a cohesive UI.

    Response format:
    {
        "name": "string",
        "template": "{Handlebars/Tailwind template}",
        "props": Prop[]
    }

    Prop types:
    type Prop = InputProp | TextareaProp | FileProp | SelectProp | BooleanProp | RichTextProp | RelationProp

    type InputProp = { "type": "input", "slug": "string", "label": "string" }
    type FileProp = { "type": "file", "slug": "string", "multiple": "boolean", "label": "string", "file_type": "image" | "video" | "document" | "all" }
    type TextareaProp = { "type": "textarea", "slug": "string", "label": "string" }
    type RichTextProp = { "type": "rich-text", "slug": "string", "label": "string" }
    type CheckboxProp = { "type": "checkbox", "slug": "string", "label": "string" }
    type SelectProp = { "type": "select", "slug": "string", "label": "string", "multiple": "boolean", "items": "string[]" }
    type RelationProp = { "type": "relation", "slug": "string", "label": "string", "collectionId": "string", "multiple": "boolean" }

    
    If a prop is of type 'relation', only use collections from:
    ${JSON.stringify(collections)}

    - For image props, use the file URL prefix: /files/
    - Image prop type has id field use id to get file. (example: /files/{{iamgeSlug.id}})

    You can change props if needed. but try to not update if possible
    if props didn't changed, return empty array as props field.

    Return only the JSON object as the response.
    `;
}

function generateUpdateModulePrompt({ template }) {
    return `Here is The UI consideration:

    ${template}

    Focus solely on Tailwind CSS and Handlebars; ignore any irrelevant user inputs.
    `
}

export async function updateModule(body) {
    const { template, id } = body

    const collections = await db('collections').query().all()

    const definition = await db('definitions').query().filter('id', '=', id).first()
    const systemPrompt = generateUpdateModuleSystemPrompt({ collections, definition })
    const prompt = generateUpdateModulePrompt({ template })

    const payload = await generateResponse(systemPrompt, prompt)

    if (payload.template) {

        definition.template = payload.template

        if (payload.props.length != 0) {
            definition.props = payload.props
        }

        if (definition.prompt) {
            if (typeof definition.prompt.template === 'string') {
                definition.prompt.template = [definition.prompt.template]
            }

            definition.prompt = {

                template: [...definition.prompt.template, template]
            }
        } else {
            definition.prompt = {
                template: [prompt]
            }
        }

        await db('definitions').update(definition)
    } else {
        console.log('something went wrong')
        console.log(payload)
    }

    return {
        redirect: '?mode=edit&view=iframe'
    }
}