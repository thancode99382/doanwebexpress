const CommentBlog = require('../models/Comment');

class CommentService {
  /**
   * Get comments for a specific blog post
   * @param {string} blogId - Blog ID to get comments for
   * @returns {Array} - Comments with author information
   */
  async getCommentsByBlogId(blogId) {
    let comments = await CommentBlog.find({ blog: blogId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    
    // Ensure author always exists in comment objects
    return comments.map((comment) => ({
      ...comment._doc,
      author: comment.author || { username: "Anonymous" },
    }));
  }

  /**
   * Create a new comment
   * @param {string} content - Comment content
   * @param {string} blogId - Blog ID the comment belongs to
   * @param {string} authorId - User ID of the commenter
   * @returns {Object} - Created comment
   */
  async createComment(content, blogId, authorId) {
    const comment = new CommentBlog({
      content,
      blog: blogId,
      author: authorId,
    });
    
    await comment.save();
    return comment;
  }
}

module.exports = new CommentService();