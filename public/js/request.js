export async function request(handler, body) {
    return await fetch('/api/query', {
        method: 'POST',
        body: JSON.stringify({ handler, body }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        return res.json()
    }).then(async res => {
        window.dispatchEvent(new CustomEvent('sitebuilder:request', {detail: res}))
        return res;
    })
}