const template = `
<div class="flex flex-col p-4 gap-4">
    <h1 class="font-bold">{{settings.title}}</h1>
    <div class="flex flex-col gap-{{settings.space_between_items}}">
        {{#each value}}
            <div class="p-2 {{#if ../settings.show_borders}} border -mt-1 {{/if}}">
                <div class="text-xl font-bold">{{this.title}}</div>
                <div class="text-sm text-gray-800">{{this.description}}</div>
            </div>
        {{/each}}
    </div>
    {{#unless value.length }}
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

const settings = {
    fields: [
        {
            name: 'Show borders',
            slug: 'show_borders',
            type: 'text',
            defaultValue: true
        },
        {
            name: 'Title',
            slug: 'title',
            type: 'text',
            defaultValue: 'News'
        },
        {
            name: 'Space between items',
            slug: 'space_between_items',
            type: 'text',
            defaultValue: '4'
        }
    ]
}

export default {
    name: 'News',
    template,
    contentType,
    settings
}