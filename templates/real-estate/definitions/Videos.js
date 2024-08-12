export default {
    name: 'Videos',
    template: `
        <section class="bg-gray-100 py-12">
            <div class="container mx-auto">
                <h1 class="text-center text-2xl font-bold text-gray-800 mb-2">
                    {{title}}
                </h1>
                <div class="flex flex-wrap gap-4">
                    {{#each videos}}
                        <div >{{ this.title }}</div>
                    {{/each}}
                </div>
            </div>
        </section>
    `,
    props: [
        {
            type: 'input',
            slug: 'title',
            label: 'Title',
        },
        {
            type: 'relation',
            slug: 'videos',
            label: 'Videos',
            collection: 'Videos',
            multiple: true,
        },
    ]
}