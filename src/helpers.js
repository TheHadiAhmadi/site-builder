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