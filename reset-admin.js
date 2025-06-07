require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function resetAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Admin credentials
    const adminEmail = 'admin@example.com';
    const adminPassword = 'password123';
    const adminUsername = 'admin';

    // First, delete any existing user with this email or username
    console.log('Removing any existing admin users...');
    await User.deleteOne({ 
      $or: [
        { email: adminEmail },
        { username: adminUsername }
      ]
    });

    // Create a new admin user from scratch
    console.log('Creating new admin user...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const newAdmin = new User({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true
    });

    await newAdmin.save();
    
    // Verify the user was created correctly
    const savedUser = await User.findOne({ email: adminEmail });
    
    if (!savedUser) {
      throw new Error('Failed to save admin user');
    }
    
    // Manually test password verification
    const passwordMatch = await bcrypt.compare(adminPassword, savedUser.password);
    
    console.log('\n==== ADMIN USER CREATED ====');
    console.log('Email:', adminEmail);
    console.log('Username:', adminUsername);
    console.log('Password:', adminPassword);
    console.log('Admin Status:', savedUser.isAdmin ? 'Yes' : 'No');
    console.log('Password Verification:', passwordMatch ? 'Success' : 'Failed');
    console.log('============================');
    console.log('\nYou can now log in with these credentials at /auth/login');
    
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error resetting admin user:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

resetAdmin();