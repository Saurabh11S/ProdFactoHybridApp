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

export const getUserDetails = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return next(createCustomError('User not found', StatusCode.NOT_FOUND));
      }

      const userResponse = user.toObject();
      delete userResponse.password;

      const response = sendSuccessApiResponse('User details retrieved successfully', { user: userResponse });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getUserPurchases = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return next(createCustomError('User not found', StatusCode.NOT_FOUND));
      }

      // Get user purchases with populated payment order details
      const purchases = await db.UserPurchase.find({ userId })
        .populate('paymentOrderId', 'amount currency status transactionId createdAt paymentMethod paymentActivatedByAdmin isConsultationPayment consultationPrice activatedAt')
        .sort({ createdAt: -1 })
        .lean();

      const response = sendSuccessApiResponse('User purchases retrieved successfully', { purchases });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const saveUserService = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { 
        itemType, 
        itemId, 
        selectedFeatures = [], 
        billingPeriod = 'one-time',
        status = 'active',
        specialRequirement = '',
        additionalRequirements = '',
        isFreeConsultation = false
      } = req.body;

      if (!userId) {
        return next(createCustomError('User not found', StatusCode.NOT_FOUND));
      }

      if (!itemType || !itemId) {
        return next(createCustomError('Item type and item ID are required', StatusCode.BAD_REQUEST));
      }

      // Check if user already has this service
      const existingPurchase = await db.UserPurchase.findOne({
        userId,
        itemId,
        status: 'active'
      });

      if (existingPurchase) {
        return next(createCustomError('Service already requested or purchased', StatusCode.BAD_REQUEST));
      }

      // Fetch service details for email notifications (if free consultation)
      let serviceDetails = null;
      if (isFreeConsultation) {
        try {
          serviceDetails = await db.SubService.findById(itemId)
            .populate('serviceId', 'title category')
            .select('title serviceId');
        } catch (serviceError) {
          console.error('Error fetching service details for email:', serviceError);
          // Continue without service details - we'll use itemId as fallback
        }
      }

      // For free consultation, use a special paymentOrderId value
      // We'll use a dummy ObjectId that we can identify as 'free-consultation'
      // Since paymentOrderId is required and references PaymentOrder, we need to handle this differently
      // Option: Create a special PaymentOrder for free consultations or make paymentOrderId optional
      // For now, we'll use a special string identifier that we can check in the frontend
      
      // Create a minimal PaymentOrder for free consultation if needed
      // Or we can modify the schema to allow null/optional paymentOrderId for free consultations
      // For simplicity, let's use a special ObjectId pattern that we can identify
      
      // Using a workaround: Create a dummy payment order or use a special identifier
      // Since the schema requires ObjectId, we'll need to either:
      // 1. Create a dummy PaymentOrder with status 'free-consultation'
      // 2. Modify schema to make paymentOrderId optional
      // For now, let's use approach 1 - create a minimal payment order
      
      let paymentOrderId;
      if (isFreeConsultation) {
        // Create a special payment order for free consultation
        const freeConsultationOrder = new db.PaymentOrder({
          userId,
          amount: 0,
          currency: 'INR',
          status: 'free_consultation', // Special status
          paymentMethod: 'free_consultation',
          items: [{
            itemType,
            itemId,
            price: 0,
            billingPeriod,
            selectedFeatures: selectedFeatures
          }]
        });
        await freeConsultationOrder.save();
        paymentOrderId = freeConsultationOrder._id;
      } else {
        // For regular free services (legacy)
        // Create a dummy payment order
        const freeServiceOrder = new db.PaymentOrder({
          userId,
          amount: 0,
          currency: 'INR',
          status: 'free_service',
          paymentMethod: 'free_service',
          items: [{
            itemType,
            itemId,
            price: 0,
            billingPeriod,
            selectedFeatures: selectedFeatures
          }]
        });
        await freeServiceOrder.save();
        paymentOrderId = freeServiceOrder._id;
      }

      // Create a UserPurchase record
      const userPurchase = new db.UserPurchase({
        userId,
        itemType,
        itemId,
        selectedFeatures,
        billingPeriod,
        paymentOrderId,
        status,
        // Add additional data
        specialRequirement,
        additionalRequirements
      });

      await userPurchase.save();

      // Send email notifications for free consultation
      if (isFreeConsultation) {
        try {
          // Get user details (fetch once)
          const user = await db.User.findById(userId).select('email fullName phoneNumber');
          
          // Get service name
          const serviceName = serviceDetails?.title || 
                             (serviceDetails?.serviceId && typeof serviceDetails.serviceId === 'object' && 'title' in serviceDetails.serviceId 
                               ? (serviceDetails.serviceId as any).title 
                               : 'Service') || 
                             'Service';
          
          // Send confirmation email to user
          if (user && user.email) {
            console.log('📧 Sending free consultation confirmation email to user:', user.email);
            await sendFreeConsultationRequestConfirmationToUser(
              user.email,
              user.fullName || 'Valued Customer',
              serviceName,
              itemId
            );
            console.log('✅ Free consultation confirmation email sent to user');
          } else {
            console.warn('⚠️ User email not available, skipping user notification email');
          }

          // Send notification email to admin
          const adminEmail = process.env.ADMIN_EMAIL || 'facto.m.consultancy@gmail.com';
          console.log('📧 Sending free consultation notification email to admin:', adminEmail);
          
          await sendFreeConsultationRequestNotificationToAdmin(
            adminEmail,
            {
              userName: user?.fullName || 'Unknown User',
              userEmail: user?.email || 'Not provided',
              userPhone: user?.phoneNumber ? `+91${user.phoneNumber}` : 'Not provided',
              serviceName: serviceName,
              serviceId: itemId,
              selectedFeatures: selectedFeatures.length > 0 ? selectedFeatures : undefined,
              billingPeriod: billingPeriod !== 'one-time' ? billingPeriod : undefined,
              specialRequirement: specialRequirement || undefined,
              additionalRequirements: additionalRequirements || undefined,
              purchaseId: userPurchase._id.toString()
            }
          );
          console.log('✅ Free consultation notification email sent to admin');
        } catch (emailError: any) {
          // Log error but don't fail the request
          console.error('❌ Failed to send free consultation emails:', emailError.message || emailError);
          console.error('❌ Email error details:', emailError);
        }
      }

      const message = isFreeConsultation 
        ? 'Your free consultation request has been submitted successfully. Our team will contact you soon.'
        : 'Your service has been saved and will be processed soon';

      const response = sendSuccessApiResponse('Service saved successfully', { 
        purchase: userPurchase,
        message
      });
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const editOwnProfile = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
          const user = req.user;
          const {
              fullName,
              email,
              phoneNumber,
              profilePictureUrl,
              panNumber,
              aadharNumber,
              dateOfBirth,
              state,
              address,
              fathersName,
              alternativePhone,

              // GST Profile
              gstProfile,

              // Income Tax Profile
              incomeTaxProfile
          }: Partial<IUser> = req.body;

          if (!user) {
              return next(createCustomError('User not found', StatusCode.NOT_FOUND));
          }

          // Update Basic Details
          if (fullName) user.fullName = fullName;
          if (email) user.email = email;
          if(fathersName) user.fathersName = fathersName;
          if(alternativePhone) user.alternativePhone = alternativePhone;
          if (phoneNumber) user.phoneNumber = phoneNumber;
          if (profilePictureUrl) user.profilePictureUrl = profilePictureUrl;
          if (panNumber) user.panNumber = panNumber;
          if (aadharNumber) user.aadharNumber = aadharNumber;
          if (dateOfBirth) user.dateOfBirth = dateOfBirth;
          if (state) user.state = state;
          if (address) user.address = address;

          // Update GST Profile
          if (gstProfile) {
              user.gstProfile = {
                  ...user.gstProfile,
                  ...gstProfile
              };
          }

          // Update Income Tax Profile
          if (incomeTaxProfile) {
              user.incomeTaxProfile = {
                  ...user.incomeTaxProfile,
                  ...incomeTaxProfile
              };
          }

          await user.save();

          const updatedUser = user.toObject();
          delete updatedUser.password;

          const response = sendSuccessApiResponse("Profile updated successfully", { user: updatedUser });
          res.status(StatusCode.OK).send(response);
      } catch (error: any) {
          if (error.name === "ValidationError") {
              return next(createCustomError(error.message, StatusCode.BAD_REQ));
          }
          next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
  }
);


export const getAllDocumentsByUserId = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId  = req.user?._id;

      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError("Invalid user ID", StatusCode.BAD_REQ));
      }

      // Fetch user documents with populated subService
      const userDocuments = await db.UserDocument.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(userId) }
        },
        {
          $lookup: {
            from: 'subService', // Make sure this matches your SubService collection name
            localField: 'subServiceId',
            foreignField: '_id',
            as: 'subService'
          }
        },
        {
          $unwind: '$subService'
        },
        {
          $project: {
            _id: 1,
            documentType: 1,
            title: 1,
            description: 1,
            documentUrl: 1,
            createdAt: 1,
            updatedAt: 1,
            'subService._id': 1,
            'subService.title': 1
          }
        }
      ]);

      if (userDocuments.length === 0) {
        return next(createCustomError("No documents found for this user", StatusCode.NOT_FOUND));
      }

      const response = sendSuccessApiResponse(
        "User documents retrieved successfully",
        { userDocuments }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

  

