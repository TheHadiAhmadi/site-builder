const template = `
<div class="flex flex-col p-4 {{settings.bgColor}} gap-4">
    <h1 class="font-bold">{{settings.title}}</h1>
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

const settings = {
    fields: [
        {
            type: 'text',
            name: 'Title',
            slug: 'title',
            defaultValue: 'Red Plugin'
        },
        {
            type: 'text',
            name: 'Backgroud Color',
            slug: 'bgColor',
            defaultValue: 'bg-red-500'
        },
    ]
}

export default {
    name: 'Red',
    template,
    contentType,
    settings,
    multiple: false
}