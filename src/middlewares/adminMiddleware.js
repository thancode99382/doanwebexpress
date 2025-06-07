const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/auth/login');
    }

    try {
        // Decode token and store user info in req.user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get the full user object to check if they're an admin
        const user = await User.findById(decoded.userId);
        
        if (!user || !user.isAdmin) {
            return res.status(403).render('home/error', {
                message: 'Access denied. Admin privileges required.',
                layout: 'layouts/mainLayout',
                title: 'Access Denied'
            });
        }
        
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.redirect('/auth/login');
    }
};