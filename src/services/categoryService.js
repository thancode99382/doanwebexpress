const Category = require('../models/Category');

class CategoryService {
  /**
   * Get all categories
   * @returns {Array} - All categories
   */
  async getAllCategories() {
    return await Category.find().sort({ name: 1 });
  }

  /**
   * Get category by name
   * @param {string} name - Category name
   * @returns {Object} - Category object
   */
  async getCategoryByName(name) {
    return await Category.findOne({ name });
  }

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Object} - Category object
   */
  async getCategoryById(id) {
    return await Category.findById(id);
  }
  
  /**
   * Create a new category
   * @param {Object} categoryData - Category data including name and description
   * @returns {Object} - Created category
   */
  async createCategory(categoryData) {
    const { name, description } = categoryData;
    
    const category = new Category({
      name,
      description
    });
    
    return await category.save();
  }
  
  /**
   * Update an existing category
   * @param {string} id - Category ID
   * @param {Object} updateData - New category data
   * @returns {Object} - Updated category
   */
  async updateCategory(id, updateData) {
    const { name, description } = updateData;
    
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    
    category.name = name;
    if (description) {
      category.description = description;
    }
    
    return await category.save();
  }
  
  /**
   * Delete a category by ID
   * @param {string} id - Category ID
   * @returns {Object} - Deleted category
   */
  async deleteCategory(id) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }
}

module.exports = new CategoryService();