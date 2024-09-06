import { db } from "#services"

export default {
    name: 'Test function',
    slug: 'test_function',
    // props: [
    //     {
    //         slug: 'collection',
    //         type: 'collection',
    //         name: 'Collection'
    //     }
    // ],
    action(body, context) {

        console.log(body, context)
        // 
        return {}
    }
}