import { Form, Input } from "#components";
import layouts from "../layouts.js";

export function LoginPage() {
    return layouts.default({
        title: 'Login to AdminPanel',
        head: [
            '<link rel="stylesheet" href="/pages/login/style.css">',
            '<script type="module" src="/js/login.js"></script>'
        ].join(''),
        body: `<div data-main>
            ${Form({
                handler: 'auth.login',
                fields: [
                    Input({ 
                        name: 'username', 
                        placeholder: 'Enter your Username', 
                        label: 'Username'
                    }),
                    Input({ 
                        name: 'password', 
                        placeholder: 'Enter your Password', 
                        label: 'Password',
                        type: 'password'
                    }),
                ]
            })}
        </div>`
    })
}