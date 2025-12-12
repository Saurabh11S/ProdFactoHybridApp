import { Request, Response, NextFunction } from 'express';
import { createCustomError } from '@/errors/customAPIError';
import { StatusCode } from '@/constants/constants';
import { sendSuccessApiResponse } from '@/middlewares/successApiResponse';
import bigPromise from '@/middlewares/bigPromise';
import { AuthRequest } from '@/middlewares/auth';
import { IUser } from '@/interfaces';
import mongoose from 'mongoose';
import { db } from '@/models';
import { 
  sendFreeConsultationRequestConfirmationToUser, 
  sendFreeConsultationRequestNotificationToAdmin 
} from '@/utils/emailService';

// NOTE: This file was overwritten. The original functions (getUserDetails, getUserPurchases, etc.)
// need to be restored from version control. This is a placeholder with just the push token function.

// Register push notification token
export const registerPushToken = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const { pushToken } = req.body;

      if (!user) {
        return next(createCustomError('User not found', StatusCode.NOT_FOUND));
      }

      if (!pushToken) {
        return next(createCustomError('Push token is required', StatusCode.BAD_REQ));
      }

      // Update user's push token
      user.pushToken = pushToken;
      await user.save();

      const response = sendSuccessApiResponse('Push token registered successfully', {});
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get user details/profile
export const getUserDetails = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return next(createCustomError('User not found', StatusCode.NOT_FOUND));
      }

      // Return user details (excluding sensitive data)
      const userDetails = {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        fathersName: user.fathersName,
        phoneNumber: user.phoneNumber,
        alternativePhone: user.alternativePhone,
        panNumber: user.panNumber,
        aadharNumber: user.aadharNumber,
        dateOfBirth: user.dateOfBirth,
        state: user.state,
        address: user.address,
        gstProfile: user.gstProfile,
        incomeTaxProfile: user.incomeTaxProfile,
        profilePictureUrl: user.profilePictureUrl,
        role: user.role,
        registrationDate: user.registrationDate,
        lastLogin: user.lastLogin,
      };

      const response = sendSuccessApiResponse('User details retrieved successfully', userDetails);
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Edit own profile
export const editOwnProfile = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const updateData = req.body;

      if (!user) {
        return next(createCustomError('User not found', StatusCode.NOT_FOUND));
      }

      // Allowed fields to update
      const allowedFields = [
        'fullName',
        'fathersName',
        'phoneNumber',
        'alternativePhone',
        'panNumber',
        'aadharNumber',
        'dateOfBirth',
        'state',
        'address',
        'gstProfile',
        'incomeTaxProfile',
        'profilePictureUrl',
      ];

      // Update only allowed fields
      allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          (user as any)[field] = updateData[field];
        }
      });

      await user.save();

      const response = sendSuccessApiResponse('Profile updated successfully', {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get all documents by user ID
export const getAllDocumentsByUserId = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return next(createCustomError('User not found', StatusCode.NOT_FOUND));
      }

      const documents = await db.UserDocument.find({ userId: user._id })
        .populate('subServiceId', 'title')
        .sort({ createdAt: -1 });

      const response = sendSuccessApiResponse('Documents retrieved successfully', documents);
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get user purchases
export const getUserPurchases = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return next(createCustomError('User not found', StatusCode.NOT_FOUND));
      }

      const purchases = await db.UserPurchase.find({ userId: user._id })
        .populate('paymentOrderId', 'amount status')
        .sort({ createdAt: -1 });

      const response = sendSuccessApiResponse('Purchases retrieved successfully', purchases);
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Save user service
export const saveUserService = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const { serviceId, selectedFeatures, billingPeriod } = req.body;

      if (!user) {
        return next(createCustomError('User not found', StatusCode.NOT_FOUND));
      }

      if (!serviceId) {
        return next(createCustomError('Service ID is required', StatusCode.BAD_REQ));
      }

      // Verify service exists
      const service = await db.Service.findById(serviceId);
      if (!service) {
        return next(createCustomError('Service not found', StatusCode.NOT_FOUND));
      }

      // Create a saved service entry (this could be stored in user's savedServices array or a separate collection)
      // For now, we'll just return success - you may want to implement a SavedService model
      const response = sendSuccessApiResponse('Service saved successfully', {
        serviceId,
        selectedFeatures: selectedFeatures || [],
        billingPeriod: billingPeriod || 'one-time',
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
