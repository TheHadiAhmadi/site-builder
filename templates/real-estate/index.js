
export default {
    definitions: [
        import('./definitions/PageHeading.js'),
        import('./definitions/TextHTML.js'),
        import('./definitions/Videos.js'),
        import('./definitions/Image.js'),
        import('./definitions/Header.js'),
        import('./definitions/Hero.js')
    ],
    pages: [
        {
            title: 'Landing',
            name: 'Landing',
            slug: '/',
            modules: [
                {
                    name: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                name: 'Header',
                                cols: 12,
                                props: {}
                            },
                            {
                                name: 'Hero',
                                cols: 12,
                                props: {
                                    video: "36pq4GxE",
                                    title: "Khana, For you",
                                    subtitle: "Best place to find your next house",
                                    button_link: "/properties",
                                    button_text: "View all properties"   
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: 'About',
            name: 'About',
            slug: '/about',
            modules: [
                {
                    name: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                name: 'Header',
                                cols: 12,
                                props: {}
                            },
                            {
                                name: 'Page Heading',
                                cols: 12,
                                props: {
                                    title: 'ABOUT KHANA',
                                    subtitle: 'Learn More About Khana...',
                                    background_image: 'about.jpg'
                                }
                            },
                        ]
                    },
                },
                {
                    name: 'Section',
                    props: {
                        fullWidth: false,
                        content: [
                            {
                                name: "Text HTML",
                                props: {
                                    content: '<div class="mt-8"><h1 class="text-2xl font-bold">About Me</h1><p>This is about me section</p></div>'
                                }
                            }
                        ]
                    }
                },
            ]
        },
        {
            title: 'Neighbourhoods | Khana Real Estate',
            name: 'Neighbourhoods',
            slug: '/neighbourhoods',
            modules: [
                {
                    name: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                name: 'Header',
                                props: {}
                            },
                            {
                                name: 'Page Heading',
                                props: {
                                    title: 'Neighbourhoods',
                                    subtitle: 'Learn about our exclusive neighbourhoods in the area.',
                                    background_image: 'home-poster.jpg'
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: 'Properties | Khana Real Estate',
            name: 'Properties',
            slug: '/properties',
            modules: [
                {
                    name: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                name: 'Header',
                                props: {}
                            },
                            {
                                name: 'Page Heading',
                                props: {
                                    title: 'Properties',
                                    subtitle: 'View my exclusive listings. Contact me for further information',
                                    background_image: 'properties.jpeg'
                                }
                            },
                        ]
                    }
                },
                {
                    name: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                name: 'Videos',
                                props: {
                                    title: 'Featured Videos',
                                    videos: []
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            name: 'Property detail',
            slug: '/properties/{{slug}}',
            title: '{{pageContent.title}} | Khana Real Estate',
            dynamic: true,
            collection: 'Properties',
            modules: [
                {
                    name: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                name: 'Header',
                                props: {}
                            },
                            {
                                name: 'Image',
                                links: {
                                    src: "main_image",
                                    alt: "title"
                                },
                                props: {}
                            },
                            
                        ]
                    }
                },
                {
                    name: 'Section',
                    props: {
                        content: [
                            {
                                name: 'Text HTML',
                                links: {
                                    content: "description"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ],
    collections: [
        {
            name: 'Properties',
            fields: [
                {
                    type: 'input',
                    slug: 'title',
                    label: 'Title'
                },
                {
                    type: 'input',
                    slug: 'slug',
                    label: 'Slug'
                },
                {
                    type: 'select',
                    slug: 'type',
                    label: 'Property type',
                    items: [
                        "Residential",
                        "Commercial",
                        "Land",
                        "Others"
                    ]
                },
                {
                    type: 'file',
                    slug: 'main_image',
                    label: 'Main Image'
                },
                {
                    type: 'file',
                    slug: 'images',
                    label: 'Images',
                    multiple: true
                },
                {
                    type: 'input',
                    slug: 'address',
                    label: 'Address'
                },
                {
                    type: 'input',
                    slug: 'bedrooms',
                    label: 'Beds'
                },
                {
                    type: 'input',
                    slug: 'bathrooms',
                    label: 'Bathrooms'
                },
                {
                    type: 'input',
                    slug: 'postal_code',
                    label: 'Postal Code'
                },
                {
                    type: 'input',
                    slug: 'price',
                    label: 'Price'
                },
                {
                    type: 'textarea',
                    slug: 'description',
                    label: 'Description'
                },
                {
                    type: 'checkbox',
                    slug: 'active',
                    label: 'Is Active'
                },

            ],
            contents: [
                {
                    title: "26 HARRISON RD",
                    slug: "26-harrison-rd",
                    main_image: "harrison-rd.jpeg",
                    images: ["harrison-rd-1.jpeg", "harrison-rd-2.jpeg"],
                    address: "26 Harrison Rd",
                    bedrooms: "4",
                    bathrooms: "4",
                    postal_code: "M2L1V4",
                    price: "3250000",
                    description: "A Must See! Exceptional 90 by 125 Lot on prestigious Harrison Rd. A Lovely Bungalow Located In The High Demand St. Andrews - Windfields Area Surrounded By Multi-Million Dollar Homes. Easy Access To Bayview Avenue And 401. A Great Opportunity. Convenient To The Best Private And Public Schools In Toronto.",
                    active: "true"
                },
                {
                    title: "123 MAPLE ST",
                    slug: "123-maple-st",
                    main_image: "maple-st.jpeg",
                    images: ["maple-st-1.jpeg", "maple-st-2.jpeg"],
                    address: "123 Maple St",
                    bedrooms: "3",
                    bathrooms: "2",
                    postal_code: "L3R2B3",
                    price: "750000",
                    description: "Charming 3-bedroom home located in the heart of Markham. Featuring a spacious living area, modern kitchen, and a beautiful backyard. Perfect for families, close to parks, schools, and shopping centers.",
                    active: "true"
                },
                {
                    title: "456 OAK AVE",
                    slug: "456-oak-ave",
                    main_image: "maple-ln.jpeg",
                    images: ["oak-ave-1.jpeg", "oak-ave-2.jpeg"],
                    address: "456 Oak Ave",
                    bedrooms: "5",
                    bathrooms: "5",
                    postal_code: "N1H6B7",
                    price: "1200000",
                    description: "Luxurious 5-bedroom home with a private pool and landscaped garden. Situated in a quiet neighborhood in Guelph, this property offers ample space and modern amenities for a comfortable lifestyle.",
                    active: "false"
                },
                {
                    title: "789 PINE DR",
                    slug: "789-pine-dr",
                    main_image: "pine-dr.jpeg",
                    images: ["pine-dr-1.jpeg", "pine-dr-2.jpeg"],
                    address: "789 Pine Dr",
                    bedrooms: "4",
                    bathrooms: "3",
                    postal_code: "K2J4A1",
                    price: "950000",
                    description: "Beautiful 4-bedroom home located in Ottawa. Features include an open-concept living area, gourmet kitchen, and a large deck for outdoor entertaining. Close to schools, shopping, and public transit.",
                    active: "true"
                },
                {
                    title: "101 BIRCH LN",
                    slug: "101-birch-ln",
                    main_image: "birch-ln.jpeg",
                    images: ["birch-ln-1.jpeg", "birch-ln-2.jpeg"],
                    address: "101 Birch Ln",
                    bedrooms: "2",
                    bathrooms: "1",
                    postal_code: "P1H2C3",
                    price: "400000",
                    description: "Cozy 2-bedroom cottage located in Muskoka. Perfect for a weekend getaway, this property offers serene surroundings, a fireplace, and easy access to lakes and hiking trails.",
                    active: "true"
                }
            ]
        },
        {
            name: 'Videos',
            fields: [
                {
                    type: 'input',
                    slug: 'title',
                    label: 'Title'
                },
                {
                    type: 'input',
                    slug: 'url',
                    label: 'Url'
                },
                {
                    type: 'file',
                    slug: 'image',
                    label: 'Image',
                },
                {
                    type: 'select',
                    slug: 'type',
                    label: 'Type',
                    items: [
                        'Featured Properties',
                        'Sold Properties',
                        'Exclusive Properties',
                    ]
                }
            ],
            contents: [
                
            ]
        },
        {
            name: 'Neighbourhoods',
            fields: [
                {
                    type: 'input',
                    slug: 'title',
                    label: 'Title'
                },
                {
                    type: 'input',
                    slug: 'city',
                    label: 'City'
                },
                {
                    type: 'textarea',
                    slug: 'content',
                    label: 'Content',
                },
                {
                    type: 'location',
                    slug: 'location',
                    label: 'Location',
                },
                {
                    type: 'relation',
                    slug: 'similar_neighbourhoods',
                    label: 'Similar Neighbourhoods',
                    collection: 'Neighbourhoods',
                    multiple: true
                },
                
            ],
            contents: [
                
            ]
        }
    ],    
}