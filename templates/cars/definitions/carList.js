import { db } from '#services'

export async function load({ request, module }) {
    // module.props
    const categoriesCollection = await db('collections').query().filter('name', '=', 'Categories').first()
    const categories = await db('contents').query().filter('_type', '=', categoriesCollection.id).all()

    let filters = []

    if(request.query.q) {
        filters.push({
            field: 'name', 
            operator: 'like',
            value: request.query.q
        })
    }

    const category = categories.find(x => x.slug === request.params.slug)
    if(request.params.slug && category) {
        filters.push({
            field: 'category',
            operator: '=',
            value: category.id
        })
    }

    return {
        items: {
            filters,
            page: 1,
            perPage: 30
        }
    }
}

export const actions = {}