const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true }, // Nội dung bình luận
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true }, // Tham chiếu đến bài viết
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Tham chiếu đến người dùng
   
},{ timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
