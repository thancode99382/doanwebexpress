const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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


        const token = jwt.sign(
            { userId: user._id, email: user.email, username:user.username },
            process.env.JWT_SECRET, // Đặt biến môi trường cho bí mật
            { expiresIn: '1h' } // Thời gian hết hạn
        );

        // Lưu token trong cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Chỉ bật secure khi ở production
            sameSite: 'Strict', // Ngăn chặn CSRF
        });



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
    res.clearCookie('token');
    res.redirect('/auth/login');
};
