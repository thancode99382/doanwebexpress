const express = require("express");

const router = express.Router();
const authController = require('../controllers/authController');

// Admin routes
router.get('/login', authController.getLoginPage);
router.post('/login', authController.loginUser);
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.registerUser);

// Regular user routes
router.get('/user/login', authController.getUserLoginPage);
router.post('/user/login', authController.loginRegularUser);
router.get('/user/register', authController.getUserRegisterPage);
router.post('/user/register', authController.registerRegularUser);

// Common logout route
router.get('/logout', authController.logoutUser);

module.exports = router;

