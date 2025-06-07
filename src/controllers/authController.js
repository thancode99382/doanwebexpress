const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.getLoginPage = (req, res) => {
    res.render('auth/login' ,{
        layout : 'layouts/authLayout',
        title : "Admin Login",
});
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await bcrypt.compare(password, user.password))) {
        // Check if the user is an admin
        if (!user.isAdmin) {
            return res.status(403).render('auth/login', {
                layout: 'layouts/authLayout',
                title: "Admin Login",
                error: "Access denied. Admin privileges required."
            });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Longer token expiration for admin
        );

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.redirect('/blogs/admin/personalblog');
    } else {
        res.render('auth/login', {
            layout: 'layouts/authLayout',
            title: "Admin Login",
            error: "Invalid email or password"
        });
    }
};

// This route is for admin setup - can be removed after initial admin is created
exports.getRegisterPage = (req, res) => {
    res.render('auth/register',{
        layout : 'layouts/authLayout',
        title : "Admin Registration",
});
};

// This route is for admin setup - can be removed after initial admin is created
exports.registerUser = async (req, res) => {
    
    try {
        const { username, email, password, adminCode } = req.body;
        
        // Check if admin registration code is correct
        if (adminCode !== process.env.ADMIN_SETUP_CODE) {
            return res.render('auth/register', {
                layout: 'layouts/authLayout',
                title: "Admin Registration",
                error: "Invalid admin setup code"
            });
        }
        
        const user = new User({ 
            username, 
            email, 
            password,
            isAdmin: true // Set user as admin
        });
        
        await user.save();
        res.redirect('/auth/login');
    } catch (error) {
        res.render('auth/register', {
            layout: 'layouts/authLayout',
            title: "Admin Registration",
            error: "Registration failed: " + error.message
        });
    }
};

exports.logoutUser = (req, res) => {
    res.clearCookie('token');
    res.redirect('/blogs');
};
