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
                slug: "slug",
                label: "Slug",
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
                image: "4J9MNtwk",
                name: "BMW M8 COUP 2022",
                passengers: "4",
                price: "2800",
                transmission: "Auto",
                category: "fvB2U16z"
            },
            {
                image: "QapOf23t",
                name: "FORTUNE GR",
                passengers: "4",
                price: "2500",
                transmission: "Auto",
                category: "CEXnt1fi"
            },
            {
                image: "s4WdCNQP",
                name: "Lamborghini Huracan",
                passengers: "2",
                price: "3000",
                transmission: "Manual",
                category: "xMJSN9xM"
            },
            {
                image: "poHx58is",
                name: "Another Car",
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
    }
];
