import {db} from '#services'


export const actions = {
    async submit(body) {
        console.log('submit', body)
        const contactUsCollection = await db('collections').query().filter('name', '=', 'ContactUs').first()

        await db('contents').insert({
            _type: contactUsCollection.id,
            name: body.name,
            message: body.message,
            subject: body.subject,
            email: body.email,

        })

        return {
            reload: true,
            success: true
        }
    }
}