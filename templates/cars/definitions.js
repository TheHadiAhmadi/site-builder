export default [
    {
        name: 'Car List',
        file: 'carList.js'
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
    }

]