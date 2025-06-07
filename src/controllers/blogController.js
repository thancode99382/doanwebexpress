const jwt = require('jsonwebtoken');
const blogService = require('../services/blogService');
const userService = require('../services/userService');
const categoryService = require('../services/categoryService');
const commentService = require('../services/commentService');

// Get all blogs with pagination - Public access
exports.getAllBlogs = async (req, res) => {
  try {
    // Get page and limit from query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    
    // Get blogs with pagination using service
    const { blogs, totalPages } = await blogService.getAllBlogs(page, limit);
    
    // Get hot blog
    const blog_hot = await blogService.getHotBlog();
    
    // Check if user is logged in (admin)
    let user = null;
    const token = req.cookies.token;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userData = await userService.getUserFromToken(decoded);
        user = userData?.username;
      } catch (err) {
        // Token is invalid or expired - continue as non-logged in user
      }
    }
    
    // Render view with data
    res.render("blog/blog_home", {
      user,
      blog_hot,
      blogs,
      totalPages,
      currentPage: page,
      layout: "layouts/mainLayout",
      title: "Blog home",
    });
  } catch (error) {
    console.error("Error getting all blogs:", error);
    res.status(500).send("Error loading blogs");
  }
};

// Render create blog page - Admin only
exports.getCreateBlogPage = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    const categories = await categoryService.getAllCategories();
    
    res.render("blog/create_blog", {
      categories,
      user: user?.username,
      layout: "layouts/mainLayout",
      title: "Create Blog",
    });
  } catch (error) {
    console.error("Error loading create blog page:", error);
    res.status(500).send("Error loading create blog page");
  }
};

// Create a new blog - Admin only
exports.createBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    // Get image URL from Cloudinary
    const imageUrl = req.file ? req.file.path : null;
    
    // Create blog using service
    await blogService.createBlog(
      { title, content, category, image: imageUrl },
      req.user.userId
    );
    
    res.redirect("/blogs/admin/personalblog");
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).send("Error creating blog");
  }
};

// Get blog details by ID - Public access
exports.getBlogById = async (req, res) => {
  try {
    // Get blog by ID
    const blog = await blogService.getBlogById(req.params.id);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }
    
    // Populate category information
    await blog.populate("category", "name");
    
    // Check if user is logged in (admin)
    let user = null;
    const token = req.cookies.token;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userData = await userService.getUserFromToken(decoded);
        user = userData?.username;
      } catch (err) {
        // Token is invalid or expired - continue as non-logged in user
      }
    }
    
    // Render view with data
    res.render("blog/details", {
      blog,
      user,
      layout: "layouts/mainLayout",
      title: blog.title,
    });
  } catch (error) {
    console.error("Error fetching blog details:", error);
    res.status(500).send("Something went wrong!");
  }
};

// Render edit blog page - Admin only
exports.getEditBlogPage = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    const blog = await blogService.getBlogById(req.params.id);
    
    if (!blog) {
      return res.status(404).send("Blog not found");
    }
    
    await blog.populate("category", "name");
    const categories = await categoryService.getAllCategories();
    
    res.render("blog/blog_update.ejs", {
      blog,
      categories,
      user: user?.username,
      layout: "layouts/mainLayout",
      title: "Edit Blog",
    });
  } catch (error) {
    console.error("Error loading edit page:", error);
    res.status(500).send("Error loading edit page");
  }
};

// Update an existing blog - Admin only
exports.updateBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    
    // Update blog using service
    await blogService.updateBlog(req.params.id, {
      title,
      content,
      category,
      image: imageUrl
    });
    
    res.redirect("/blogs/admin/personalblog");
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).send("Server Error");
  }
};

// Delete a blog - Admin only
exports.deleteBlog = async (req, res) => {
  try {
    await blogService.deleteBlog(req.params.id);
    res.redirect("/blogs/admin/personalblog");
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).send("Internal server error");
  }
};

// Admin dashboard with personal blogs
exports.personalBlog = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    
    // Get blogs by author ID
    const blogs = await blogService.getBlogsByAuthor(req.user.userId);
    
    res.render("blog/blog_personal", {
      blogs,
      user: user?.username,
      layout: "layouts/mainLayout",
      title: "Admin Dashboard",
    });
  } catch (error) {
    console.error("Error loading personal blogs:", error);
    res.status(500).send("Error loading personal blogs");
  }
};
