import {db} from '#services'
import 'dotenv/config'
import {OpenAI} from 'openai' 
import { createModule } from './ai/createModule.js'
import { updateModule } from './ai/updateModule.js'
import { updateSeo } from './ai/updateSeo.js'

export async function generateResponse(systemPrompt, prompt) {

    console.log({
        system: systemPrompt,
        user: prompt
    })
    const oai = new OpenAI({})
    console.log('waiting for ai response...')
    const completion = await oai.chat.completions.create({
        model: 'Openai/gpt-4o-mini',
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
        ],
        temperature: 0.9,
        response_format: { "type": "json_object" }
    })

    console.log('ai response received')
    if(completion.choices[0].message) {

        const content = completion.choices[0].message.content

        const payload = JSON.parse(content)

        
        return payload
       
    }
}

export default {
    createModule,
    updateModule,
    updateSeo
}
