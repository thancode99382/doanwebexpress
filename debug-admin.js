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

// Specific admin credentials we want to verify/create
const ADMIN_EMAIL = 'admin@sevenlove.com';
const ADMIN_PASSWORD = 'admin123';

async function debugAdminUser() {
  try {
    console.log(`🔍 Looking for user with email: ${ADMIN_EMAIL}`);
    
    // Find the admin user by email
    const user = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!user) {
      console.log('❌ User not found in database!');
      console.log('Creating a new admin user...');
      
      // Create a new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      const newAdmin = new User({
        username: 'admin',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        isAdmin: true
      });
      
      await newAdmin.save();
      console.log('✅ New admin user created successfully!');
      
      // Verify the new user
      await verifyUser(ADMIN_EMAIL, ADMIN_PASSWORD);
      return;
    }
    
    // User found, display details
    console.log('✅ User found in database:');
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Admin status:', user.isAdmin ? 'Yes' : 'No');
    
    // Test password verification
    console.log('\n🔐 Testing password verification...');
    const passwordMatches = await bcrypt.compare(ADMIN_PASSWORD, user.password);
    console.log(`Password '${ADMIN_PASSWORD}' verification result:`, passwordMatches ? '✅ MATCH' : '❌ NO MATCH');
    
    if (!passwordMatches) {
      console.log('\n🔧 Updating user password and ensuring admin status...');
      
      // Update the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      // Ensure admin status
      user.isAdmin = true;
      
      await user.save();
      console.log('✅ User updated successfully!');
      
      // Verify the update worked
      await verifyUser(ADMIN_EMAIL, ADMIN_PASSWORD);
    }
    
    console.log('\n📝 LOGIN CREDENTIALS TO USE:');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    
  } catch (error) {
    console.error('Error debugging admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Helper function to verify user credentials
async function verifyUser(email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    console.log(`❌ Verification failed: No user found with email ${email}`);
    return;
  }
  
  const passwordMatches = await bcrypt.compare(password, user.password);
  console.log('\n🔍 Verification test:');
  console.log('Email:', email);
  console.log('Password match:', passwordMatches ? '✅ YES' : '❌ NO');
  console.log('Admin status:', user.isAdmin ? '✅ YES' : '❌ NO');
}

// Run the function
debugAdminUser();