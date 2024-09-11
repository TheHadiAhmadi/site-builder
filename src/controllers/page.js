import { db } from "#services"
import hbs from 'handlebars'
import { getPage } from "#helpers"
import layouts from "../layouts.js"
import { renderBody } from "../page.js"
import { normalizeCollectionContent } from "../renderModule.js"

async function getPageModules(pageId) {
    return db('modules')
        .query()
        .filter('pageId', '=', pageId)
        .all()
        .then(res => res.sort((a, b) => a.order > b.order ? 1 : -1))
}

export const renderPageController = async (req, res) => {
    const { page, params } = await getPage(req.params[0])
    const mode = req.url.startsWith('/admin') ? 'edit' : (req.query.mode ?? 'view')
    const view = req.query.view ?? ''
    const settings = await db('settings').query().first() ?? {}

    let props = {}
    props.settings = settings
    const tailwind = JSON.stringify({ darkMode: 'class' })

    if (!page) {
        if (mode == 'edit') {
            // TODO: Default Admin page...
            const html = layouts.default({
                mode,
                theme: mode === 'edit' ? 'dark' : 'light',
                tailwind,
                settings,
                head: '',
                body: await renderBody([], { ...req.query, context: req.context, mode, url: req.url, view }),
                title: 'Untitled',
                theme: 'dark'
            })
            return res.send(html)
        } else {
            return res.send('404: Page not found!');
        }
    }

    if (page.dynamic) {
        props.params = params
        if (page.collectionId) {
            let collection = await db('collections').query().filter('id', '=', page.collectionId).first()
            let query = db('contents').query().filter('_type', '=', page.collectionId)
            for (let param in params) {
                query = query.filter(param, '=', params[param])
            }

            props.pageContent = await query.first()
            props.pageContent = await normalizeCollectionContent(collection, props.pageContent);
            props.collection = collection
        }
    }

    let { head } = page;
    let modules = await getPageModules(page.id)

    page.lang ??= 'en'
    page.dir ??= 'ltr'

    const seo = {}
    for (let key in page.seo) {
        seo[key] = hbs.compile(page.seo[key])({ ...props, content: props.pageContent, pageContent: undefined })
    }

    const html = layouts.default({
        mode,
        head: head ?? '',
        body: await renderBody(modules, { ...req.query,context: req.context, props, params, mode, url: req.url, view }),
        theme: mode === 'edit' ? 'dark' : 'light',
        tailwind,
        script: page.script,
        style: page.style,
        dir: page.dir,
        lang: page.lang,
        seo,
        settings
    })

    return res.send(html)
}