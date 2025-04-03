import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Card from '../models/Card.js';

// Load environment variables
dotenv.config();

// Sample card data with realistic values
const cards = [
  {
    name: 'Chase Sapphire Reserve',
    provider: 'Chase',
    category: 'Travel',
    description: 'Premium travel rewards card with luxury benefits and high rewards on travel and dining purchases.',
    annualFee: 550,
    apr: {
      min: 18.49,
      max: 25.49
    },
    rewardsRate: '3x points on travel and dining',
    signupBonus: '60,000 points after spending $4,000 in first 3 months',
    creditScoreRequired: 'Excellent',
    features: [
      'Priority Pass lounge access',
      '$300 annual travel credit',
      'Global Entry/TSA PreCheck credit',
      'Primary rental car insurance',
      'Trip cancellation/interruption insurance'
    ],
    imageUrl: 'https://example.com/sapphire-reserve.jpg'
  },
  {
    name: 'American Express Blue Cash Preferred',
    provider: 'American Express',
    category: 'Cash Back',
    description: 'High cash back rates on everyday purchases including groceries and streaming services.',
    annualFee: 95,
    apr: {
      min: 15.49,
      max: 25.49
    },
    rewardsRate: '6% at supermarkets, 6% on streaming, 3% on transit and gas',
    signupBonus: '$350 back after spending $3,000 in first 6 months',
    creditScoreRequired: 'Good',
    features: [
      'Return protection',
      'Extended warranty',
      'Car rental insurance',
      'Purchase protection'
    ],
    imageUrl: 'https://example.com/blue-cash-preferred.jpg'
  },
  {
    name: 'Capital One Venture X',
    provider: 'Capital One',
    category: 'Travel',
    description: 'Premium travel card with flexible rewards and comprehensive travel benefits.',
    annualFee: 395,
    apr: {
      min: 17.49,
      max: 24.49
    },
    rewardsRate: '10x on hotels, 5x on flights, 2x on everything else',
    signupBonus: '75,000 miles after spending $4,000 in first 3 months',
    creditScoreRequired: 'Excellent',
    features: [
      'Priority Pass and Capital One Lounge access',
      '$300 annual travel credit',
      '10,000 bonus miles anniversary bonus',
      'Cell phone protection'
    ],
    imageUrl: 'https://example.com/venture-x.jpg'
  },
  {
    name: 'Discover it Cash Back',
    provider: 'Discover',
    category: 'Cash Back',
    description: 'No annual fee card with rotating 5% cash back categories and first-year cash back match.',
    annualFee: 0,
    apr: {
      min: 13.49,
      max: 24.49
    },
    rewardsRate: '5% on rotating categories, 1% on all purchases',
    signupBonus: 'Cash back match for the first year',
    creditScoreRequired: 'Good',
    features: [
      'No annual fee',
      'No foreign transaction fees',
      'Free FICO score',
      'Cash back match first year'
    ],
    imageUrl: 'https://example.com/discover-it.jpg'
  },
  {
    name: 'Chase Freedom Unlimited',
    provider: 'Chase',
    category: 'Cash Back',
    description: 'Flexible cash back card with bonus categories and no annual fee.',
    annualFee: 0,
    apr: {
      min: 16.49,
      max: 25.24
    },
    rewardsRate: '1.5% on all purchases',
    signupBonus: '$200 after spending $500 in first 3 months',
    creditScoreRequired: 'Good',
    features: [
      'No annual fee',
      'Purchase protection',
      'Extended warranty',
      'Zero liability protection'
    ],
    imageUrl: 'https://example.com/freedom-unlimited.jpg'
  },
  {
    name: 'Citi Double Cash',
    provider: 'Citi',
    category: 'Cash Back',
    description: 'Simple but effective cash back card with up to 2% back on all purchases.',
    annualFee: 0,
    apr: {
      min: 15.49,
      max: 25.49
    },
    rewardsRate: '2% on all purchases (1% when you buy + 1% when you pay)',
    signupBonus: 'None',
    creditScoreRequired: 'Good',
    features: [
      'No annual fee',
      'Citi Entertainment access',
      'Lost wallet service',
      'Virtual account numbers'
    ],
    imageUrl: 'https://example.com/double-cash.jpg'
  },
  {
    name: 'American Express Gold Card',
    provider: 'American Express',
    category: 'Rewards',
    description: 'Premium rewards card focused on dining and groceries with valuable credits.',
    annualFee: 250,
    apr: {
      min: 17.49,
      max: 25.49
    },
    rewardsRate: '4x points at restaurants and supermarkets, 3x on flights',
    signupBonus: '60,000 points after spending $4,000 in first 6 months',
    creditScoreRequired: 'Excellent',
    features: [
      '$120 dining credit',
      '$120 Uber cash',
      'No foreign transaction fees',
      'Trip delay insurance'
    ],
    imageUrl: 'https://example.com/amex-gold.jpg'
  },
  {
    name: 'Capital One Quicksilver Student',
    provider: 'Capital One',
    category: 'Student',
    description: 'Student card with flat-rate cash back and no annual fee.',
    annualFee: 0,
    apr: {
      min: 16.49,
      max: 26.49
    },
    rewardsRate: '1.5% on all purchases',
    signupBonus: '$50 after spending $100 in first 3 months',
    creditScoreRequired: 'Fair',
    features: [
      'No annual fee',
      'No foreign transaction fees',
      'Free credit monitoring',
      'Extended warranty'
    ],
    imageUrl: 'https://example.com/quicksilver-student.jpg'
  },
  {
    name: 'Discover it Student Chrome',
    provider: 'Discover',
    category: 'Student',
    description: 'Student card with bonus cash back on gas and restaurants.',
    annualFee: 0,
    apr: {
      min: 14.49,
      max: 23.49
    },
    rewardsRate: '2% at gas stations and restaurants, 1% on all purchases',
    signupBonus: 'Cash back match for the first year',
    creditScoreRequired: 'Fair',
    features: [
      'Good Grade Reward',
      'No late fee on first late payment',
      'Free FICO score',
      'No foreign transaction fees'
    ],
    imageUrl: 'https://example.com/student-chrome.jpg'
  },
  {
    name: 'Chase Ink Business Preferred',
    provider: 'Chase',
    category: 'Business',
    description: 'Premium business card with high rewards on common business expenses.',
    annualFee: 95,
    apr: {
      min: 17.49,
      max: 22.49
    },
    rewardsRate: '3x points on travel, shipping, internet, cable, phone, and advertising',
    signupBonus: '100,000 points after spending $15,000 in first 3 months',
    creditScoreRequired: 'Excellent',
    features: [
      'Cell phone protection',
      'Trip cancellation insurance',
      'Purchase protection',
      'Extended warranty'
    ],
    imageUrl: 'https://example.com/ink-preferred.jpg'
  },
  {
    name: 'Capital One Spark Cash Plus',
    provider: 'Capital One',
    category: 'Business',
    description: 'Business card with unlimited 2% cash back and no preset spending limit.',
    annualFee: 150,
    apr: {
      min: 0,
      max: 0
    },
    rewardsRate: '2% on all purchases',
    signupBonus: 'Up to $1,000 cash bonus',
    creditScoreRequired: 'Excellent',
    features: [
      'No preset spending limit',
      'Annual $200 cash bonus',
      'Free employee cards',
      'Downloadable purchase records'
    ],
    imageUrl: 'https://example.com/spark-cash-plus.jpg'
  },
  {
    name: 'U.S. Bank Visa Platinum',
    provider: 'U.S. Bank',
    category: 'Low Interest',
    description: 'Low interest card with long 0% APR period and cell phone protection.',
    annualFee: 0,
    apr: {
      min: 15.24,
      max: 25.24
    },
    rewardsRate: 'No rewards program',
    signupBonus: 'None',
    creditScoreRequired: 'Good',
    features: [
      'Long 0% APR period',
      'Cell phone protection',
      'Free credit score',
      'Account alerts'
    ],
    imageUrl: 'https://example.com/visa-platinum.jpg'
  },
  {
    name: 'Wells Fargo Reflect',
    provider: 'Wells Fargo',
    category: 'Low Interest',
    description: 'Low interest card with one of the longest 0% APR periods available.',
    annualFee: 0,
    apr: {
      min: 14.49,
      max: 26.49
    },
    rewardsRate: 'No rewards program',
    signupBonus: 'None',
    creditScoreRequired: 'Good',
    features: [
      'Up to 21-month 0% APR period',
      'Cell phone protection',
      'Roadside dispatch',
      'Emergency assistance'
    ],
    imageUrl: 'https://example.com/reflect.jpg'
  },
  {
    name: 'Discover it Secured',
    provider: 'Discover',
    category: 'Building Credit',
    description: 'Secured card with cash back rewards and no annual fee.',
    annualFee: 0,
    apr: {
      min: 23.24,
      max: 23.24
    },
    rewardsRate: '2% at gas stations and restaurants, 1% on all purchases',
    signupBonus: 'Cash back match for the first year',
    creditScoreRequired: 'Poor',
    features: [
      'No annual fee',
      'Free FICO score',
      'Automatic monthly reviews after 7 months',
      'Cash back rewards'
    ],
    imageUrl: 'https://example.com/secured.jpg'
  },
  {
    name: 'Capital One Platinum Secured',
    provider: 'Capital One',
    category: 'Building Credit',
    description: 'Secured card with potential for credit line increase and flexible deposit.',
    annualFee: 0,
    apr: {
      min: 26.99,
      max: 26.99
    },
    rewardsRate: 'No rewards program',
    signupBonus: 'None',
    creditScoreRequired: 'Poor',
    features: [
      'No annual fee',
      'Automatic credit line review',
      'Pick your payment due date',
      'Security deposit as low as $49'
    ],
    imageUrl: 'https://example.com/platinum-secured.jpg'
  },
  {
    name: 'Chase Freedom Flex',
    provider: 'Chase',
    category: 'Cash Back',
    description: 'Dynamic cash back card with rotating categories and fixed bonus categories.',
    annualFee: 0,
    apr: {
      min: 16.49,
      max: 25.24
    },
    rewardsRate: '5% on rotating categories, 3% on dining and drugstores',
    signupBonus: '$200 after spending $500 in first 3 months',
    creditScoreRequired: 'Good',
    features: [
      'Cell phone protection',
      'Purchase protection',
      'Extended warranty',
      'Trip cancellation insurance'
    ],
    imageUrl: 'https://example.com/freedom-flex.jpg'
  },
  {
    name: 'American Express Platinum',
    provider: 'American Express',
    category: 'Travel',
    description: 'Ultra-premium travel card with extensive benefits and credits.',
    annualFee: 695,
    apr: {
      min: 18.49,
      max: 25.49
    },
    rewardsRate: '5x on flights and hotels booked through Amex Travel',
    signupBonus: '80,000 points after spending $6,000 in first 6 months',
    creditScoreRequired: 'Excellent',
    features: [
      'Airport lounge access',
      '$200 airline fee credit',
      '$200 hotel credit',
      '$200 Uber cash'
    ],
    imageUrl: 'https://example.com/amex-platinum.jpg'
  },
  {
    name: 'Capital One SavorOne',
    provider: 'Capital One',
    category: 'Cash Back',
    description: 'No annual fee card with high rewards on dining and entertainment.',
    annualFee: 0,
    apr: {
      min: 16.49,
      max: 26.49
    },
    rewardsRate: '3% on dining, entertainment, and groceries',
    signupBonus: '$200 after spending $500 in first 3 months',
    creditScoreRequired: 'Good',
    features: [
      'No foreign transaction fees',
      'Extended warranty',
      'Travel accident insurance',
      'Virtual card numbers'
    ],
    imageUrl: 'https://example.com/savor-one.jpg'
  },
  {
    name: 'Navy Federal Credit Union Platinum',
    provider: 'Navy Federal',
    category: 'Low Interest',
    description: 'Low interest card with no balance transfer fees.',
    annualFee: 0,
    apr: {
      min: 8.99,
      max: 18.00
    },
    rewardsRate: 'No rewards program',
    signupBonus: 'None',
    creditScoreRequired: 'Fair',
    features: [
      'No balance transfer fees',
      'No cash advance fees',
      'No foreign transaction fees',
      'Cell phone protection'
    ],
    imageUrl: 'https://example.com/nfcu-platinum.jpg'
  },
  {
    name: 'OpenSky Secured Visa',
    provider: 'OpenSky',
    category: 'Building Credit',
    description: 'Secured card with no credit check required.',
    annualFee: 35,
    apr: {
      min: 17.39,
      max: 17.39
    },
    rewardsRate: 'No rewards program',
    signupBonus: 'None',
    creditScoreRequired: 'Poor',
    features: [
      'No credit check required',
      'Reports to all 3 credit bureaus',
      'Choose your credit limit',
      'Mobile account access'
    ],
    imageUrl: 'https://example.com/opensky-secured.jpg'
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