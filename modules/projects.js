const template = `
<style>
    .project:hover .project-image {
        filter: blur(5px);
    }
    .project:hover .project-description {
        opacity: 1;
    }
</style>

<div class="container mx-auto py-12">
        <h1 class="text-4xl font-bold text-center mb-12">{{settings.title}}</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {{#each projects}}
            <div class="project relative overflow-hidden">
                <img src="{{this.image_url}}" alt="Project 1" class="project-image w-full h-full object-cover">
                <div class="project-description absolute inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-start justify-center gap-4 text-start text-white opacity-0 transition-opacity p-8 duration-300">
                    <p class="font-bold text-2xl">{{this.title}}</p>
                    <p>{{this.description}}</p>
                </div>
            </div>
            {{/each}}       
        </div>
    </div>

`

const contentType = {
    name: 'projects',
    fields: [
        {
            name: 'Title',
            slug: 'title',
            type: 'string',
        },
        {
            name: 'Description',
            slug: 'description',
            type: 'string',
        },
        {
            name: 'Image Url',
            slug: 'image_url',
            type: 'string',
        },
    ]
}

const settings = {
    fields: [
        {
            name: 'Title',
            type: 'string',
            slug: 'title',
            defaultValue: 'Projects'
        }
    ]
}

async function load({contents}) {
    return {
        projects: contents.slice(0, 5) 
    }
}

// Project 1: A web development project involving modern design and responsive layout.
// Project 2: An e-commerce platform with seamless user experience and robust backend.
// Project 3:   
// Project 4: A branding project that includes logo design and corporate identity.
// Project 5: A digital marketing campaign with impressive ROI and engagement.


export default {
    name: 'Portfolio Services',
    template,
    settings,
    contentType,
    load
}