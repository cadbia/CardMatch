import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Card from '../models/Card.js';

// Load environment variables
dotenv.config();

// Sample card data
const cards = [
  {
    name: 'Premium Rewards Card',
    provider: 'Capital One',
    category: 'Travel',
    description: 'Earn premium rewards on travel purchases and enjoy exclusive travel benefits.',
    annualFee: 95,
    apr: {
      min: 16.99,
      max: 24.99
    },
    rewardsRate: '2x points on travel, 1.5x points on everything else',
    signupBonus: '60,000 bonus points after spending $4,000 in first 3 months',
    creditScoreRequired: 'Excellent',
    features: [
      'No foreign transaction fees',
      'Travel insurance',
      'Airport lounge access',
      'Global Entry/TSA PreCheck credit'
    ],
    imageUrl: 'https://example.com/premium-rewards-card.jpg'
  },
  {
    name: 'Cash Back Preferred',
    provider: 'Chase',
    category: 'Cash Back',
    description: 'Earn cash back on everyday purchases with enhanced rewards in select categories.',
    annualFee: 0,
    apr: {
      min: 14.99,
      max: 23.99
    },
    rewardsRate: '3% on dining, 2% on groceries, 1% on everything else',
    signupBonus: '$200 cash back after spending $1,000 in first 3 months',
    creditScoreRequired: 'Good',
    features: [
      'No annual fee',
      'Cash back rewards never expire',
      'Zero liability protection',
      'Purchase protection'
    ],
    imageUrl: 'https://example.com/cash-back-preferred.jpg'
  },
  {
    name: 'Student Rewards',
    provider: 'Discover',
    category: 'Student',
    description: 'Build credit history while earning rewards with no annual fee.',
    annualFee: 0,
    apr: {
      min: 13.99,
      max: 22.99
    },
    rewardsRate: '5% cash back in rotating categories, 1% on everything else',
    signupBonus: 'Cash back match at the end of first year',
    creditScoreRequired: 'Fair',
    features: [
      'No annual fee',
      'No late fee on first late payment',
      'Free FICO score access',
      'Good Grade Reward'
    ],
    imageUrl: 'https://example.com/student-rewards.jpg'
  },
  {
    name: 'Business Platinum',
    provider: 'American Express',
    category: 'Business',
    description: 'Premium business card with travel benefits and expense management tools.',
    annualFee: 595,
    apr: {
      min: 15.99,
      max: 23.99
    },
    rewardsRate: '5x points on flights and hotels, 1.5x points on purchases over $5,000',
    signupBonus: '100,000 points after spending $15,000 in first 3 months',
    creditScoreRequired: 'Excellent',
    features: [
      'Airport lounge access',
      'Annual airline fee credit',
      'Global Entry/TSA PreCheck credit',
      'Expense management tools'
    ],
    imageUrl: 'https://example.com/business-platinum.jpg'
  },
  {
    name: 'Low Interest Rate Card',
    provider: 'Citi',
    category: 'Low Interest',
    description: 'Save on interest with one of the lowest APRs available.',
    annualFee: 0,
    apr: {
      min: 9.99,
      max: 17.99
    },
    rewardsRate: 'No rewards program',
    signupBonus: '0% intro APR for 18 months',
    creditScoreRequired: 'Good',
    features: [
      'No annual fee',
      'Low ongoing APR',
      'Balance transfer option',
      'No penalty APR'
    ],
    imageUrl: 'https://example.com/low-interest-card.jpg'
  },
  {
    name: 'Secured Credit Builder',
    provider: 'Bank of America',
    category: 'Building',
    description: 'Build or rebuild your credit with responsible use.',
    annualFee: 0,
    apr: {
      min: 20.99,
      max: 25.99
    },
    rewardsRate: '1% cash back on all purchases',
    signupBonus: 'None',
    creditScoreRequired: 'Poor',
    features: [
      'No annual fee',
      'Security deposit required',
      'Credit line equal to deposit',
      'Path to unsecured credit'
    ],
    imageUrl: 'https://example.com/secured-credit-builder.jpg'
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Clear existing data
      await Card.deleteMany();
      console.log('Cards collection cleared');
      
      // Insert new data
      await Card.insertMany(cards);
      console.log(`${cards.length} cards inserted`);
      
      // Disconnect from MongoDB
      mongoose.disconnect();
      console.log('Database seeded successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });