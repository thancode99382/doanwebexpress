require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Specific admin credentials you want to use
const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = 'admin@sevenlove.com';
const ADMIN_PASSWORD = 'admin123';

async function setupAdminUser() {
  try {
    // Check if an admin user already exists with these credentials
    let user = await User.findOne({ 
      $or: [
        { email: ADMIN_EMAIL },
        { username: ADMIN_USERNAME }
      ]
    });

    if (user) {
      console.log('Updating existing user to ensure admin access...');
      
      // Update email and username to match our desired admin credentials
      user.email = ADMIN_EMAIL;
      user.username = ADMIN_USERNAME;
      
      // Ensure the user has admin privileges
      user.isAdmin = true;
      
      // Update the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      await user.save();
      console.log('Admin user updated successfully!');
    } else {
      console.log('Creating new admin user...');
      
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      const newAdmin = new User({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        isAdmin: true
      });
      
      await newAdmin.save();
      console.log('Admin user created successfully!');
    }

    // List all users to confirm the admin user exists
    console.log('\n--- All Users in Database ---');
    const users = await User.find().select('username email isAdmin');
    users.forEach((u, index) => {
      console.log(`${index + 1}. Username: ${u.username}, Email: ${u.email}, Admin: ${u.isAdmin ? 'Yes' : 'No'}`);
    });

    console.log('\n===== ADMIN LOGIN CREDENTIALS =====');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('==============================');
    console.log('\nYou can now log in at /auth/login with these credentials.');
    
  } catch (error) {
    console.error('Error setting up admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

setupAdminUser();