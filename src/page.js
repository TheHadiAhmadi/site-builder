import hbs from 'handlebars'
import './handlebars.js'
import { Button, DeleteConfirm } from './components.js'
import { join } from 'path'

import { db } from "#services";
import layouts from "./layouts.js";
import { CollectionCreatePage, CollectionDataCreatePage, CollectionDataListPage, CollectionDataUpdatePage, CollectionUpdatePage, RelationFieldModal } from './pages/collections.js';
import { PageCreatePage, PageUpdatePage } from './pages/pages.js';
import {PageEditorPage} from './pages/editor.js'
import { normalizeCollectionContent, renderModule } from './renderModule.js';
import { getPage, getPageSlug, getUrl } from './helpers.js';
import { UserCreatePage, UserListPage, UserUpdatePage } from './pages/users.js';
import { SettingsAppearancePage, SettingsGeneralPage, SettingsProfilePage } from './pages/settings.js';
import { BlockCreatePage, BlockUpdatePage, CreateBlockAiModal, UpdateBlockAiModal } from './pages/blocks.js';
import { Sidebar } from './pages/sidebar.js';

let definitions = {}

async function loadModuleDefinitions() {
    const defs = await db('definitions').query().all()
    definitions = {}
    for (let definition of defs) {
        if (definition.file) {
            try {
                const module = await import(join('..', definition.file)).then(res => {
                    return res.default
                })

                definitions[definition.id].load = module.load
                definitions[definition.id].actions = module.actions
            } catch (err) {
                definitions[definition.id] = definition
            }
        } else {
            definitions[definition.id] = definition
        }

        if (typeof definitions[definition.id].template === 'string') {
            definitions[definition.id].template = hbs.compile(definitions[definition.id].template)
        }
    }
}

export async function handleModuleAction({ module, method, body }) {
    const definition = definitions[module.definitionId]
    let res;

    if (definition.actions && definition.actions[method]) {
        res = await definition.actions[method](body)
    }

    return res;
}

const pageMap = {
    '' : PageEditorPage,
    'iframe': PageEditorPage,
    'pages.create': PageCreatePage,
    'pages.update': PageUpdatePage,
    'blocks.create': BlockCreatePage,
    'blocks.update': BlockUpdatePage,
    'collections.create': CollectionCreatePage,
    'collections.update': CollectionUpdatePage,
    'collections.data.list': CollectionDataListPage,
    'collections.data.create': CollectionDataCreatePage,
    'collections.data.update': CollectionDataUpdatePage,
    'settings.general': SettingsGeneralPage,
    'settings.appearance': SettingsAppearancePage,
    'settings.users.list': UserListPage,
    'settings.profile': SettingsProfilePage,
    'settings.users.create': UserCreatePage,
    'settings.users.update': UserUpdatePage,
}
//#region Render body
export async function renderBody(body, { props, mode, url, view, params, ...query }) {
    // const permissions = {} 
    const permissions = {
        page_create: true,
        page_update: true,
        block_create: true,
        block_update: true,
        collection_create: true,
        collection_update: true,
    }

    await loadModuleDefinitions()

    let {page} = await getPage(url.split('?')[0])
    if (!page && (view === 'iframe' || !view)) view = 'pages.create'

    if (mode === 'edit') {
        return `
            <div data-body>
                ${await Sidebar({permissions, view, url, query})}
                <div data-main>
                    ${await pageMap[view]({query, view, url, permissions})}
                </div>
            </div>
            
            ${DeleteConfirm()}
            ${RelationFieldModal()}
            ${UpdateBlockAiModal({ id: null })}
            ${CreateBlockAiModal({ id: null })}
            <script src="/js/sortable.min.js"></script>
            <script src="/js/quill.library.js"></script>
            <script type="module" src="/js/sitebuilder.edit.js"></script>
        `
    }

    let previewContent = ''

    if (mode === 'preview') {

        previewContent = `
            <div data-last-section>
                ${Button({
                    text: 'Add Section', color: 'primary', action: 'add-section', dataset: {
                        order: (body.length + 1) ?? 1
                    }
                })}
            </div>
        `
    }

    if (mode === 'view') {
        previewContent = '<script src="/js/sitebuilder.view.js"></script>'
    }

    if (mode === 'preview') {
        previewContent += `<script type="module" src="/js/sitebuilder.preview.js"></script>`
    }

    const request = {
        query,
        params
    }

    return `
        <div data-body data-page-id="${page?.id}">
            ${(await Promise.all(body.map(x => renderModule(x, { props, mode, definitions, permissions, request })))).join('')}
            ${previewContent}
        </div>
    `
}
//#endregion

async function getPageModules(pageId) {
    return db('modules')
        .query()
        .filter('pageId', '=', pageId)
        .all()
        .then(res => res.sort((a, b) => a.order > b.order ? 1 : -1))
}

export async function renderPage(req, res) {
    const id = Math.random()
    console.time('page request ' + req.url + ' ' + id)
    const { page, params } = await getPage(req.params[0])
    const mode = req.query.mode ?? 'view'
    const view = req.query.view ?? ''

    let props = {}
    props.settings = await db('settings').query().first() ?? {}

    if (!page) {
        if (mode == 'edit') {

            const html = layouts.default({
                head: stylesheet,
                body: await renderBody([], { ...req.query, mode, url: req.url, view }),
                title: 'Untitled',
                theme: 'dark'
            })

            return res.send(html)
        } else {
            return res.send('404');
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
            console.log(props)
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

    const tailwind = JSON.stringify({ darkMode: 'class' })

    const html = layouts.default({
        mode,
        head: head ?? '',
        body: await renderBody(modules, { ...req.query, props, params, mode, url: req.url, view }),
        theme: mode === 'edit' ? 'dark' : 'light',
        tailwind,
        script: page.script,
        style: page.style,
        dir: page.dir,
        lang: page.lang,
        include_site_head: page.include_site_head,
        seo,
        settings: await db('settings').query().first() ?? {}
    })

    console.timeEnd('page request ' + req.url + ' ' + id)
    res.send(html)
}