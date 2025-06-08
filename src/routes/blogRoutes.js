const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');
const upload = require('../middlewares/upload');


// Public routes - no authentication required
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);
router.post('/:id/comments', authMiddleware, blogController.createComment);

// Admin-only routes
router.get('/admin/personalblog', adminMiddleware, blogController.personalBlog);
router.get('/admin/createblog', adminMiddleware, blogController.getCreateBlogPage);
router.post('/admin/createblog', adminMiddleware, upload.single('file'), blogController.createBlog);
router.get('/:id/edit', adminMiddleware, blogController.getEditBlogPage);
router.put('/:id', adminMiddleware, upload.single('file'), blogController.updateBlog);
router.delete('/:id', adminMiddleware, blogController.deleteBlog);

// User routes - authenticated users only
router.get('/user/dashboard', userMiddleware, blogController.userDashboard);
router.get('/user/create', userMiddleware, blogController.getUserCreateBlogPage);
router.post('/user/create', userMiddleware, upload.single('file'), blogController.createUserBlog);
router.get('/user/:id/edit', userMiddleware, blogController.getUserEditBlogPage);
router.put('/user/:id', userMiddleware, upload.single('file'), blogController.updateUserBlog);
router.delete('/user/:id', userMiddleware, blogController.deleteUserBlog);

module.exports = router;
