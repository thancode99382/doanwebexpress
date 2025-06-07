const categoryService = require('../services/categoryService');

// Get all categories - Admin only
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    
    res.render('admin/categories', {
      categories,
      user: req.user.username,
      layout: 'layouts/mainLayout',
      title: 'Manage Categories'
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Error fetching categories');
  }
};

// Create a new category - Admin only
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).send('Category name is required');
    }
    
    await categoryService.createCategory({ name, description });
    
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).send('Error creating category');
  }
};

// Delete a category - Admin only
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    await categoryService.deleteCategory(id);
    
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send('Error deleting category');
  }
};

// Update a category - Admin only
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).send('Category name is required');
    }
    
    await categoryService.updateCategory(id, { name, description });
    
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).send('Error updating category');
  }
};