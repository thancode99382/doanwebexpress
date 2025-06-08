const jwt = require('jsonwebtoken');
const blogService = require('../services/blogService');
const userService = require('../services/userService');
const categoryService = require('../services/categoryService');
const commentService = require('../services/commentService');

// Helper functions
const getUserFromToken = async (req) => {
  const token = req.cookies.token;
  if (!token) return { user: null, isAdmin: false };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userData = await userService.getUserFromToken(decoded);
    return {
      user: userData?.username,
      isAdmin: decoded.isAdmin || false,
      userId: decoded.userId
    };
  } catch (err) {
    return { user: null, isAdmin: false };
  }
};

const handleError = (res, error, message, statusCode = 500) => {
  console.error(message, error);
  res.status(statusCode).send(message);
};

const checkBlogOwnership = async (blogId, userId) => {
  const blog = await blogService.getBlogById(blogId);
  if (!blog) return { error: 'Blog not found', status: 404 };
  
  if (blog.author.toString() !== userId) {
    return { 
      error: 'Access denied. You can only edit your own blogs.',
      status: 403 
    };
  }
  
  return { blog };
};

const renderBlogForm = async (res, user, categories, isAdmin, isUser = false, blog = null, title) => {
  const templateData = {
    user: user?.username,
    categories,
    isAdmin,
    layout: "layouts/mainLayout",
    title
  };

  if (isUser) templateData.isUserPage = true;
  if (blog) templateData.blog = blog;

  res.render(blog ? "blog/blog_update" : "blog/create_blog", templateData);
};

// ===========================================
// PUBLIC ROUTES
// ===========================================

exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    
    const { blogs, totalPages } = await blogService.getAllBlogs(page, limit);
    let blog_hot = await blogService.getHotBlog();
    
    if (!blog_hot && blogs.length > 0) {
      blog_hot = blogs[0];
    }
    
    const { user, isAdmin } = await getUserFromToken(req);
    
    res.render("blog/blog_home", {
      user,
      isAdmin,
      blog_hot,
      blogs,
      totalPages,
      currentPage: page,
      layout: "layouts/mainLayout",
      title: "Blog home",
    });
  } catch (error) {
    handleError(res, error, "Error loading blogs");
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await blogService.getBlogById(req.params.id);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }
    
    await blog.populate("category", "name");
    const { user, isAdmin } = await getUserFromToken(req);
    
    res.render("blog/details", {
      blog,
      user,
      isAdmin,
      layout: "layouts/mainLayout",
      title: blog.title,
    });
  } catch (error) {
    handleError(res, error, "Something went wrong!");
  }
};

// ===========================================
// ADMIN ROUTES
// ===========================================

exports.personalBlog = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    const blogs = await blogService.getBlogsByAuthor(req.user.userId);
    
    res.render("blog/blog_personal", {
      blogs,
      user: user?.username,
      isAdmin: true,
      layout: "layouts/mainLayout",
      title: "Admin Dashboard",
    });
  } catch (error) {
    handleError(res, error, "Error loading personal blogs");
  }
};

exports.getCreateBlogPage = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    const categories = await categoryService.getAllCategories();
    
    await renderBlogForm(res, user, categories, true, false, null, "Create Blog");
  } catch (error) {
    handleError(res, error, "Error loading create blog page");
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    
    await blogService.createBlog(
      { title, content, category, image: imageUrl },
      req.user.userId
    );
    
    res.redirect("/blogs/admin/personalblog");
  } catch (error) {
    handleError(res, error, "Error creating blog");
  }
};

exports.getEditBlogPage = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    const blog = await blogService.getBlogById(req.params.id);
    
    if (!blog) {
      return res.status(404).send("Blog not found");
    }
    
    await blog.populate("category", "name");
    const categories = await categoryService.getAllCategories();
    
    await renderBlogForm(res, user, categories, true, false, blog, "Edit Blog");
  } catch (error) {
    handleError(res, error, "Error loading edit page");
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    
    await blogService.updateBlog(req.params.id, {
      title,
      content,
      category,
      image: imageUrl
    });
    
    res.redirect("/blogs/admin/personalblog");
  } catch (error) {
    handleError(res, error, "Server Error");
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    await blogService.deleteBlog(req.params.id);
    res.redirect("/blogs/admin/personalblog");
  } catch (error) {
    handleError(res, error, "Internal server error");
  }
};

// ===========================================
// USER ROUTES
// ===========================================

exports.userDashboard = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    const blogs = await blogService.getBlogsByAuthor(req.user.userId);
    
    res.render("blog/blog_personal", {
      blogs,
      user: user?.username,
      isAdmin: false,
      layout: "layouts/mainLayout",
      title: "My Blogs",
      isUserDashboard: true,
    });
  } catch (error) {
    handleError(res, error, "Error loading user dashboard");
  }
};

exports.getUserCreateBlogPage = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    const categories = await categoryService.getAllCategories();
    
    await renderBlogForm(res, user, categories, false, true, null, "Create Blog");
  } catch (error) {
    handleError(res, error, "Error loading create blog page");
  }
};

exports.createUserBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    
    await blogService.createBlog(
      { title, content, category, image: imageUrl },
      req.user.userId
    );
    
    res.redirect("/blogs/user/dashboard");
  } catch (error) {
    handleError(res, error, "Error creating blog");
  }
};

exports.getUserEditBlogPage = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    const { blog, error, status } = await checkBlogOwnership(req.params.id, req.user.userId);
    
    if (error) {
      return res.status(status).render('home/error', {
        message: error,
        layout: 'layouts/mainLayout',
        title: 'Access Denied'
      });
    }
    
    await blog.populate("category", "name");
    const categories = await categoryService.getAllCategories();
    
    await renderBlogForm(res, user, categories, false, true, blog, "Edit Blog");
  } catch (error) {
    handleError(res, error, "Error loading edit page");
  }
};

exports.updateUserBlog = async (req, res) => {
  try {
    const { blog, error, status } = await checkBlogOwnership(req.params.id, req.user.userId);
    
    if (error) {
      return res.status(status).render('home/error', {
        message: error,
        layout: 'layouts/mainLayout',
        title: 'Access Denied'
      });
    }
    
    const { title, content, category } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    
    await blogService.updateBlog(req.params.id, {
      title,
      content,
      category,
      image: imageUrl
    });
    
    res.redirect("/blogs/user/dashboard");
  } catch (error) {
    handleError(res, error, "Server Error");
  }
};

exports.deleteUserBlog = async (req, res) => {
  try {
    const { blog, error, status } = await checkBlogOwnership(req.params.id, req.user.userId);
    
    if (error) {
      return res.status(status).render('home/error', {
        message: error,
        layout: 'layouts/mainLayout',
        title: 'Access Denied'
      });
    }
    
    await blogService.deleteBlog(req.params.id);
    res.redirect("/blogs/user/dashboard");
  } catch (error) {
    handleError(res, error, "Internal server error");
  }
};
