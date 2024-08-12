export default {
    name: 'Page Heading',
    template: `
        <section 
            class="h-[75vh] flex items-center justify-center text-center" 
            style="background-size: cover;background-position: center; background-image: url('/files/{{background_image}}');">
            <div class="w-full h-full flex flex-col items-center justify-center bg-black/20">
                <h1 class="text-4xl font-bold text-white mb-2">
                    {{title}}
                </h1>
                <p class="text-lg italic text-gray-200">{{subtitle}}</p>
            </div>
        </section>
    `,
    props: [
        {
            type: 'input',
            slug: 'title',
            label: 'Title',
        },
        {
            type: 'input',
            slug: 'subtitle',
            label: 'Sub Title',
        },
        {
            type: 'file',
            slug: 'background_image',
            label: 'Background Image',
        },
    ]
}