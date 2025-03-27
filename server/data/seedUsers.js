import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Sample user data
const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    preferences: {
      categories: ['Travel', 'Cash Back'],
      annualFeePreference: 'Low Fee',
      creditScoreRange: 'Good'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    preferences: {
      categories: ['Business', 'Rewards'],
      annualFeePreference: 'Any',
      creditScoreRange: 'Excellent'
    }
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Clear existing users
      await User.deleteMany();
      console.log('Cleared existing users');
      
      // Hash passwords and create users
      const hashedUsers = await Promise.all(users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword
        };
      }));
      
      // Insert users
      await User.insertMany(hashedUsers);
      console.log(`${users.length} users inserted`);
      
      // Fetch and display all users
      const allUsers = await User.find().select('-password');
      console.log('\nCreated Users:');
      console.log(JSON.stringify(allUsers, null, 2));
      
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('\nDatabase seeded successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error seeding database:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });