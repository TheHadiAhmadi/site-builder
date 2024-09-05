import { db } from "#services";

export const loginController = async (req, res) => {
    const user = await db('users').query().filter('username', '=', req.body.username).first();

    if(!user) {
        return res.json({success: false, message: 'user not found!'})
    }

    if(user.password !== `_%${req.body.password}%_`) {
        return res.json({success: false, message: 'password is invalid!'})
    }
    
    res.cookie('userId', user.id, {
        httpOnly: true
    })
    return res.redirect('/?mode=edit')
}

export const logoutController = (req, res) => {
    res.cookie('userId', '', {httpOnly: true})
    res.json({success: true})
}