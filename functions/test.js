export default {
    name: 'Test function',
    slug: 'test_function',
    mode: 'action',
    props: [
        {
            slug: 'collection',
            type: 'collection',
            name: 'Collection'
        }
    ],
    run(req) {
        console.log('TEST: ', {req})
    }
}