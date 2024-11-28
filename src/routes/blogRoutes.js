const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');


router.get('/', blogController.getAllBlogs);
router.post('/postcomment', authMiddleware, blogController.postComment);
router.get('/personalblog', authMiddleware, blogController.personalBlog);
router.get('/createblog', authMiddleware, blogController.getCreateBlogPage);
router.post('/createblog', authMiddleware, upload.single('file'), blogController.createBlog);

router.get('/:id', blogController.getBlogById);
router.get('/:id/edit', authMiddleware, blogController.getEditBlogPage);
router.put('/:id', authMiddleware, upload.single('file'), blogController.updateBlog);
router.delete('/:id', authMiddleware, blogController.deleteBlog);

module.exports = router;
