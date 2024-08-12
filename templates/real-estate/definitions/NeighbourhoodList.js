export default {
    name: 'Neighbourhood List',
    template: `
        <div class="flex flex-col gap-4">
            <h1 class="text-3xl font-bold text-center">{{title}}</h1>
            <div class="flex gap-[2%]">
                {{#each items}}
                    <a class="w-[32%]" href="/neighbourhoods/{{this.slug}}">
                        {{this.title}}
                    </a>
                {{/each}}
            </div>
        </div>
    `,
    props: [
        {
            type: 'input',
            slug: 'title',
            label: 'Title'
        },
        {
            type: 'relation',
            slug: 'items',
            label: 'Items',
            collection: 'Neighbourhoods',
            multiple: true
        },
    ]
}