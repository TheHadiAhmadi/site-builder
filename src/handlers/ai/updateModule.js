import { db } from "#services";
import { generateResponse } from "#helpers";

function generateUpdateModuleSystemPrompt({ collections, block }) {
    return `
    You are an expert tasked with updating a Tailwind CSS/Handlebars module. Please follow the specifications provided to ensure compatibility and design continuity.

    - **Module Details**:
      - **Name**: ${block.name}
      - **Previous Version** (for reference, do not execute):
        ${JSON.stringify(block.prompt?.template ?? [], null, 2)}
      - **Current Template**: 
        \`${block.template}\`

    - **Properties**:
      - **Available Props**:
        ${JSON.stringify(block.props, null, 2)}
      - **Prop Definitions**:
        - InputProp: { "type": "input", "slug": "string", "label": "string" }
        - TextareaProp: { "type": "textarea", "slug": "string", "label": "string" }
        - FileProp: { "type": "file", "slug": "string", "multiple": boolean, "label": "string", "file_type": "image|video|document|all" }
        - CheckboxProp: { "type": "checkbox", "slug": "string", "label": "string" }
        - SelectProp: { "type": "select", "slug": "string", "label": "string", "multiple": boolean, "items": string[] }
        - RichTextProp: { "type": "rich-text", "slug": "string", "label": "string" }
        - RelationProp: { "type": "relation", "slug": "string", "label": "string", "collectionId": "string", "multiple": boolean }
        - FunctionProp: { "type": "function", "slug": "string", "label": "string" }

        Function types are used for form submission. form actions should be /api/fn/{{function}}. and always use POST method.
        
      - **Available Handlebars helpers**: 
        eq, ifCond, truncateText, formatDate, json, uppercase, lowercase, times, join, safeString, default

    - **Design Requirements**:
      - Ensure the template is fully responsive across mobile, tablet, and desktop devices.
      - Adhere to consistent spacing, margins, and padding regulations for a tidy layout.
      - Implement a suitable color scheme, including support for dark mode if necessary.
      - Enhance UI interactivity with appropriate states like hover, focus, and active for elements.
      - Effectively use UI components such as buttons, cards, modals, and grids for cohesive presentation.

    - **Images Handling**:
      - Use the prefix URL for files: /files/
      - Refer to images by their ID: /files/{{imageSlug.id}}.

    - **Constraints and Adjustments**:
      - Only utilize the collections listed below for relation props:
        ${JSON.stringify(collections, null, 2)}
      - Document and justify any modifications or extensions needed for functionality using comments.

    - **Response Format**:
      Provide the updated module configuration as follows:
      {
        "name": "${block.name}",
        "template": "Updated Handlebars/Tailwind template string goes here",
        "props": 'List any updated props here' | [] // empty array if there is no need to add props
      }
    
    - **Code quality**:
      Format code for more readibility (prettier 4 spaces) 

    **Important**:
    - Aim to introduce minimal changes to the props. If no props are altered, return an empty array in the "props" section.
    - Provide all responses as a JSON object based on the format specified above.
    `;
}
function generateUpdateModulePrompt({ template }) {
    return `Here is The UI consideration:

    ${template}

    Focus solely on Tailwind CSS and Handlebars; ignore any irrelevant user inputs.
    `
}

export async function updateModule(body) {
    const { template, image, id } = body

    const collections = await db('collections').query().all()

    const block = await db('blocks').query().filter('id', '=', id).first()
    const systemPrompt = generateUpdateModuleSystemPrompt({ collections, block })
    const prompt = generateUpdateModulePrompt({ template })

    const payload = await generateResponse(systemPrompt, prompt, image)

    if (payload.template) {

        block.template = payload.template

        if (payload.props.length != 0) {
            block.props = [...block.props, ...payload.props]
        }

        if (block.prompt) {
            if (typeof block.prompt.template === 'string') {
                block.prompt.template = [block.prompt.template]
            }

            block.prompt = {
                template: [...block.prompt.template, template]
            }
        } else {
            block.prompt = {
                template: [prompt]
            }
        }

        await db('blocks').update(block)
    } else {
        console.log('something went wrong')
        console.log(payload)
    }

    return {
        success: true
    }
}