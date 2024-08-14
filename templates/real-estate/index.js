import collection from '../../src/handlers/collection.js';

export default {
    definitions: [
        import('./definitions/PageHeading.js'),
        import('./definitions/TextHTML.js'),
        import('./definitions/Videos.js'),
        import('./definitions/Image.js'),
        import('./definitions/Header.js'),
        import('./definitions/Hero.js'),
        import('./definitions/Footer.js'),
        import('./definitions/NeighbourhoodList.js')
    ],
    pages: [
        {
            title: 'Landing',
            name: 'Landing',
            slug: '/',
            modules: [
                {
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                definition: 'Header',
                                cols: 12,
                                props: {}
                            },
                            {
                                definition: 'Hero',
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
                },
                {
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        paddingTop: 0,
                        paddingBottom: 0,
                        content: [
                            {
                                definition: 'Footer',
                                props: {}
                            },
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
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                definition: 'Header',
                                cols: 12,
                                props: {}
                            },
                            {
                                definition: 'Page Heading',
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
                    definition: 'Section',
                    props: {
                        fullWidth: false,
                        content: [
                            {
                                definition: "Text HTML",
                                props: {
                                    content: '<div class="mt-8"><h1 class="text-2xl font-bold">About Me</h1><p>This is about me section</p></div>'
                                }
                            }
                        ]
                    }
                },
                {
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        paddingTop: 0,
                        paddingBottom: 0,
                        content: [
                            {
                                definition: 'Footer',
                                props: {}
                            },
                        ]
                    }
                }
            ]
        },
        {
            title: 'Neighbourhoods | Khana Real Estate',
            name: 'Neighbourhoods',
            slug: '/neighbourhoods',
            modules: [
                {
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                definition: 'Header',
                                props: {}
                            },
                            {
                                definition: 'Page Heading',
                                props: {
                                    title: 'Neighbourhoods',
                                    subtitle: 'Learn about our exclusive neighbourhoods in the area.',
                                    background_image: 'home-poster.jpg'
                                }
                            }
                        ]
                    }
                },
                {
                    definition: 'Section',
                    props: {
                        fullWidth: false,
                        content: [
                            {
                                definition: 'Neighbourhood List',
                                props: {
                                    items: [],
                                    title: 'Neighbourhoods'
                                }
                            }
                        ]
                    }
                },
                {
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        paddingTop: 0,
                        paddingBottom: 0,
                        content: [
                            {
                                definition: 'Footer',
                                props: {}
                            },
                        ]
                    }
                }
            ]
        },
        {
            title: '{{title}} | Khana Real Estate',
            name: "Neighbourhood Detail",
            slug: '/neighbourhoods/{{slug}}',
            dynamic: true,
            collection: 'Neighbourhoods',
            modules: [
                {
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        paddingTop: 0,
                        paddingBottom: 0,
                        content: [
                            {
                                definition: 'Header',
                                props: {}
                            },
                            {
                                definition: 'Page Heading',
                                links: {
                                    title: 'title',
                                    background_image: 'image'
                                },
                                props: {
                                    'subtitle': 'Kabul'
                                }
                            }
                        ]
                    }
                },
                {
                    definition: 'Section',
                    props: {
                        fullWidth: false,
                        content: [
                            {
                                definition: 'Text HTML',
                                links: {
                                    content: 'content'
                                } ,
                                props: {}
                            },
                            {
                                definition: 'Neighbourhood List',
                                props: {
                                    title: 'Similar Neighbourhoods',
                                },
                                links: {
                                    items: 'similar_neighbourhoods'
                                }
                            }
                        ]
                    }
                },
                {
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        paddingTop: 0,
                        paddingBottom: 0,
                        content: [
                            {
                                definition: 'Footer',
                                props: {}
                            },
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
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                definition: 'Header',
                                props: {}
                            },
                            {
                                definition: 'Page Heading',
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
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                definition: 'Videos',
                                props: {
                                    title: 'Featured Videos',
                                    videos: []
                                }
                            }
                        ]
                    }
                },
                {
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        paddingTop: 0,
                        paddingBottom: 0,
                        content: [
                            {
                                definition: 'Footer',
                                props: {}
                            },
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
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                definition: 'Header',
                                props: {}
                            },
                            {
                                definition: 'Image',
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
                    definition: 'Section',
                    props: {
                        content: [
                            {
                                definition: 'Text HTML',
                                links: {
                                    content: "description"
                                }
                            }
                        ]
                    }
                },
                {
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        paddingTop: 0,
                        paddingBottom: 0,
                        content: [
                            {
                                definition: 'Footer',
                                props: {}
                            },
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
                    type: 'relation',
                    slug: 'neighbourhood',
                    label: 'Neighbourhood',
                    collection: 'Neighbourhoods'
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
                    type: 'rich-text',
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
                    slug: 'slug',
                    label: 'Slug'
                },
                {
                    type: 'input',
                    slug: 'city',
                    label: 'City'
                },
                {
                    type: 'file',
                    slug: 'image',
                    label: 'Image'
                },
                {
                    type: 'rich-text',
                    slug: 'content',
                    label: 'Content',
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
                {
                    title: 'Barchi',
                    slug: 'barchi',
                    city: 'Kabul',
                    image: 'barchi.jpg',
                    content: `<p><strong>Barchi</strong> is a residential area located in the southwestern part of Kabul. This region has transformed into a large community with over 1 million inhabitants due to internal migrations within Afghanistan, particularly from provinces like Maidan Wardak, Ghazni, Parwan, Bamyan, Ghor, and Daikundi. The significant influx of people, mainly from the Hazara ethnic group, has shaped Barchi into a densely populated urban area.</p>

                        <p>The population growth in <strong>Barchi</strong> has been remarkable. In 2002, the population was estimated to be around 200,000, but by 2018, Médecins Sans Frontières estimated it to have surpassed 1.5 million. This rapid increase is primarily attributed to the return of Afghan refugees from Iran and Pakistan, as well as internal migration from rural areas to the capital. Over 95% of the population in Barchi belongs to the Hazara community. Unfortunately, in recent years, western Kabul, including Barchi, has become one of the most insecure areas of the city, with numerous attacks on educational centers, shrines, and mosques, often claimed by the group known as ISIS.</p>`,
                    similar_neighbourhoods: []
                },
                {
                    title: 'Shahr-e-Naw',
                    slug: 'shahr-e-naw',
                    city: 'Kabul',
                    image: 'shar-e-naw.jpg',
                    content: `<p><strong>Shahr-e-Naw</strong> is one of the most prominent and central neighborhoods in Kabul. Known for its bustling streets and commercial activity, Shahr-e-Naw hosts numerous shops, restaurants, and hotels. The area is a blend of modernity and tradition, attracting both locals and expatriates alike. In recent years, it has also become a hub for cultural activities and events.</p>
                
                        <p>Shahr-e-Naw's strategic location in the heart of Kabul makes it a vital commercial and social center. The neighborhood is well-known for its parks, including Shahr-e-Naw Park, which offers a green escape in the middle of the city. Despite its growth and development, the area has not been immune to the security challenges faced by Kabul, with occasional incidents impacting daily life.</p>`,
                    similar_neighbourhoods: []
                },
                {
                    title: 'Wazir Akbar Khan',
                    slug: 'wazir-akbar-khan',
                    city: 'Kabul',
                    image: 'wazir-akbar-khan.jpg',
                    content: `<p><strong>Wazir Akbar Khan</strong> is one of the most affluent neighborhoods in Kabul, located to the north of the city center. This area is home to many embassies, government offices, and residences of high-ranking officials. The neighborhood is known for its spacious villas, tree-lined streets, and a higher level of security compared to other parts of Kabul.</p>
                
                        <p>Wazir Akbar Khan is a symbol of Kabul's elite, with its well-maintained roads and modern infrastructure. However, the area has also been a target for high-profile attacks due to its political significance. Despite these challenges, it remains one of the most sought-after residential areas in the city.</p>`,
                    similar_neighbourhoods: []
                },
                {
                    title: 'Kart-e-Se',
                    slug: 'kart-e-se',
                    city: 'Kabul',
                    image: 'karte-3.jpg',
                    content: `<p><strong>Kart-e-Se</strong> is a residential and commercial neighborhood located in the western part of Kabul. It is known for its diverse population, including a significant number of Hazaras, and has a vibrant community atmosphere. The area is filled with markets, schools, and cultural centers, making it a lively part of the city.</p>
                
                        <p>Kart-e-Se has seen substantial growth over the years, with new housing developments and businesses emerging. Despite this progress, the neighborhood has faced security issues, particularly due to its location in western Kabul, which has been prone to instability. Nevertheless, Kart-e-Se remains an important and resilient part of Kabul's urban landscape.</p>`,
                    similar_neighbourhoods: []
                },
            ]
        }
    ],    
}