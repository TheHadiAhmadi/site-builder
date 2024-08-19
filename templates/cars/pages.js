export default [
    {
        name: 'Landing',
        slug: '/',
        seo: {

        },
        modules: []
    },
    {
        name: 'Car list',
        slug: '/cars',
        seo: {
            
        },
        modules: [
            {
                definition: 'Section',
                props: {
                    content: [
                        {
                            definition: 'Car List',
                            props: {
                                
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        name: 'Car detail',
        slug: '/cars/{{slug}}',
        seo: {
            
        },
        dynamic: true,
        collection: 'Cars',
        modules: []
    },
    {
        name: 'All Categories',
        slug: '/categories',
        seo: {},
        modules: [
            {
                definition: 'Section',
                props: {
                    content: [
                        {
                            definition: 'CarSearch',
                            props: {
                                categories: {
                                    filters: []
                                }
                            }
                        },
                        {
                            definition: 'Car List',
                            props: {}
                        }
                    ]
                }
            }
        ]
    },
    {
        name: 'Category Detail',
        slug: '/categories/{{slug}}',
        seo: {},
        dynamic: true,
        collection: 'Categories',
        modules: [
            {
                definition: 'Section',
                props: {
                    content: [
                        {
                            definition: 'CarSearch',
                            props: {
                                categories: {
                                    filters: []
                                }
                            }
                        },
                        {
                            definition: 'Car List',
                            props: {}
                        }
                    ]
                }
            }
        ]
    }
]