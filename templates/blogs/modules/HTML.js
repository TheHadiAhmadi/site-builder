export default {
    name: 'HTML',
    template: `<div>{{{content}}}</div>`,
    props: [
        {
            type: 'textarea',
            slug: 'content',
            label: 'Content'
        }
    ]
}