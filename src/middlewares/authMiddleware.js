const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {

    
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        // Giải mã token và lưu thông tin người dùng vào req.user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); // Tiếp tục xử lý request
    } catch (err) {
        return res.status(401).send('Invalid or expired token');
    }
};
