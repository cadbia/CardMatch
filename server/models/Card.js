import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a card name'],
    trim: true,
    maxlength: [100, 'Card name cannot be more than 100 characters']
  },
  provider: {
    type: String,
    required: [true, 'Please provide a card provider'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a card category'],
    enum: ['Travel', 'Cash Back', 'Business', 'Student', 'Rewards', 'Low Interest', 'Building Credit']
  },
  description: {
    type: String,
    required: [true, 'Please provide a card description']
  },
  annualFee: {
    type: Number,
    default: 0
  },
  apr: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  rewardsRate: {
    type: String,
    enum: ['Rotating', 'FlatRate']
  },
  signUpBonus: {
    type: Boolean
  },
  creditScoreRequired: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Building'],
    required: true
  },
  features: [{
    type: String
  }],
  imageUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for better search performance
CardSchema.index({ name: 'text', provider: 'text', category: 'text' });

export default mongoose.model('Card', CardSchema);