import 'dotenv/config'
import {readFile} from 'fs/promises'
import { OpenAI } from 'openai'
import { createModule } from './ai/createModule.js'
import { updateModule } from './ai/updateModule.js'
import { updateSeo } from './ai/updateSeo.js'

async function fileToBase64(filePath) {
    try {
        // Read the file asynchronously in binary mode
        const fileContent = await readFile(filePath, { encoding: 'binary' })

        const buffer = Buffer.from(fileContent, 'binary');

        const base64Encoded = buffer.toString('base64');

        return base64Encoded
    } catch (error) {
        throw new Error(`Error encoding file to base64: ${error.message}`)
    }
}

export async function generateResponse(systemPrompt, prompt, image) {
    const oai = new OpenAI({})
    console.log('waiting for ai response...')
    const mime = 'image/png'
    let content;
    if (image) {
        content = [
            {
                type: 'text',
                text: prompt
            },
            {
                type: 'image_url',
                image_url: {
                    url:`data:${mime};base64,` + await fileToBase64('./uploads/' + image)
                }
            }
        ]
    } else {
        content = prompt
    }
    let messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content }
    ]

    console.log(messages, messages[1].content)
    const completion = await oai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages,
        temperature: 0.9,
        response_format: { "type": "json_object" }
    })

    console.log('ai response received')
    if (completion.choices[0].message) {

        const content = completion.choices[0].message.content

        return JSON.parse(content)
    }
}

export default {
    createModule,
    updateModule,
    updateSeo
}
