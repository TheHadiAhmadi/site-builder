export default {
    name: 'Text HTML',
    template: '<div>{{{content}}}</div>',
    props: [
        {
            type: 'textarea',
            slug: 'content',
            label: 'Content',
            defaultValue: 'Click Here to change content...'
        }
    ]
}