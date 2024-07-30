const template = `
<div class="bg-blue-200 p-4 border border-green-700">
    <div class="text-xl font-bold">
        {{value.title}}
    </div>
    <div class="p-4">
        {{value.description}}
    </div>
</div>
`

export default {
    name: 'Posts',
    template,
    multiple: false,
    contentType: {
        fields: [
            {
                type: 'text',
                name: 'Title',
                slug: 'title',
            },
            {
                type: 'text',
                name: 'Description',
                slug: 'description',
            },
        ]
    }
}