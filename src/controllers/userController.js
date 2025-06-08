const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Helper function for error handling
const handleError = (res, error, message, statusCode = 500) => {
  console.error(message, error);
  res.status(statusCode).render('home/error', {
    message,
    layout: 'layouts/mainLayout',
    title: 'Error'
  });
};

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get search query if provided
    const search = req.query.search || '';
    const searchQuery = search ? {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find(searchQuery)
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.render('admin/users', {
      users,
      currentPage: page,
      totalPages,
      totalUsers,
      search,
      layout: 'layouts/mainLayout',
      title: 'User Management',
      user: req.user,
      isAdmin: true
    });
  } catch (error) {
    handleError(res, error, 'Error loading users');
  }
};

// Show create user form
exports.getCreateUserPage = async (req, res) => {
  try {
    res.render('admin/create-user', {
      layout: 'layouts/mainLayout',
      title: 'Create New User',
      user: req.user.username,
      isAdmin: true
    });
  } catch (error) {
    handleError(res, error, 'Error loading create user page');
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.render('admin/create-user', {
        layout: 'layouts/mainLayout',
        title: 'Create New User',
        user: req.user.username,
        isAdmin: true,
        error: 'User with this email or username already exists',
        formData: { username, email }
      });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      isAdmin: isAdmin === 'true'
    });

    await newUser.save();
    res.redirect('/admin/users?success=User created successfully');
  } catch (error) {
    res.render('admin/create-user', {
      layout: 'layouts/mainLayout',
      title: 'Create New User',
      user: req.user.username,
      isAdmin: true,
      error: 'Error creating user: ' + error.message,
      formData: req.body
    });
  }
};

// Show edit user form
exports.getEditUserPage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).render('home/error', {
        message: 'User not found',
        layout: 'layouts/mainLayout',
        title: 'User Not Found'
      });
    }

    res.render('admin/edit-user', {
      editUser: user,
      layout: 'layouts/mainLayout',
      title: 'Edit User',
      user: req.user.username,
      isAdmin: true
    });
  } catch (error) {
    handleError(res, error, 'Error loading user edit page');
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { username, email, isAdmin, newPassword } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).render('home/error', {
        message: 'User not found',
        layout: 'layouts/mainLayout',
        title: 'User Not Found'
      });
    }

    // Check for duplicate username/email (excluding current user)
    const existingUser = await User.findOne({ 
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ email }, { username }] }
      ]
    });

    if (existingUser) {
      const userToEdit = await User.findById(userId).select('-password');
      return res.render('admin/edit-user', {
        editUser: userToEdit,
        layout: 'layouts/mainLayout',
        title: 'Edit User',
        user: req.user.username,
        isAdmin: true,
        error: 'User with this email or username already exists'
      });
    }

    // Update user fields
    user.username = username;
    user.email = email;
    user.isAdmin = isAdmin === 'true';

    // Update password if provided
    if (newPassword && newPassword.trim() !== '') {
      user.password = newPassword; // Will be hashed by pre-save middleware
    }

    await user.save();
    res.redirect('/admin/users?success=User updated successfully');
  } catch (error) {
    const userToEdit = await User.findById(req.params.id).select('-password');
    res.render('admin/edit-user', {
      editUser: userToEdit,
      layout: 'layouts/mainLayout',
      title: 'Edit User',
      user: req.user.username,
      isAdmin: true,
      error: 'Error updating user: ' + error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user.userId) {
      return res.redirect('/admin/users?error=You cannot delete your own account');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/admin/users?error=User not found');
    }

    await User.findByIdAndDelete(userId);
    res.redirect('/admin/users?success=User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.redirect('/admin/users?error=Error deleting user');
  }
};

// Get user details (for viewing)
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).render('home/error', {
        message: 'User not found',
        layout: 'layouts/mainLayout',
        title: 'User Not Found'
      });
    }

    // Get user's blog count
    const Blog = require('../models/Blog');
    const blogCount = await Blog.countDocuments({ author: user._id });

    res.render('admin/user-details', {
      viewUser: user,
      blogCount,
      layout: 'layouts/mainLayout',
      title: 'User Details',
      user: req.user.username,
      isAdmin: true
    });
  } catch (error) {
    handleError(res, error, 'Error loading user details');
  }
};