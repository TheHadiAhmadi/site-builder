import hbs from 'handlebars'

export default {
    default: hbs.compile(`<!DOCTYPE html>
    <html lang="{{lang}}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        
        <link rel="icon" href="/files/{{settings.favicon}}.svg" type="image/svg+xml">

        <title>{{seo.title}}</title>
        <meta name="description" content="{{seo.meta_description}}">
        <meta name="keywords" content="{{seo.meta_keywords}}">
        <meta name="robots" content="{{seo.robots}}">
        
        <!-- Open Graph Tags -->
        <meta property="og:site_name" content="{{settings.site_name}}">
        <meta property="og:title" content="{{seo.title}}">
        <meta property="og:type" content="{{seo.og_type}}">
        <meta property="og:description" content="{{seo.meta_description}}">
        <meta property="og:image" content="/files/{{seo.social_image}}">
        
        <!-- Twitter Card Tags -->
        <meta name="twitter:card" content="{{seo.twitter_card}}">
        <meta name="twitter:title" content="{{seo.title}}">
        <meta name="twitter:description" content="{{seo.meta_description}}">
        <meta name="twitter:image" content="/files/{{seo.social_image}}">


        <style>
            {{{style}}}
        </style>
        
        
        {{#if settings.gtags}}
            <!-- Google tag (gtag.js) -->
            <script async src="https://www.googletagmanager.com/gtag/js?id={{settings.gtags}}"></script>
            <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '{{settings.gtags}}');
            </script>
        {{/if}}

        {{{head}}}
    </head>
    <body dir="{{dir}}">
        <div>
            {{{body}}}
        </div>
        <script type="module">
            {{{script}}}
        </script>
    </body>
    </html>`)
}
