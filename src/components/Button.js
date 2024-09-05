import { attributes } from "#helpers"

export function Button({href, ghost = false, icon = false, text, color = 'default', block, action, outline = false, size="medium", dataset = {} , type="button"}) {
    let tag = href ? 'a' : 'button'
    let attrs = attributes({
        href,
        type: href ? false : type
    }, {
        button: '',
        enhance: !!href,
        action: href ? false : action,
        'button-outline': outline,
        'button-ghost': ghost,
        'button-icon': icon,
        'button-size': size,
        'button-block': block,
        'button-color': color,
        ...dataset
    })

    return `<${tag}${attrs}>${text}</${tag}>`
}