const Blog = require('../models/Blog');
const Category = require('../models/Category');

class BlogService {
  /**
   * Get all blogs with pagination
   * @param {number} page - Current page number
   * @param {number} limit - Items per page
   * @returns {Object} - Paginated blogs with total count and pages
   */
  async getAllBlogs(page = 1, limit = 5) {
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);
    
    // Get blogs with pagination
    const blogs = await Blog.find()
      .populate("category", "name")
      .populate("author", "username")
      .skip(skip)
      .limit(limit);
      
    return {
      blogs,
      totalBlogs,
      totalPages,
      currentPage: page
    };
  }

  /**
   * Get featured/hot blog
   * @returns {Object} - Featured blog post
   */
  async getHotBlog() {
    const categoryHot = await Category.findOne({ name: "Hot" });
    if (!categoryHot) return null;
    
    return await Blog.findOne({ category: categoryHot._id });
  }

  /**
   * Create a new blog post
   * @param {Object} blogData - Blog data including title, content, image
   * @param {string} authorId - ID of the blog author
   * @returns {Object} - Created blog
   */
  async createBlog(blogData, authorId) {
    const { title, content, category, image } = blogData;
    
    const blog = new Blog({
      title,
      content,
      image,
      category,
      author: authorId
    });
    
    await blog.save();
    return blog;
  }

  /**
   * Get blog by ID with optional comment population
   * @param {string} id - Blog ID
   * @param {boolean} withComments - Whether to include comments
   * @returns {Object} - Blog with optional comments
   */
  async getBlogById(id) {
    return await Blog.findById(id);
  }

  /**
   * Get blogs by author ID
   * @param {string} authorId - Author ID
   * @returns {Array} - Blogs by the specified author
   */
  async getBlogsByAuthor(authorId) {
    return await Blog.find().where({ author: authorId });
  }

  /**
   * Update an existing blog
   * @param {string} id - Blog ID
   * @param {Object} updateData - New blog data
   * @returns {Object} - Updated blog
   */
  async updateBlog(id, updateData) {
    const { title, content, category, image } = updateData;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new Error('Blog not found');
    }
    
    // Update blog fields
    blog.title = title;
    blog.content = content;
    blog.category = category;
    
    // Only update image if new one is provided
    if (image) {
      blog.image = image;
    }
    
    await blog.save();
    return blog;
  }

  /**
   * Delete a blog by ID
   * @param {string} id - Blog ID
   * @returns {Object} - Deleted blog
   */
  async deleteBlog(id) {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      throw new Error('Blog not found');
    }
    return blog;
  }
}

module.exports = new BlogService();