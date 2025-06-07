const User = require('../models/User');

class UserService {
  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Object} - User object
   */
  async getUserById(userId) {
    return await User.findOne({ _id: userId });
  }
  
  /**
   * Get user from JWT token
   * @param {string} decoded - Decoded JWT token
   * @returns {Object} - User object
   */
  async getUserFromToken(decoded) {
    return await User.findOne({ _id: decoded.userId });
  }
}

module.exports = new UserService();