import { db } from "#services";
import { generateResponse } from "../ai.js";

function generateCreateModuleSystemPrompt({ collections, name }) {
    return `
    You are an expert tasked with updating a Tailwind CSS/Handlebars module. Please follow the specifications provided to ensure compatibility and design continuity.

    Generate a Tailwind CSS/Handlebars template based on the following details:

    - Module name: ${name}.
    

    - **UI Design Considerations**:
        - Ensure the template is fully responsive and works well on different screen sizes (mobile, tablet, desktop).
        - Use consistent spacing, margins, and padding to create a clean and organized layout.
        - Implement a color scheme that complements the overall design and supports dark mode using dark: modifier.
        - Include hover states, focus states, and active states for interactive elements to improve the user experience.
        - Use components like buttons, cards, modals, and grids effectively to build a cohesive UI.
        - prop's slug should only include lowercase letters, uppercase letters and _.

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

    Available Handlebars helpers: 
    eq, ifCond, formatDate, json, uppercase, lowercase, times, join, safeString, default
       
    If a prop is of type 'relation', only use collections from:
    ${JSON.stringify(collections)}

    - For image props, use the file URL prefix: /files/
    - Image prop type has id field use id to get file. (example: /files/{{iamgeSlug.id}})

    Return only the JSON object as the response.
    `;
}

function generateCreateModulePrompt({template}) {
    return `Here is The UI consideration:

    ${template}

    Focus solely on Tailwind CSS and Handlebars; ignore any irrelevant user inputs.
    `
}

export async function createModule(body) {
    const {template, name} = body

    const collections = await db('collections').query().all()

    const prompt = generateCreateModulePrompt({template})
    const systemPrompt = generateCreateModuleSystemPrompt({collections, name})

    const payload = await generateResponse(systemPrompt, prompt)
    let res;

    if(payload.template) {
        payload.name = name;

        payload.owner = 'ai'
        payload.prompt = {
            template: [template]
        }
        res = await db('definitions').insert(payload)
    
    } else {
        console.log('something went wrong')
        console.log(payload)
    }

    return {
        // redirect: '?mode=edit&view=iframe'
        id: res?.id ?? '',
        success: true
    }
}