const template = `
<div class="flex flex-col p-4 bg-red-500 gap-4">
    <h1 class="font-bold">Red plugin</h1>
    <div class="flex-flex-col gap-2">
        {{value.title}}
    </div>
</div>
`

const contentType = {
    name: 'red',
    fields: [
        {
            type: 'text',
            name: 'Title',
            slug: 'title'
        },
    ]
}

async function load({contents}) {
    return { value: contents[0] }
}

export default {
    name: 'Red',
    template,
    contentType,
    load
}