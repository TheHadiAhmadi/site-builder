import { Button, Card, CardBody, File, Form, Input, Label, Page, Textarea } from "#components";

export async function SettingsGeneralPage() {
    return Page({
        title: 'General settings', body: [
            Form({
                load: 'settings.load',
                handler: 'settings.save',
                fields: [
                    Input({ name: 'site_name', label: 'Site Name', placeholder: 'Enter Site Name' }),
                    Input({ name: 'title', label: 'Site Title', placeholder: 'Enter Default Site Title' }),
                    Input({ name: 'meta_title', label: 'Site Meta Title', placeholder: 'Enter Default Site Meta Title' }),
                    Textarea({ name: 'meta_description', label: 'Default Site Meta Description' }),
                    Textarea({ name: 'head', label: 'Head', placeholder: "Enter site Head content" }),
                    Input({ name: 'gtags', label: 'Google tags ID', placeholder: 'Enter Google tags ID' }),
                    File({ name: 'favicon', label: 'Favicon', type: 'image' }),
                    File({ name: 'logo', label: 'Logo', type: 'image' }),
                ]
            }),
            '<br/>',
            Card([
                CardBody([
                    Label({
                        symbolic: true,
                        // TODO: choose which items should backup (use modal)
                        text: 'Backup site',
                        body: `
                            <form method="POST" action="/api/export">
                                ${Button({ color: 'primary', text: 'Backup', type: 'submit' })}
                            </form>
                        `
                    })
                ])
            ])
        ]
    })
}

export async function SettingsAppearancePage() {
    return Page({ title: 'Appearance settings', body: 'Content' })
}

export async function SettingsProfilePage() {
    return Page({ title: 'Profile settings', body: 'Content' })
}