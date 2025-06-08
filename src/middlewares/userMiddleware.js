const jwt = require('jsonwebtoken');

// Middleware for any authenticated user (both admin and regular users)
module.exports = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/auth/user/login');
    }

    try {
        // Decode token and store user info in req.user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); // Continue processing request
    } catch (err) {
        res.clearCookie('token');
        return res.redirect('/auth/user/login');
    }
};