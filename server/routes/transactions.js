import express from 'express';
import { 
  uploadTransactions,
  getTransactions,
  updateTransactionCategory,
  deleteTransaction
} from '../controllers/transactions.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/upload', uploadTransactions);
router.get('/', getTransactions);
router.put('/:id/category', updateTransactionCategory);
router.delete('/:id', deleteTransaction);

export default router;