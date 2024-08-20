export default [
    {
        name: "Cars",
        fields: [
            {
                slug: "name",
                label: "Name",
                type: "input",
            },
            {
                type: "input",
                slug: "passengers",
                label: "Passenger count",
            },
            {
                type: "select",

                slug: "transmission",
                label: "Transmission",
                items: ["Auto", "Manual"],
                multiple: false,
            },
            {
                type: "file",
                slug: "image",
                label: "Image",
                file_type: 'image',
                multiple: false,
            },
            {
                type: "input",
                slug: "price",
                label: "Price",
            },
            {
                type: "relation",

                slug: "category",
                label: "Category",
                collection: "Categories",
                multiple: false,
            },
        ],
        contents: [
            {
                name: "BMW M8 COUP 2022",
                image: "4J9MNtwk",
                passengers: "4",
                price: "2800",
                transmission: "Auto",
                category: "fvB2U16z"
            },
            {
                name: "FORTUNE GR",
                image: "QapOf23t",
                passengers: "4",
                price: "2500",
                transmission: "Auto",
                category: "CEXnt1fi"
            },
            {
                name: "Lamborghini Huracan",
                image: "s4WdCNQP",
                passengers: "2",
                price: "3000",
                transmission: "Manual",
                category: "xMJSN9xM"
            },
            {
                name: "Another Car",
                image: "poHx58is",
                passengers: "4",
                price: "3002",
                transmission: "Manual",
                category: "xMJSN9xM",
            },
        ],
    },
    {
        name: 'Categories',
        fields: [
            { type: "input", slug: "slug", label: "Slug" },
        ],
        contents: [
            {
                slug: "compact",
                name: "Compact",
                id: "G84aZdUK",
            },
            {
                slug: "standard",
                name: "Standard",
                id: "fvB2U16z",
            },
            {
                slug: "premium",
                name: "Premium",
                id: "CEXnt1fi",
            },
            {
                slug: "premium-plus",
                name: "Premium Plus",
                id: "xMJSN9xM",
            },
            {
                slug: "suv",
                name: "SUV",
                id: "UyO9ajd3",
            },
            {
                slug: "minivan",
                name: "Minivan",
                id: "Z5n5013a",
            }
        ]
    },
    {
        name: 'ContactUs',
        fields: [
            { type: "input", slug: "subject", label: "Subject" },
            { type: "textarea", slug: "message", label: "Message" },
        ],
        contents: []
    }
];
