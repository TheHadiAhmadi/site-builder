import { db } from "#services"
// import slugify from "slugify"

export function slugify(name) {
    const uniqueString = Math.random().toString(36).substring(2, 6);
    return name.replace(/ /g, '-').replace(/[*+~.()'"!:@]/g, '').toLowerCase() + '-' + uniqueString
}

export default {
    async insertCollectionContent(body) {
        if(!body._type) return;

        if(body.name) {
            body.slug = slugify(body.name);
        }

        const res = await db('contents').insert(body)

        return {
            success: true
        }
    },
    async updateCollectionContent(body) {
        if(!body._type) return;

        await db('contents').update(body)

        return {
            success: true
        }
    },
    async loadCollectionContent(body) {
        const res = await db('contents').query().filter('id', '=', body.id).first()

        return res;
    },
    async removeCollectionContent(body) {
        const res = await db('contents').remove(body.id)

        return {
            reload: true
        }        
    }

}