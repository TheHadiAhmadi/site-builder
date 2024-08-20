import { db } from "#services"

export default {
    async load(body) {
        const settings = await db('settings').query().first()

        return settings ?? {}
    },
    async save(body) {
        const existing = await db('settings').query().first()
        if(existing) {
            await db('settings').update({...existing, ...body})

        } else {
            await db('settings').insert(body)
        }
    }
}