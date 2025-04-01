import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  preferences: {
    categories: [{
      type: String,
      enum: ['Travel', 'Cash Back', 'Business', 'Student', 'Rewards', 'Low Interest', 'Building Credit']
    }],
    annualFeePreference: {
      type: String,
      enum: ['No Fee', 'Low Fee', 'Any'],
      default: 'Any'
    },
    creditScoreRange: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Building'],
      default: 'Good'
    }
  },
  extraPreferences: {
    signBonus: {
      type: Boolean,
      default: false
    },
    avgAPR: {
      type: Number,
      default: null
    },
    rewardRate: {
      type: String,
      default: null
    }
  },
  rankedPref: {
    categories: {
      type: Number,
      default: 3
    },
    annualFeePreference: {
      type: Number,
      default: 2
    },
    creditScoreRange: {
      type: Number,
      default: 1
    },
    signBonus: {
      type: Number,
      default: 0
    },
    avgAPR: {
      type: Number,
      default: 0
    },
    rewardRate: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);