const multer = require("multer");
const path = require("path");

// Cấu hình nơi lưu trữ và đặt tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/images"); // Thư mục lưu trữ ảnh
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Đổi tên file để tránh trùng
  },
});

// Bộ lọc loại file (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("File không phải là ảnh!"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
