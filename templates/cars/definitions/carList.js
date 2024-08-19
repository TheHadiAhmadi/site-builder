import { db } from '#services'

let template = `
    <div class="-m-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {{#each items}}
            <div class="p-2">
                <a href="/cars/{{this.id}}" class="block border rounded-lg overflow-hidden">
                    <img class="w-full" src="/files/{{this.image}}" alt="{{this.name}}">
                    <div class="px-6 py-4">
                        <div class="font-bold text-xl mb-2">
                            {{this.name}}
                        </div>
                        <p class="text-gray-700 text-base">
                            Passengers: {{this.passengers}}
                        </p>
                        <p class="text-gray-700 text-base">
                            Transmission: {{this.transmission}}
                        </p>
                        <p class="text-gray-700 text-base">
                            Price: \${{this.price}}
                        </p>
                    </div>
                </a>
            </div>
        {{/each}}
    </div>
`;

export default {
    props: [
        {
            slug: 'items',
            label: 'Items',
            type: 'relation',
            multiple: true,
            collection: 'Cars',
            hidden: true
        }
    ],
    template,
    async load({ request, module }) {
        // module.props
        const carsCollection = await db('collections').query().filter('name', '=', 'Cars').first()
        const categoriesCollection = await db('collections').query().filter('name', '=', 'Categories').first()
        const categories = await db('contents').query().filter('_type', '=', categoriesCollection.id).all()

        let query = db('contents').query().filter('_type', '=', carsCollection.id)

        if(request.query.q) {
            query = query.filter('name', 'like', request.query.q)
        }

        const category = categories.find(x => x.slug === request.params.slug)
        if(request.params.slug && category) {
            query = query.filter('category', '=', category.id)
        }

        const items = await query.all()

        return {
            items
        }
    }
}