import { Button } from "#components"
import { db } from "#services"
import { getPage, getSlug, getUrl } from "#helpers"
import hbs from 'handlebars'

async function DynamicPageSelect(page, content) {
    const items = await db('contents').query().filter('_type', '=', page.collectionId).all()

    function getText(content) {
        return content.name
    }

    return `<select style="width: max-content" data-select data-action="change-dynamic-page-content" data-trigger="change">
        ${items.map(x => `<option ${content?.id === x.id ? 'selected' : ''} value="id=${page.id}&contentId=${x.id}">${getText(x)}</option>`)}
    </select>`
}

export async function PageEditorPage({url, query, view, permissions}) {
    // const slug = decodeURIComponent(query.slug)
    let content;
    const id = query.id
    const page = await db('pages').query().filter('id', '=', id).first()
    if(page.dynamic && page.collectionId) {
        const contentId = query.contentId;
        console.log(contentId)
        if(contentId) {
            content = await db('contents').query().filter('id', '=', contentId).first()
            console.log(content)

        } else {
            content = await db('contents').query().filter('_type', '=', page.collectionId).first()
        }
    } 
    
    return `
        <div data-name="iframe" data-page-id="${page.id}">
            <div data-content-header>
                <div data-header-title>
                    ${view === 'iframe' ? Button({ action: 'open-add-block', outline: true, color: 'primary', text: `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z"/></svg>
                        <span data-add-block-button>Add Block</span>
                    `, dataset: {
                        'hide-desktop': true
                    }}) : ''}
                    ${page?.name ?? 'Untitled'}
                    ${view === 'iframe' ? `` : `
                        <a target="_blank" href="${slug}" data-button data-button-color="primary" data-button-ghost>
                            Preview
                            <svg data-icon xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M10.75 1a.75.75 0 0 0 0 1.5h1.69L8.22 6.72a.75.75 0 0 0 1.06 1.06l4.22-4.22v1.69a.75.75 0 0 0 1.5 0V1zM2.5 4v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V8.75a.75.75 0 0 1 1.5 0V13a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4.25a.75.75 0 0 1 0 1.5H3a.5.5 0 0 0-.5.5" clip-rule="evenodd"/></svg>
                        </a>
                        
                    `}
                </div>
                <div data-header-actions>
                    ${page?.dynamic ? await DynamicPageSelect(page, content) : ''}
                    ${permissions.page_update || permissions.page_seo ? `<a data-enhance data-button ${page?.dynamic ? 'data-button-icon' : ''} data-button-color="default" href="${getUrl({ view: 'pages.update', id: page?.id, back: encodeURIComponent('?view=iframe' + '&id='+ query.id + '&contentId=' + query.contentId) })}">
                            <svg data-icon data-icon-size="sm" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zM11 20h1.975l.35-2.65q.775-.2 1.438-.587t1.212-.938l2.475 1.025l.975-1.7l-2.15-1.625q.125-.35.175-.737T17.5 12t-.05-.787t-.175-.738l2.15-1.625l-.975-1.7l-2.475 1.05q-.55-.575-1.212-.962t-1.438-.588L13 4h-1.975l-.35 2.65q-.775.2-1.437.588t-1.213.937L5.55 7.15l-.975 1.7l2.15 1.6q-.125.375-.175.75t-.05.8q0 .4.05.775t.175.75l-2.15 1.625l.975 1.7l2.475-1.05q.55.575 1.213.963t1.437.587zm1.05-4.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5M12 12"/></svg>    
                            ${page?.dynamic ? '' : `<span data-page-settings-text>Page Settings</span>`}
                        </a>`: ''}
                    ${view === 'iframe' ? `
                        <a data-enhance href="?view=pages.list" data-button data-button-color="primary">Done</a>
                    ` : `
                        ${permissions.page_content || permissions.page_update ? `<a data-enhance href="?view=iframe&id=${query.id}&contentId=${query.contentId}" data-button data-button-color="primary">Edit</a>` : ''}
                    `}
                </div>
            </div>

            <div data-iframe-wrapper>
                <iframe class="iframe" src="${getSlug(page.slug, content)}?mode=${view === 'iframe' ? 'preview' : 'view'}"></iframe>
            </div>
        </div>
    `
}