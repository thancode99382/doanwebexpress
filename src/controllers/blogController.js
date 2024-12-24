const Blog = require("../models/Blog");
const User = require("../models/User");
const Category = require("../models/Category");
const CommentBlog = require("../models/Comment");
const jwt = require('jsonwebtoken');
// get all blog
exports.getAllBlogs = async (req, res) => {


  const token = req.cookies.token;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const skip = (page - 1) * limit;

  // Lấy tổng số blog để tính tổng số trang
  const totalBlogs = await Blog.countDocuments();
  const totalPages = Math.ceil(totalBlogs / limit); // Tính tổng số trang

  const blogs = await Blog.find()
    .populate("category", "name")
    .populate("author", "username")
    .skip(skip)
    .limit(limit);


  const categoryHot = await Category.findOne({ name: "Hot" });
  const blog_hot = await Blog.findOne({ category: categoryHot._id });

  const user = await User.findOne({ _id: decoded.userId });

  res.render("blog/blog_home", {
    user: user?.username,
    blog_hot: blog_hot,
    blogs: blogs,
    totalPages: totalPages,
    currentPage: page,
    layout: "layouts/mainLayout",
    title: "Blog home",
  });
};
//getBlogCreate
exports.getCreateBlogPage = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  const categories = await Category.find();
  res.render("blog/create_blog", {
    categories: categories,
    user: user?.username,
    layout: "layouts/mainLayout",
    title: "Create Blog",
  });
};
//postBlog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const imageFile = req.file ? `/uploads/images/${req.file.filename}` : null;

    const blog = new Blog({
      title: title,
      content: content,
      image: imageFile,
      category: category,
      author: req.user.userId,
    });
    await blog.save();
    res.redirect("/blogs");
  } catch (error) {
    console.error(err);
    res.status(500).send("Lỗi khi tạo blog");
  }
};

//detailBlog
exports.getBlogById = async (req, res) => {
  const token = req.cookies.token;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  try {
    // Tìm người dùng hiện tại
    const user = await User.findOne({ _id: decoded.userId });

    // Tìm blog theo ID
    const blog = await Blog.findById(req.params.id);

    // Tìm các bình luận liên quan đến blog và populate thông tin tác giả
    let comments = await CommentBlog.find({ blog: blog._id }).populate(
      "author",
      "username"
    );

    // Làm sạch dữ liệu để đảm bảo `author` luôn tồn tại
    comments = comments.map((comment) => ({
      ...comment._doc, // Lấy các thuộc tính từ MongoDB document
      author: comment.author || { username: "Anonymous" },
    }));

    // Render ra view
    res.render("blog/details", {
      blog: blog,
      comments: comments,
      user: user?.username,
      layout: "layouts/mainLayout",
      title: "Blog detail",
    });
  } catch (error) {
    console.error("Error fetching blog details:", error);
    res.status(500).send("Something went wrong!");
  }
};
//getEditBlogPage
exports.getEditBlogPage = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  const blog = await Blog.findById(req.params.id).populate("category", "name");
  const categories = await Category.find();
  res.render("blog/blog_update.ejs", {
    blog: blog,
    categories: categories,
    user: user?.username,
    layout: "layouts/mainLayout",
    title: "Create Blog",
  });
};
//updateBlog
exports.updateBlog = async (req, res) => {
  const { title, content, category } = req.body;
  const imageFile = req.file ? `/uploads/images/${req.file.filename}` : null;

  //   const categoryId = await Category.findOne({name:category})
  // console.log(categoryId)
  try {
    const blog = await Blog.findById(req.params.id);
    const categoryNametest = await Category.findById(category) ;
    console.log("categoryNametest:", categoryNametest);
    console.log("Category from request:", category);
    console.log("Blog before update:", blog);

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    // Cập nhật thông tin blog
    blog.category = category;
    blog.title = title;
    blog.content = content;
    blog.image = imageFile ? imageFile : blog.image;

    await blog.save();
    res.redirect(`/blogs/personalblog`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
//deleteBlog
exports.deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(id);
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    res.redirect("/blogs/personalblog");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }

  // if (blog.author.toString() !== req.user.userId) {
  //   return res.status(403).send("Unauthorized");
  // }
  // await blog.remove();
};

//postcomment
exports.postComment = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  const { id, content } = req.body;

  const comment = new CommentBlog({
    content: content,
    blog: id,
    author: user._id,
  });
  await comment.save();

  res.redirect(`/blogs/${id}`);
};

exports.personalBlog = async (req, res) => {

  console.log("#####"+req.user.name)
  const user = await User.findOne({ _id: req.user.userId });

  const blogs = await Blog.find().where({ author: req.user.userId });

  res.render("blog/blog_personal", {
    blogs: blogs,
    user: user?.username,
    layout: "layouts/mainLayout",
    title: "Personal Blog",
  });
};
