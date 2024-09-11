import hbs from 'handlebars'

export default {
    default: hbs.compile(`<!DOCTYPE html>
    <html lang="{{lang}}" {{#eq mode 'edit'}}data-theme="{{theme}}"{{else}}class="{{theme}}"{{/eq}}>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>
            const theme = localStorage.getItem('THEME') ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            {{#eq mode 'edit'}}
            document.documentElement.dataset.theme = theme
            {{else}}
            // document.documentElement.classList.add(theme)
            {{/eq}}
        </script>
        <script src="/js/tailwind.cdn.js"></script>
        <script>
            tailwind.config = {{{ tailwind }}}
        </script>

        {{#eq mode 'edit'}}
            <link rel="stylesheet" href="/css/hljs.css">
            <link rel="stylesheet" href="/css/components/quill.snow.css">
            <link rel="stylesheet" href="/css/sitebuilder.edit.css">
             <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">

        {{else eq mode 'preview'}}
            <link rel="stylesheet" href="/css/components/quill.snow.css">
            <link rel="stylesheet" href="/css/sitebuilder.preview.css">
             <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
            {{{settings.head}}}
            {{{head}}}
        {{else eq mode 'view'}}
            <link rel="stylesheet" href="/css/sitebuilder.view.css">
            {{{settings.head}}}
            {{{head}}} 
        {{/eq}}

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
    </head>
    <body data-dir="{{dir}}">
        <div>
            {{{body}}}
        </div>
        <script type="module">
            {{{script}}}
        </script>
    </body>
    </html>`)
}
