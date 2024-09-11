import {readdir} from 'node:fs/promises'
import { db } from "#services"
import { SetupPage } from '../pages/setup.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
    
export function contextMiddleware({functions}) {
    return async (req, res, next) => {
        console.log(`[${req.method}] ${req.url}`)
        
        let user = await db('users').query().filter('id', '=', req.cookies.userId).first()
    
        if(!user) {
            res.cookie('userId', '', {httpOnly: true})
            if(req.url.startsWith('/admin')) {
                return res.redirect('/login')
            }
        }
    
        let context = {
            functions,
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
            req.url = req.url.slice(0, -1)
        }
    
        const blocks = await db('blocks').query().all()
    
        // Check if initialized
        if(blocks.length == 0) {
            const templates = await readdir(path.join(__dirname, '../../templates'));
            return res.end(SetupPage({templates}))
        }

        if(req.query.mode === 'edit' && !req.url.startsWith('/admin')) {
            return res.redirect('/admin')
        }

        return next()
    }
}
