import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth';
import {
  createUserPurchase,
  getUserPurchases,
  getUserPurchase,
  updateUserPurchase,
  cancelUserPurchase
} from '../../controllers/userPurchase.controller';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Create a new user purchase
router.post('/', createUserPurchase);

// Get all user purchases
router.get('/', getUserPurchases);

// Get single user purchase
router.get('/:id', getUserPurchase);

// Update user purchase
router.put('/:id', updateUserPurchase);

// Cancel user purchase
router.delete('/:id', cancelUserPurchase);

export default router;

