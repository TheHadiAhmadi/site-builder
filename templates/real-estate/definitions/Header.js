export default {
    name: 'Header',
    template: `<header id="header" class="sticky top-0 top-0 left-0 right-0 bg-white shadow-md z-50 visible-header">
        <div class="container mx-auto flex justify-between items-center p-4">
            <div class="text-2xl font-bold">
                <a href="/">Khana Real Estate</a>
            </div>
            <nav class="hidden md:flex space-x-6">
                <a href="/" class="text-gray-700 hover:text-gray-900">Home</a>
                <a href="/about" class="text-gray-700 hover:text-gray-900">About</a>
                <a href="/properties" class="text-gray-700 hover:text-gray-900">Properties</a>
                <a href="/neighbourhoods" class="text-gray-700 hover:text-gray-900">Neighbourhoods</a>
                <a href="#" class="text-gray-700 hover:text-gray-900">Contact</a>
            </nav>
            <div class="md:hidden">
                <button id="menu-btn" class="text-gray-700 focus:outline-none">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    </header>`,
    props: []
}