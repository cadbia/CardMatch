import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Transaction date is required']
  },
  description: {
    type: String,
    required: [true, 'Transaction description is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required']
  },
  isCredit: {
    type: Boolean,
    required: true,
    default: false
  },
  category: {
    type: String,
    required: [true, 'Transaction category is required']
  }
}, {
  timestamps: true
});

// Index for faster queries
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, category: 1 });

export default mongoose.model('Transaction', TransactionSchema);