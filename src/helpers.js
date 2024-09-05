import { db } from "#services";
import hbs from 'handlebars'
import { join } from 'path'

export function getUrl(query) {
    let res = `?mode=edit`
    for (let key in query) {
        res += '&' + key + '=' + query[key]
    }
    return res
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
