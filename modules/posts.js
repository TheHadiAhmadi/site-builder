const template = `
<div class="bg-blue-200 p-4 border border-green-700">
    <div class="text-xl font-bold">
        {{title}}
    </div>
    <div class="p-4">
        {{description}}
    </div>
</div>
`

export default {
    name: 'Posts',
    template,
    contentType: {
        fields: [
            {
                type: 'text',
                name: 'Title',
            },
            {
                type: 'text',
                name: 'Description',
            },
        ]
    },
    async load({contents}) {
        console.log('load: ', contents)
        return contents[0]
        // return { title: 'one', description: 'description of one'}
    }
}