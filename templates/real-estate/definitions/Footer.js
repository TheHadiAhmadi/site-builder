export default {
    name: 'Footer',
    template: `<footer class="bg-gray-800 text-white py-8">
    <div class="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
            <h3 class="text-xl font-bold mb-4">Khana Real Estate</h3>
            <p>Khair khana, Kabul, Afghanistan</p>
            <p>Email: {{email}}</p>
            <p>Phone: {{phone}}</p>
        </div>
        <div>
            <h3 class="text-xl font-bold mb-4">Quick Links</h3>
            <ul>
                <li><a href="/" class="text-gray-400 hover:text-white">Home</a></li>
                <li><a href="/about" class="text-gray-400 hover:text-white">About</a></li>
                <li><a href="/properties" class="text-gray-400 hover:text-white">Properties</a></li>
                <li><a href="/neighbourhoods" class="text-gray-400 hover:text-white">Neighbourhoods</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white">Contact</a></li>
            </ul>
        </div>
        <div>
            <h3 class="text-xl font-bold mb-4">Stay Connected</h3>
            <ul class="flex space-x-4">
                <li><a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-facebook-f"></i></a></li>
                <li><a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-twitter"></i></a></li>
                <li><a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-linkedin-in"></i></a></li>
                <li><a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-instagram"></i></a></li>
            </ul>
        </div>
    </div>
    <div class="border-t border-gray-700 mt-8 pt-4 text-center">
        <p>&copy; {{year}} Khana Real Estate. All Rights Reserved.</p>
    </div>
</footer>
`,
    props: [
        {
            type: 'input',
            slug: 'email',
            label: 'Email',
            defaultValue: 'thehadiahmadi@gmail.com'
        },
        {
            type: 'input',
            slug: 'phone',
            label: 'Phone',
            defaultValue: '+93787771034'
        },
        {
            type: 'input',
            slug: 'year',
            label: 'Year',
            defaultValue: '2024'
        },
        
    ]
}