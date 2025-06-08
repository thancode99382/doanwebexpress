const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const userController = require('../controllers/userController');
const adminMiddleware = require('../middlewares/adminMiddleware');

// All admin routes are protected by admin middleware
router.use(adminMiddleware);

// Admin dashboard route
router.get('/', (req, res) => {
  res.render('admin/dashboard', {
    layout: 'layouts/mainLayout',
    title: 'Admin Dashboard',
    user: req.user.username,
    isAdmin: true
  });
});

// Category management routes
router.get('/categories', categoryController.getAllCategories);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// User management routes
router.get('/users', userController.getAllUsers);
router.get('/users/create', userController.getCreateUserPage);
router.post('/users', userController.createUser);
router.get('/users/:id', userController.getUserDetails);
router.get('/users/:id/edit', userController.getEditUserPage);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;