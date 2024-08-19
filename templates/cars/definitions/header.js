const template = `<header class="bg-gray-800 p-4">
    <div class="flex justify-between items-center">
        <div class="text-white font-bold text-xl">
            <!-- Logo -->
            <img src="/files/{{settings.logo}}" alt="Logo" class="h-8" />
        </div>
        <nav class="space-x-4">
            <a href="/" class="text-white hover:text-gray-400">Home</a>
            <a href="/categories" class="text-white hover:text-gray-400">Categories</a>
            <a href="/about" class="text-white hover:text-gray-400">About Us</a>
        </nav>
    </div>
</header>`

export default {
    template,
    props: []
}