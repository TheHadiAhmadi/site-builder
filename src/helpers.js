import { db } from "#services";
import hbs from 'handlebars'
import { join } from 'path'
import {readFile} from 'fs/promises'
import { OpenAI } from 'openai'
import { faker } from "@faker-js/faker";

export async function fileToBase64(filePath) {
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

export function getUrl(query) {
    let res = ''
    for (let key in query) {
        res += '&' + key + '=' + query[key]
    }
    if(res) {
        return res.replace('&', '?')
    } 
    return ''
}

export async function getPage(slug) {
    if (!slug.startsWith('/')) {
        slug = '/' + slug;
    }

    const pages = await db('pages').query().all();

    for (let page of pages) {
        if(page.dynamic) {
            if(!page.slug.includes('{{')) {
                page.slug = join(page.slug, '{{slug}}')
            }
        }
        const dynamicParts = page.slug.split('/').filter(part => part.startsWith('{{') && part.endsWith('}}'));

        let regexStr = page.slug;
        for (const dynamicPart of dynamicParts) {
            regexStr = regexStr.replace(dynamicPart, '([^/]+)');
        }
        const regex = new RegExp(`^${regexStr}$`);

        const match = slug.match(regex);
        if (match) {
            const params = {};
            dynamicParts.forEach((part, index) => {
                const paramName = part.slice(2, -2);
                params[paramName] = match[index + 1];
            });

            return { params, page };
        } else if (page.slug === slug) {
            return { params: {}, page };
        }
    }

    return {};
}

export function getSlug(slug, props) {
    return hbs.compile(slug)(props)
}

export async function getPageSlug(page) {
    if (page.dynamic) {
        let query = db('contents').query().filter('_type', '=', page.collectionId);

        const content = await query.first()
        if(!page.slug.includes('{{')) {
            page.slug = join(page.slug, '{{slug}}')
        }
        return getSlug(page.slug, content)
    }
    return page.slug
}

export function attributes(object, dataset) {
    let result = ''

    for(let key in object) {
        if(object[key] === false) continue
        if(object[key] || object[key] == '') {
            if(object[key] === true || object[key] == '') {
                result += ` ${key}`
            }
            result += ` ${key}="${object[key]}"`
        }
    }

    for(let key in dataset ?? {}) {
        if(dataset[key] === false) continue
        if(dataset[key] || dataset[key] == '') {
            if(dataset[key] === true || dataset[key] == '') {
                result += ` data-${key}`
            }
            result += ` data-${key}="${dataset[key]}"`
        }
    }
    
    return result; 
}

export function getText(option) {
    return typeof option === 'object' ? option.text : option
}

export function getValue(option) {
    return typeof option === 'object' ? option.value : option
}

export function isSelected(option) {
    return typeof option === 'object' && option.selected
}

export async function fakeValue(field) {
    switch (field.type) {
        case 'input':
            if (field.input_type === 'email') {
                return faker.internet.email();
            }
            if (field.input_type === 'number') {
                return faker.number.int({ min: 0, max: 1000 });
            }
            const len = faker.number.int({ max: 5 })

            return faker.lorem.words(len); // Default for text inputs
        case 'textarea':
            return faker.lorem.paragraphs(2);
        case 'select':
            let length = field.items.length
            const random = faker.number.int({ max: length })
            console.log(random, field.items)
            return field.items[random]
        case 'checkbox':
            return faker.datatype.boolean();
        case 'file':
            if(field.multiple) {
                return [{id: 'placeholder'},{id: 'placeholder'},{id: 'placeholder'},{id: 'placeholder'}]
            }
            return {id: 'placeholder'}
            // return faker.system.fileName(); // This could be more sophisticated depending on the use case
        case 'relation':
            const data = await db('contents').query().filter('_type', '=', field.collectionId).paginate(1, 10)
            // return 
            return field.multiple ? data.data.slice(5) : data.data[0]; // Simulating an ID or multiple IDs
            
        case 'rich-text':
            return faker.lorem.paragraphs(2);
        case 'collection':
            return []
            // return field.items && field.items.length > 0 ? faker.random.arrayElement(field.items.map(item => item.value)) : '';
        case 'function':
            return null;
            // return field.items && field.items.length > 0 ? faker.random.arrayElement(field.items.map(item => item.value)) : '';
        case 'color':
            return faker.color.rgb(); // Generate a random RGB color
        case 'date':
            return faker.date.recent().toISOString(); // Generate a recent date in ISO format
        case 'hidden':
            return ''; // Typically hidden fields don't need fake data
        default:
            return ''; // Default case for any unspecified field types
    }
}

