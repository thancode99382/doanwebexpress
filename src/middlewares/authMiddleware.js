const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {

    
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/auth/login');
    }

    try {
        // Giải mã token và lưu thông tin người dùng vào req.user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); // Tiếp tục xử lý request
    } catch (err) {
        res.clearCookie('token');
        return res.redirect('/auth/login');
    }
};
