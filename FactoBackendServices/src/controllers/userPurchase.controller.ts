import { Response } from 'express';
import { UserPurchase } from '../models/userPurchase.model';
import PaymentOrder from '../models/paymentOrder.model';
import bigPromise from '../middlewares/bigPromise';
import { CustomAPIError } from '../errors/customAPIError';
import { AuthRequest } from '../middlewares/auth';

// Create a new user purchase
export const createUserPurchase = bigPromise(async (req: AuthRequest, res: Response) => {
  const { itemType, itemId, selectedFeatures, billingPeriod, paymentOrderId, amount } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomAPIError('User not authenticated', 401);
  }

  if (!itemType || !itemId || !paymentOrderId) {
    throw new CustomAPIError('Missing required fields: itemType, itemId, paymentOrderId', 400);
  }

  // Check if payment order exists and is completed
  const paymentOrder = await PaymentOrder.findById(paymentOrderId);
  if (!paymentOrder) {
    throw new CustomAPIError('Payment order not found', 404);
  }

  if (paymentOrder.status !== 'completed') {
    throw new CustomAPIError('Payment not completed', 400);
  }

  // Check if user already has this service
  const existingPurchase = await UserPurchase.findOne({
    userId,
    itemId,
    status: 'active'
  });

  if (existingPurchase) {
    throw new CustomAPIError('Service already purchased', 400);
  }

  // Create user purchase
  const userPurchase = new UserPurchase({
    userId,
    itemType,
    itemId,
    selectedFeatures: selectedFeatures || [],
    billingPeriod: billingPeriod || 'one-time',
    paymentOrderId,
    status: 'active'
  });

  await userPurchase.save();

  res.status(201).json({
    success: true,
    message: 'Service purchased successfully',
    data: userPurchase
  });
});

// Get user purchases
export const getUserPurchases = bigPromise(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomAPIError('User not authenticated', 401);
  }

  const purchases = await UserPurchase.find({ userId })
    .populate('paymentOrderId', 'amount currency status transactionId createdAt')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: purchases
  });
});

// Get single user purchase
export const getUserPurchase = bigPromise(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomAPIError('User not authenticated', 401);
  }

  const purchase = await UserPurchase.findOne({ _id: id, userId })
    .populate('paymentOrderId', 'amount currency status transactionId createdAt');

  if (!purchase) {
    throw new CustomAPIError('Purchase not found', 404);
  }

  res.status(200).json({
    success: true,
    data: purchase
  });
});

// Update user purchase status
export const updateUserPurchase = bigPromise(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, expiryDate } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomAPIError('User not authenticated', 401);
  }

  const purchase = await UserPurchase.findOne({ _id: id, userId });

  if (!purchase) {
    throw new CustomAPIError('Purchase not found', 404);
  }

  if (status) {
    purchase.status = status;
  }

  if (expiryDate) {
    purchase.expiryDate = new Date(expiryDate);
  }

  await purchase.save();

  res.status(200).json({
    success: true,
    message: 'Purchase updated successfully',
    data: purchase
  });
});

// Cancel user purchase
export const cancelUserPurchase = bigPromise(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomAPIError('User not authenticated', 401);
  }

  const purchase = await UserPurchase.findOne({ _id: id, userId });

  if (!purchase) {
    throw new CustomAPIError('Purchase not found', 404);
  }

  purchase.status = 'cancelled';
  await purchase.save();

  res.status(200).json({
    success: true,
    message: 'Purchase cancelled successfully',
    data: purchase
  });
});

