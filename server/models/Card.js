import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide card name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  provider: {
    type: String,
    required: [true, 'Please provide card provider'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide card category'],
    enum: ['Travel', 'Cash Back', 'Business', 'Student', 'Rewards', 'Low Interest', 'Building Credit']
  },
  description: {
    type: String,
    required: [true, 'Please provide card description']
  },
  annualFee: {
    type: Number,
    required: [true, 'Please provide annual fee'],
    min: 0
  },
  apr: {
    min: {
      type: Number,
      required: [true, 'Please provide minimum APR']
    },
    max: {
      type: Number,
      required: [true, 'Please provide maximum APR']
    }
  },
  rewardsRate: {
    type: String,
    required: [true, 'Please provide rewards rate']
  },
  signupBonus: {
    type: String,
    default: 'None'
  },
  creditScoreRequired: {
    type: String,
    required: [true, 'Please provide required credit score'],
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Building']
  },
  features: [{
    type: String
  }],
  imageUrl: {
    type: String,
    required: [true, 'Please provide card image URL']
  }
}, {
  timestamps: true
});

export default mongoose.model('Card', CardSchema);