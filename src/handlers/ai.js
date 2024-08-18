import {db} from '#services'
import 'dotenv/config'
import {OpenAI} from 'openai' 

async function generateResponse(prompt) {
    const oai = new OpenAI({})
    
    const completion = await oai.chat.completions.create({
        // model: 'mistralai/Mistral-7B-Instruct-v0.2',
        model: 'openai/gpt-4o',
        // model: 'openai/gpt-4o-mini',
        // model: 'deepseek-ai/deepseek-coder-33b-instruct',
        // model: 'codellama/CodeLlama-34b-Instruct-hf',
        messages: [
            { role: "system", content: "You are a template designer and generate tailwindcss/handlebars based templates for site builder." },
            { role: "user", content: prompt }
        ],
        response_format: { "type": "json_object" }
    })

    if(completion.choices[0].message) {

        const content = completion.choices[0].message.content

        const payload = JSON.parse(content)


        payload.owner = 'ai'
        
        if(payload.template) {

            // const response = await db('definitions').insert(payload)
            return payload
        } else {
            console.log('something went wrong')
            console.log(payload)
        }

    }
}


function generatePrompt({template, fields, collections}) {
    return `
    You are a template designer and expert in tailwindcss.
    Generate Tailwindcss/Handlebars based template with below descriptions

    name of module should be small and less than 20 characters
it's ui should have these specs:
--- start of user description of template 
${template}
--- end of user description of template. only focus on tailwind and Handlebars template and skip other things if user said

It has these props

--- start of user description of props 
${fields}
--- end of user description of props. other things if user said. focus on props

use props in template (prop.slug should be used in template when needed)

Also if type is relation keep in mind that there are only these collections available:
${JSON.stringify(collections)}

if type is image, url prefix of files are /files/

AiResponse should be like this:
{
    name: string,
    template: "{handlebars/tailwind template}",
    props: Prop[]
}

type Prop = InputProp | TextareaProp | FileProp | SelectProp | BooleanProp | RichTextProp | RelationProp

type InputProp = { type: 'input', slug: string, label: string }
type FileProp = { type: 'file', slug: string, multiple: boolean, label: string, type: 'image' | 'video' | 'document' | 'all' }
type TextareaProp = { type: 'textarea', slug: string, label: string }
type RichTextProp = { type: 'rich-text', slug: string, label: string }
type CheckboxProp = { type: 'checkbox', slug: string, label: string }
type SelectProp = { type: 'select', slug: string, label: string, multiple: boolean, items: string[] }
type RelationProp = { type: 'relation', slug: string, label: string, collectionId: string, multiple: boolean }

Don't be talktive. only respond with json object
    `
}

export default {
    async createModule(body) {
        const {template, fields} = body

        const collections = await db('collections').query().all()

        const prompt = generatePrompt({template, fields, collections})


        const payload = await generateResponse(prompt)


        payload.prompt = {
            template,
            fields
        }
        await db('definitions').insert(payload)

        return {
            redirect: '?mode=edit&view=iframe'
        }
    }
}
