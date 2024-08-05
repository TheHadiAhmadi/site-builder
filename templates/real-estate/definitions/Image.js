export default {
    name: 'Image',
    template: '<img src="/files/{{src}}" alt="{{alt}}">',
    props: [
        {
            type: 'file',
            slug: 'src',
            label: 'Src'
        },
        {
            type: 'input',
            slug: 'alt',
            label: 'Alt'
        },
    ]
}