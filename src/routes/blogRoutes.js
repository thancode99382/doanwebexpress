const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/upload');


// Public routes - no authentication required
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Admin-only routes
router.get('/admin/personalblog', adminMiddleware, blogController.personalBlog);
router.get('/admin/createblog', adminMiddleware, blogController.getCreateBlogPage);
router.post('/admin/createblog', adminMiddleware, upload.single('file'), blogController.createBlog);
router.get('/:id/edit', adminMiddleware, blogController.getEditBlogPage);
router.put('/:id', adminMiddleware, upload.single('file'), blogController.updateBlog);
router.delete('/:id', adminMiddleware, blogController.deleteBlog);

module.exports = router;
