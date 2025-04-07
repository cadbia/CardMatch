import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Sample transaction data
const generateTransactions = (userId) => {
  const startDate = new Date('2024-01-01');
  const endDate = new Date();
  
  const transactions = [
    {
      user: userId,
      date: new Date('2024-03-15'),
      description: 'Whole Foods Market',
      amount: 87.32,
      type: 'debit',
      category: 'Groceries',
      accountName: 'Chase Freedom',
      merchant: 'Whole Foods'
    },
    {
      user: userId,
      date: new Date('2024-03-14'),
      description: 'Netflix Monthly Subscription',
      amount: 15.99,
      type: 'debit',
      category: 'Streaming Services',
      accountName: 'Chase Freedom',
      merchant: 'Netflix'
    },
    {
      user: userId,
      date: new Date('2024-03-14'),
      description: 'Uber Trip',
      amount: 24.50,
      type: 'debit',
      category: 'Ride Sharing',
      accountName: 'Amex Gold',
      merchant: 'Uber'
    }
  ];

  return transactions;
};

// Connect to MongoDB and seed data
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get the first user from the database
      const user = await User.findOne();
      
      if (!user) {
        console.error('No users found. Please run seedUsers.js first.');
        process.exit(1);
      }

      // Clear existing transactions for this user
      await Transaction.deleteMany({ user: user._id });
      console.log('Cleared existing transactions');

      // Generate and insert transactions
      const transactions = generateTransactions(user._id);
      await Transaction.insertMany(transactions);
      console.log(`${transactions.length} transactions inserted`);

      // Fetch and display sample of inserted transactions
      const sampleTransactions = await Transaction.find({ user: user._id })
        .sort({ date: -1 })
        .limit(5);

      console.log('\nSample of inserted transactions:');
      console.log(JSON.stringify(sampleTransactions, null, 2));

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