import {db} from '#services'

const template = `
    <div class="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
    <form method="POST" action="this.submit">
        <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700">Name:</label>
            <input id="name" name="name" type="text" required
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
        </div>
        <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700">Email:</label>
            <input id="email" name="email" type="email" required
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
        </div>
        <div class="mb-4">
            <label for="subject" class="block text-sm font-medium text-gray-700">Subject:</label>
            <input id="subject" name="subject" type="text" required
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
        </div>
        <div class="mb-4">
            <label for="message" class="block text-sm font-medium text-gray-700">Message:</label>
            <textarea id="message" name="message" required
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
        </div>
        <div>
            <button type="submit"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Send
            </button>
        </div>
    </form>
</div>

`

export default {
    props: [],
    template,
    actions: {
        async submit(body) {
            console.log('submit', body)
            const contactUsCollection = await db('collections').query().filter('name', '=', 'ContactUs').first()

            await db('contents').insert({
                _type: contactUsCollection.id,
                name: body.name,
                message: body.message,
                subject: body.subject,
                email: body.email,

            })

            return {
                reload: true,
                success: true
            }
        }
    }
}