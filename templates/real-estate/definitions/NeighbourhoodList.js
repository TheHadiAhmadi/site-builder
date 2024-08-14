export default {
    name: 'Neighbourhood List',
    template: `
        
        <div class="flex flex-col gap-4 py-12">
            <h1 class="text-3xl font-bold text-center">{{title}}</h1>
            <div class="flex gap-[2%]">
                {{#each items}}
                    <div class="group relative w-[32%] h-64 bg-cover bg-center rounded-lg overflow-hidden shadow-lg"
                        style="background-image: url('/files/{{this.image}}');">
                        <a href="/neighbourhoods/{{this.slug}}" class="block w-full h-full">
                            <div class="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 flex flex-col justify-end p-4">
                                <h3 class="text-white text-lg font-semibold transition-all duration-300 transform translate-y-[40px] group-hover:translate-y-0">
                                    {{this.title}}
                                </h3>
                                <button class="mt-2 px-4 py-2 bg-white text-black text-sm font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Details
                                </button>
                            </div>
                        </a>
                    </div>
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