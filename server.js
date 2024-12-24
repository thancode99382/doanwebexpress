

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const connectDB = require('./src/config/db');
const path = require("path");
const expressLayouts = require('express-ejs-layouts');
const app = express();
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

// Kết nối MongoDB
 connectDB();

 app.use(cookieParser());

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(methodOverride('_method'));
// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));


// Sử dụng express-ejs-layouts
app.use(expressLayouts);

// Routes
app.use('/auth', require('./src/routes/authRoutes'));
app.use('/blogs', require('./src/routes/blogRoutes'));


app.use("/css", express.static(path.resolve(__dirname, "public/css")));
app.use("/img", express.static(path.resolve(__dirname, "public/images")));
app.use("/uploads", express.static(path.resolve(__dirname,"uploads")));
app.use("/js", express.static(path.resolve(__dirname, "public/js")));

// Lắng nghe server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
