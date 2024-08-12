export default {
    "name": "Blog List Style 1",
    "template": `
    <div class="grid md:grid-cols-3 gap-4">
        {{#each posts as |post|}}
        <a href="{{linkPrefix}}{{post.slug}}" class="shadow-lg rounded p-4">
            <div class="h-64 bg-cover bg-center" style="background-image: url('{{post.featuredImage}}')"></div>
            <div class="mt-4">
                <h2 class="text-lg">{{post.title}}</h2>
                <p class="text-sm">{{post.shortContent}}</p>
                <p class="text-sm">{{post.readingTime}}</p>
            </div>
        </a>
        {{/each}}
    </div>
    `,
    "props": [
        { "type": 'input', "slug": 'linkPrefix', "label": 'Link Prefix', "defaultValue": '/' },
        { "type": 'relation', "slug": 'posts', "label": 'Posts'},
    ]
}