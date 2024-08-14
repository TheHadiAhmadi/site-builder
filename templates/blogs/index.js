export default {
    collections: [
        {
            "name": "Blogs",
            "fields": [
                { "type": 'input', "slug": 'title', "label": 'Blog Title', "defaultValue": 'Untitled Blog' },
                { "type": 'textarea', "slug": 'shortContent', "label": 'Short Content', "defaultValue": '' },
                { "type": 'textarea', "slug": 'content', "label": 'Content', "defaultValue": '' },
                { "type": 'file', "slug": 'featuredImage', "label": 'Featured Image' },
                { "type": 'input', "slug": 'readingTime', "label": 'Reading Time', "defaultValue": '1 min read' },
                { "type": 'input', "slug": 'slug', "label": 'Slug', "defaultValue": 'untitled-blog' }
            ],
            contents: [
                {
                    "title": "Intro to AI",
                    "shortContent": "Understanding AI. A complete beginner guide...",
                    "content": "Understanding AI. A complete beginner guide...",
                    "featuredImage": "blog1.jpg",
                    "readingTime": "5 min read",
                    "slug": "intro-to-ai"
                  },
                  {
                    "title": "JavaScript Basics",
                    "shortContent": "Learn the basics of JavaScript programming...",
                    "content": "Learn the basics of JavaScript programming...",
                    "featuredImage": "blog2.png",
                    "readingTime": "4 min read",
                    "slug": "javascript-basics"
                  },
                  {
                    "title": "CSS Animations",
                    "shortContent": "Learn to create incredible animations using CSS...",
                    "content": "Learn to create incredible animations using CSS...",
                    // "featuredImage": "/images/blog3.jpg",
                    "readingTime": "7 min read",
                    "slug": "css-animations"
                  },
                  {
                    "title": "Getting Started with React",
                    "shortContent": "Learn how to build web apps using React JS...",
                    "content": "Learn how to build web apps using React JS...",
                    // "featuredImage": "/images/blog4.jpg",
                    "readingTime": "6 min read",
                    "slug": "getting-started-with-react"
                  },
                  {
                    "title": "Redux For Beginners",
                    "shortContent": "Getting started with Redux in your application...",
                    "content": "Getting started with Redux in your application...",
                    // "featuredImage": "/images/blog5.jpg",
                    "readingTime": "6 min read",
                    "slug": "redux-for-beginners"
                  },
                  // ... Insert more blog items here (up to 20)
            ]
        }
    ],
    definitions: [
        import('./modules/HTML.js'),
        import('./modules/Image.js'),
    ],
    pages: [
        {
            dynamic: true,
            collection: 'Blogs',
            slug: '/blogs/{{slug}}',
            title: '{{title}} | Blog post',
            name: "Blog post detail",
            modules: [
                {
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                definition: 'HTML',
                                props: {
                                    content: 'HTML Content of title'
                                }
                            },
                            // {
                            //     definition: 'HTML',
                            //     props: {
                            //         content: 'HTML Content of post heading with image'
                            //     }
                            // },
                            // {
                            //     definition: 'Image',
                            //     props: {},
                            //     links: {
                            //         src: 'featuredImage'
                            //     }
                            // },
                            // {
                            //     definition: 'HTML',
                            //     props: {},
                            //     links: {
                            //         content: 'title'
                            //     }
                            // }
                        ]
                    }
                },
                {
                    definition: 'Section',
                    props: {
                        fullWidth: false,
                        content: [
                            // {
                            //     definition: 'HTML',
                            //     props: {},
                            //     links: {
                            //         content: 'content'
                            //     }
                            // },
                            {
                                definition: 'HTML',
                                props: {
                                    content: 'HTML Content of post'
                                }
                            }
                        ]
                    }
                },
                {
                    definition: 'Section',
                    props: {
                        fullWidth: true,
                        content: [
                            {
                                definition: 'HTML',
                                props: {
                                    content: 'footer'
                                },
                            }
                        ]
                    }
                }
            ]
        }
    ]
}