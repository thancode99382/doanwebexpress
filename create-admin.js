require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createSimpleAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Simple admin credentials - these will be used for login
    const admin = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true
    };

    // First, delete any existing user with this email or username
    console.log('Removing any existing admin users with the same credentials...');
    await User.deleteOne({ 
      $or: [
        { email: admin.email },
        { username: admin.username }
      ]
    });

    // Create a new admin user and let the model's pre-save middleware handle password hashing
    console.log('Creating new admin user...');
    const newAdmin = new User(admin);
    await newAdmin.save();
    
    console.log('\n======================================');
    console.log('✅ ADMIN USER CREATED SUCCESSFULLY');
    console.log('======================================');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Password:', admin.password);
    console.log('======================================');
    console.log('\n👉 Use these EXACT credentials to log in at /auth/login');
    
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

createSimpleAdmin();