export default {
    name: 'Hero',
    template: `<div class="relative h-screen overflow-hidden">
      <video class="absolute top-0 left-0 w-full h-full object-cover" autoplay muted loop>
        <source src="/files/{{video}}" type="video/mp4">
      </video>
      <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
        <div class="text-center text-white">
          <h1 class="text-5xl font-bold mb-4">{{title}}</h1>
          <p class="text-xl mb-8">{{subtitle}}</p>
          <a href="{{button_link}}" class="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600">{{button_text}}</a>
        </div>
      </div>
    </div>`,
    props: [
        {
            type: 'input',
            slug: 'title',
            label: 'Title',
        },
        {
            type: 'input',
            slug: 'subtitle',
            label: 'SubTitle',
        },
        {
            type: 'file',
            slug: 'video',
            label: 'Video',
        },
        {
            type: 'input',
            slug: 'button_link',
            label: 'Button Link'
        },
        {
            type: 'input',
            slug: 'button_text',
            label: 'Button Text'
        },
    ]
}