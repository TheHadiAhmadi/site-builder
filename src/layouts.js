import hbs from 'handlebars'

export default {
    default: hbs.compile(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        {{{head}}}
        <title>{{title}}</title>
    </head>
    <body>
        <div>
            {{{body}}}
        </div>
    </body>
    </html>`)
}
