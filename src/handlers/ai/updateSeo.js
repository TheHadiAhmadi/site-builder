import { db } from "#services";
import { renderBody } from "../../page.js";
import { renderModule } from "../../renderModule.js";
import { generateResponse } from "../ai.js";

function generateUpdateSeoSystemPrompt({ collection, page, settings, content }) {
    return `
    You are an SEO expert with proficiency in generating optimized metadata for web pages.

    Generate SEO metadata based on the following details:

    - ${page.dynamic ? '- Page Type: Dynamic' : '- Page Type: Static'}
    ${page.dynamic ? `- Related collection: ${JSON.stringify(collection)}` : ''}
    - Previous Seo Settings: ${JSON.stringify(page.seo)}
  

    - Available Handlebars context: {settings: ${JSON.stringify(settings)}, content: ${JSON.stringify(content)}}
    
    - **SEO Considerations**:
        - Use Handlebars template for fields. do not write settings directly as string. use {{ settings.<field> }} instead
        - do not write content directly, if possible use variables available to you.
        - Generate a unique and compelling title that includes relevant keywords.
        - Create a meta description that is concise and contains the primary keywords while enticing users to click.
        - Suggest meta keywords that are relevant to the page's content and targeted audience.
        - Recommend a suitable og:type for the page to optimize sharing on social media.
        - Suggest an appropriate Twitter card type.
        - Ensure the robots tag is correctly set to allow or disallow search engines from indexing the page.
        - For social image, if page is dynamic, choose suitable image field from collection, otherwise return empty string.
        - Consider content of modules used in page to generate data based on content
        - all Relation field types has name field. if you want to show relation, use it's name 
        - all image field types has id field. use id
    
    Response format:
    {
        "seo": {
            "social_image": "<string_with_handlebars_support>",
            "title": "<string_with_handlebars_support>",
            "meta_title": "<string_with_handlebars_support>",
            "meta_description": "<string_with_handlebars_support>",
            "meta_keywords": "<string_with_handlebars_support>",
            "robots": "<string_with_handlebars_support>",
            "twitter_card": "<string_with_handlebars_support>",
            "og_type": "<string_with_handlebars_support>"
        }
    }

    Return only the JSON object as the response.
    `;
}

function generateUpdateSeoPrompt({ prompt }) {
    return `Consider the following user input to generate the SEO options:

    ${prompt}
    `;
}

export async function updateSeo(body) {
    const {prompt, id} = body

    const settings = await db('settings').query().first() ?? {}
    const page = await db('pages').query().filter('id', '=', id).first()
    let collection

    const modules = await db('modules').query().filter('pageId', '=', page).all()
     
    let firstContent;
    if(page.dynamic) {
        collection = await db('collections').query().filter('id', '=', page.collectionId).first()        

        firstContent = await db('contents').query().filter('_type', '=', page.collectionId).first()
    }
 
    const userPrompt = generateUpdateSeoPrompt({prompt})
    const systemPrompt = generateUpdateSeoSystemPrompt({collection, page, settings, content: firstContent ?? {}})

    const payload = await generateResponse(systemPrompt, userPrompt)
    if(payload.seo) {
        page.seo = payload.seo
        await db('pages').update(page)
    } else {
        console.log('something went wrong')
        console.log(payload)
    }


    return {
        redirect: '?mode=edit&view=iframe'
    }
}