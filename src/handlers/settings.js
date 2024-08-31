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
    },
    async loadProfile(body, ctx) {
        const id = ctx.user.id

        console.log("id", id)
        return db('users').query().filter('id', '=', id).first()
    },
    async updateProfile(body, ctx) {
        const id = ctx.user.id
        await db('users').update({
            id,
            name: body.name,
            email: body.email,
            profile: body.profile,

        })
        // const id = get current user's id
        

    }
}