export function LoginPage() {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/login.css" />
    <title>Login</title>
</head>
<body class="bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
    <div class="p-4 border rounded">
        <div class="px-4 text-3xl">
            Login
        </div>
        <form>
            <label data-label>
                <span data-label-text>Username</span>
                <input data-input name="username" placeholder="Enter your username" />
            </label>

            <label data-label>
                <span data-label-text>Password</span>
                <input type="password" data-input name="password" placeholder="Enter your password" />
            </label>

            <div data-form-actions>
                <button class="w-full" data-button data-button-color="primary">Login</button>
            </div>
        </form>
    </div>
</body>
</html>
    `
}