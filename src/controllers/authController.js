const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Admin login page
exports.getLoginPage = (req, res) => {
    res.render('auth/login', {
        layout: 'layouts/authLayout',
        title: "Admin Login",
        isAdmin: true
    });
};

// User login page
exports.getUserLoginPage = (req, res) => {
    res.render('auth/login', {
        layout: 'layouts/authLayout',
        title: "User Login",
        isAdmin: false
    });
};

// Admin login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await bcrypt.compare(password, user.password))) {
        // Check if the user is an admin
        if (!user.isAdmin) {
            return res.status(403).render('auth/login', {
                layout: 'layouts/authLayout',
                title: "Admin Login",
                isAdmin: true,
                error: "Access denied. Admin privileges required."
            });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.redirect('/blogs/admin/personalblog');
    } else {
        res.render('auth/login', {
            layout: 'layouts/authLayout',
            title: "Admin Login",
            isAdmin: true,
            error: "Invalid email or password"
        });
    }
};

// User login
exports.loginRegularUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Redirect admin to admin dashboard, regular users to their dashboard
        if (user.isAdmin) {
            res.redirect('/blogs/admin/personalblog');
        } else {
            res.redirect('/blogs/user/dashboard');
        }
    } else {
        res.render('auth/login', {
            layout: 'layouts/authLayout',
            title: "User Login",
            isAdmin: false,
            error: "Invalid email or password"
        });
    }
};

// Admin registration page
exports.getRegisterPage = (req, res) => {
    res.render('auth/register', {
        layout: 'layouts/authLayout',
        title: "Admin Registration",
        isAdmin: true
    });
};

// User registration page
exports.getUserRegisterPage = (req, res) => {
    res.render('auth/register', {
        layout: 'layouts/authLayout',
        title: "User Registration",
        isAdmin: false
    });
};

// Admin registration
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password, adminCode } = req.body;
        
        // Check if admin registration code is correct
        if (adminCode !== process.env.ADMIN_SETUP_CODE) {
            return res.render('auth/register', {
                layout: 'layouts/authLayout',
                title: "Admin Registration",
                isAdmin: true,
                error: "Invalid admin setup code"
            });
        }
        
        const user = new User({ 
            username, 
            email, 
            password,
            isAdmin: true
        });
        
        await user.save();
        res.redirect('/auth/login');
    } catch (error) {
        res.render('auth/register', {
            layout: 'layouts/authLayout',
            title: "Admin Registration",
            isAdmin: true,
            error: "Registration failed: " + error.message
        });
    }
};

// Regular user registration
exports.registerRegularUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const user = new User({ 
            username, 
            email, 
            password,
            isAdmin: false // Regular user
        });
        
        await user.save();
        res.redirect('/auth/user/login');
    } catch (error) {
        res.render('auth/register', {
            layout: 'layouts/authLayout',
            title: "User Registration",
            isAdmin: false,
            error: "Registration failed: " + error.message
        });
    }
};

exports.logoutUser = (req, res) => {
    res.clearCookie('token');
    res.redirect('/blogs');
};
