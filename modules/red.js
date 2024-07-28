import { db } from '#services'

const template = `
<div class="flex flex-col p-4 bg-red-500 gap-4">
    <h1 class="font-bold">Red plugin</h1>
    <div class="flex-flex-col gap-2 border-b">
        {{value.text}}
    </div>
</div>
`

const contentType = {
    name: 'red',
    fields: [
        {
            type: 'text',
            label: 'Title'
        },
    ]
}

async function load({contents}) {
    // const items = await db('contents').query({}).find(res => res.data.filter(x => x._type == 'red'))
    console.log(contents)
    return { value: contents[0] }
}

async function action(req) {
    if(req.type === 'insert') {
        await db('contents').insert({_type: 'red', ...req.body})
    } else if(req.type === 'delete') {
        await db('contents').remove({id: req.body})
    } else if(req.type === 'update') {
        await db('contents').update(req.body)
    }
}

export default {
    name: 'Red',
    template,
    contentType,
    load,
    action
}