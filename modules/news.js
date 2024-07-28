import { db } from '#services'

const template = `
<div class="flex flex-col p-4 gap-4">
    <h1 class="font-bold">Latest News</h1>
    <div class="flex-flex-col gap-2 border-b">
        {{#each items}}
            <div class="p-2 bg-gray-100 border border-b-0">
                <div class="text-xl font-bold">{{this.title}}</div>
                <div class="text-lg text-gray-700">{{this.description}}</div>
            </div>
        {{/each}}
    </div>
    {{#unless items.length }}
        No items
    {{/unless}}
</div>
`

const contentType = {
    name: 'news',
    fields: [
        {
            type: 'text',
            name: 'Title',
            slug: 'title'
        },
        {
            type: 'text',
            name: 'Description',
            slug: 'description'
        },
    ]
}

async function load({moduleId, contents}) {
    const items = contents

    return { items }
}

async function action(req) {
    if(req.type === 'insert') {
        await db('contents').insert(req.body)
    } else if(req.type === 'delete') {
        await db('contents').remove({id: req.body})
    } else if(req.type === 'update') {
        await db('contents').update(req.body)
    }
}

export default {
    name: 'News',
    template,
    contentType,
    load,
    action
}