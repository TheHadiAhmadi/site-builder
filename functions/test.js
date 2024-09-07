import { db } from "#services"

export default {
    name: 'Test function',
    slug: 'test_function',
    action(body, context) {

        console.log(body, context)
        // 
        return {}
    }
}