import express from 'express';
import { getCards, getCard, getRecommendations } from '../controllers/cards.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCards);
router.get('/recommendations', protect, getRecommendations);
router.get('/:id', getCard);

export default router;