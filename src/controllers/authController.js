const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getLoginPage = (req, res) => {
    res.render('auth/login' ,{
        layout : 'layouts/authLayout',
        title : "Login",
});
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
        req.session.userId = user._id; // Sử dụng session
        res.redirect('/blogs');
    } else {
        res.status(401).send('Invalid email or password');
    }
};

exports.getRegisterPage = (req, res) => {
    res.render('auth/register',{
        layout : 'layouts/authLayout',
        title : "Register",
});
};

exports.registerUser = async (req, res) => {
    
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email, password });
        await user.save();
        res.redirect('/auth/login');
    } catch (error) {
        res.status(500).send('Registration failed');
    }
};

exports.logoutUser = (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
};
