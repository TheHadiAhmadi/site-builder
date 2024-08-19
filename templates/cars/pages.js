const header = {
    definition: 'Section',
    props: {
        content: [{
            definition: 'Header',
            props: {}
        }]
    }
}
export default [
    {
        name: 'Landing',
        slug: '/',
        seo: {

        },
        modules: [
            header,
            {
                definition: 'Section',
                props: {
                    fullWidth: false,
                    content: [
                        {
                            definition: 'CompanyLogos',
                            props: {
                                images: ["82IaUIrT", "vEgJiKHj", "PgXL8C0k", "3rI6ilHQ", "Tqk8icck"]
                            }
                        }
                    ]
                }
            }
        ]
    },
    {
        name: 'Car detail',
        slug: '/cars/{{id}}',
        seo: {
            
        },
        dynamic: true,
        collection: 'Cars',
        modules: [
            JSON.parse(JSON.stringify(header)),
        ]
    },
    {
        name: 'All Categories',
        slug: '/categories',
        seo: {},
        modules: [
            JSON.parse(JSON.stringify(header)),
            {
                definition: 'Section',
                props: {
                    fullWidth: false,
                    paddingTop: 40,
                    content: [
                        {
                            definition: 'Section Heading',
                            props: {
                                title: "Choose a car",
                                description: 'Click on a car to see details.'
                            }
                        },
                        {
                            definition: 'CarSearch',
                            cols: 3,
                            props: {
                                categories: {
                                    filters: []
                                }
                            }
                        },
                        {
                            definition: 'Car List',
                            cols: 7,
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
            JSON.parse(JSON.stringify(header)),
            {
                definition: 'Section',
                props: {
                    fullWidth: false,
                    paddingTop: 40,
                    content: [
                        {
                            definition: 'Section Heading',
                            props: {
                                title: "Choose a car",
                                description: 'Click on a car to see details.'
                            }
                        },
                        {
                            definition: 'CarSearch',
                            cols: 3,
                            props: {
                                categories: {
                                    filters: []
                                }
                            }
                        },
                        {
                            definition: 'Car List',
                            cols: 7,

                            props: {}
                        }
                    ]
                }
            }
        ]
    }
]