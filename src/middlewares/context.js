import {readdir} from 'node:fs/promises'
import { db } from "#services"
import { SetupPage } from '../pages/setup.js'
import path from 'node:path'

export function contextMiddleware() {
    return async (req, res, next) => {
        
        let user = await db('users').query().filter('id', '=', req.cookies.userId).first()
    
        if(!user) {
            res.cookie('userId', '', {httpOnly: true})
            if(req.query.mode == 'edit' || req.query.mode == 'preview') {
                return res.redirect('/')
            }
        }
    
        let context = {
            user: user ? {
                id: user.id, 
                username: user.username, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                profile: user.profile
            } : null
        }

        if(context.user) {
            const role = await db('roles').query().filter('id', '=', context.user.role).first()   
            context.permissions = role.permissions.reduce((prev, curr) => ({...prev, [curr]: true}), {})
        } else {
            context.permissions = {}

            if(req.query.mode === 'edit' || req.query.mode === 'preview') {
                return res.redirect('/login')
            }
        }
        
        req.context = context

        if(req.method === 'POST') return next()
        if(req.url.endsWith('/') && req.url !== '/') {
            console.log('here', req.query.mode, req.url)
            req.url = req.url.slice(0, -1)
        }
    
        const blocks = await db('definitions').query().all()
    
        // Check if initialized
        if(blocks.length == 0) {
            const templates = await readdir(path.join(__dirname, '../templates'));
            return res.end(SetupPage({templates}))
        }

        return next()
    }
}
