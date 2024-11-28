const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Tên danh mục
    description: { type: String }, // Mô tả danh mục (không bắt buộc)
    
},{ timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
