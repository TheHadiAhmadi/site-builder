
export default {
    definitions: [
        import('./definitions/PageHeading.js'),
        import('./definitions/TextHTML.js'),
    ],
    pages: [
        {
            title: 'About',
            name: 'About',
            slug: '/about',
            modules: [
                {
                    name: 'Page Heading',
                    props: {
                        title: 'ABOUT NANCY',
                        subtitle: 'Learn More About Nancy Saedi...',
                        background_image: 'about.jpg'
                    }
                }
            ]
        },
        {
            name: 'Property detail',
            slug: '/properties/{{slug}}',
            title: '{{value.title}} | Nancy Saedi Real Estate',
            dynamic: true,
            collection: 'Properties',
            modules: [
                {
                    name: 'Text HTML',
                    props: {
                        "content": "HTML: {{value.title}} TITLE"
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
        }
    ],    
}