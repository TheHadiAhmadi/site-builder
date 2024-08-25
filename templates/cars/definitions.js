export default [
    {
        name: 'Car List',
        file: 'carList.js',
        props: [
            {
                "slug": "items",
                "label": "Items",
                "type": "relation",
                "multiple": true,
                "collection": "Cars",
                "hidden": true
            }
        ],
        template: `
            <div class="-m-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {{#each items}}
                    <div class="p-2">
                        <a href="/cars/{{this.slug}}" class="block border rounded-lg overflow-hidden">
                            <img class="w-full" src="/files/{{this.image}}" alt="{{this.name}}">
                            <div class="px-6 py-4">
                                <div class="font-bold text-xl mb-2">
                                    {{this.name}}
                                </div>
                                <p class="text-gray-700 text-base">
                                    Passengers: {{this.passengers}}
                                </p>
                                <p class="text-gray-700 text-base">
                                    Transmission: {{this.transmission}}
                                </p>
                                <p class="text-gray-700 text-base">
                                    Price: \${{this.price}}
                                </p>
                            </div>
                        </a>
                    </div>
                {{/each}}
            </div>
        `
    }, 
    {
        name: 'Contact Us',
        file: 'contactUs.js',
        template: `
            <div class="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
                <form method="POST" action="this.submit">
                    <div class="mb-4">
                        <label for="name" class="block text-sm font-medium text-gray-700">Name:</label>
                        <input id="name" name="name" type="text" required
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                    </div>
                    <div class="mb-4">
                        <label for="email" class="block text-sm font-medium text-gray-700">Email:</label>
                        <input id="email" name="email" type="email" required
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                    </div>
                    <div class="mb-4">
                        <label for="subject" class="block text-sm font-medium text-gray-700">Subject:</label>
                        <input id="subject" name="subject" type="text" required
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                    </div>
                    <div class="mb-4">
                        <label for="message" class="block text-sm font-medium text-gray-700">Message:</label>
                        <textarea id="message" name="message" required
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                    </div>
                    <div>
                        <button type="submit"
                                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Send
                        </button>
                    </div>
                </form>
            </div>
        `
    }, 
    {
        name: 'Header',
        template: `
            <header class="bg-gray-800 p-4">
                <div class="flex justify-between items-center">
                    <div class="text-white font-bold text-xl">
                        <!-- Logo -->
                        <img src="/files/{{settings.logo}}" alt="Logo" class="h-8" />
                    </div>
                    <nav class="space-x-4">
                        <a href="/" class="text-white hover:text-gray-400">Home</a>
                        <a href="/categories" class="text-white hover:text-gray-400">Categories</a>
                        <a href="/about" class="text-white hover:text-gray-400">About Us</a>
                    </nav>
                </div>
            </header>
        `
    },
    {
        name: "Section Heading",
        template: "<div class=\"my-8\">\n<h1 class=\"text-center font-bold text-4xl mb-4\">{{title}}</h1>\n<p class=\"mx-auto max-w-2xl text-sm text-gray-700 text-center\">{{description}}</p>\n</div>",
        props: [
            {
                type: "input",
                slug: "title",
                label: "Title"
            },
            {
                type: "textarea",
                slug: "description",
                label: "Description"
            }
        ],
    },
    {
        name: "CarSearch",
        "template": "<div class=\"flex flex-col w-64 p-4 border rounded bg-white shadow-lg\">\n    <h2 class=\"text-lg font-semibold mb-2\">Search Cars</h2>\n<a href=\"/categories\">All</a>\n     {{#each categories}}\n            <a href=\"/categories/{{this.slug}}\">{{this.name}}</a>\n      {{/each}}\n            \n</div>",
        "props": [
            {
                type: "input",
                slug: "passengers",
                label: "Passenger count"
            },
            {
                type: "checkbox",
                slug: "recent-arrivals",
                label: "Recent Arrivals"
            },
            {
                type: "relation",
                slug: "categories",
                label: "Categories",
                collection: "Categories",
                multiple: true
            },
            {
                type: "input",
                slug: "curernt",
                label: "Current category"
            }
        ]
    },
    {
        name: "Car Details",
        template: `
            <div class="container mx-auto p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="w-full">
                        <h2 class="text-2xl font-bold mb-4">Car Details</h2>
                        <img src="/files/{{image.id}}" alt="{{name}}" class="w-full h-64 object-cover mb-4 rounded-lg">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Name</label>
                            <p class="text-lg font-semibold text-gray-900">{{name}}</p>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Passenger Count</label>
                            <p class="text-lg text-gray-800">{{passengers}}</p>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Transmission</label>
                            <p class="text-lg text-gray-800">{{transmission}}</p>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Price</label>
                            <p class="text-lg text-gray-800">\${{price}}</p>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Category</label>
                            <p class="text-lg text-gray-800">{{category.name}}</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        props: [
            { "type": "input", "slug": "name", "label": "Name" },
            { "type": "input", "slug": "passengers", "label": "Passenger count" },
            {
              "type": "select",
              "slug": "transmission",
              "label": "Transmission",
              "multiple": false,
              "items": ["Auto", "Manual"]
            },
            {
              "type": "file",
              "slug": "image",
              "multiple": false,
              "label": "Image",
              "file_type": "image"
            },
            { "type": "input", "slug": "price", "label": "Price" },
            {
              "type": "relation",
              "slug": "category",
              "label": "Category",
              "collection": "Categories",
              "multiple": false
            }
        ]
    },
    {
        name: "CompanyLogos",
        template: "<div class=\"flex justify-center overflow-auto p-4\">\n    {{#each images}}\n        <div class=\"m-4\">\n            <img src=\"/files/{{this}}\" alt=\"Company Logo\" class=\"shrink-0 h-20 object-contain\">\n        </div>\n    {{/each}}\n</div>",
        props: [
            {
                type: "file",
                slug: "images",
                label: "Company Logos",
                file_type: "image",
                multiple: true
            }
        ],
    }

]