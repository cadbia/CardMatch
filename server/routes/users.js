import express from 'express';
import { updateProfile, updatePreferences } from '../controllers/users.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.put('/profile', updateProfile);
router.put('/preferences', updatePreferences);

export default router;