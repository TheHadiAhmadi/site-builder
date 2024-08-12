
export default {
    definitions: [],
    pages: [
        {
            title: 'Test',
            name: 'Test',
            slug: '/test',
            modules: []
        }
    ],
    collections: [
        {
            name: 'User',
            fields: [
                {
                    type: 'input',
                    slug: 'name',
                    label: "Name"
                }
            ],
            contents: [
                {
                    name: 'Hadi'
                },
                {
                    name: 'Hadi 2'
                },
                
            ]
        },
        {
            name: 'Fields',
            fields: [
                {
                    type: 'select',
                    slug: 'select',
                    label: 'Select',
                    items: ['one', 'two', 'three']
                },
                {
                    type: 'relation',
                    slug: 'author',
                    label: 'Author',
                    collection: 'User'
                }

            ],
            contents: [
                {
                    select: 'one'
                },
                {
                    select: 'two'
                },
                {
                    select: 'three'
                },
            ]
        }
    ],
}