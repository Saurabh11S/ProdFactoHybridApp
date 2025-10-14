import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { NextFunction, Response } from "express";
import { AuthRequest } from "@/middlewares/auth";

// Create consultation request
export const createConsultationRequest = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {
        sessionId,
        serviceId,
        serviceName,
        planType,
        userDetails,
        requestData,
      } = req.body;

      // Validate required fields
      if (!sessionId || !serviceId || !serviceName || !planType) {
        return next(createCustomError("Missing required fields", StatusCode.BAD_REQ));
      }

      // Get user ID from auth middleware if available
      const userId = req.user?.userId;

      const consultationRequest = new db.ConsultationRequest({
        userId,
        sessionId,
        serviceId,
        serviceName,
        planType,
        userDetails: userDetails || {},
        requestData: requestData || {},
        status: 'pending',
      });

      await consultationRequest.save();

      // Track this as a conversion event
      if (userId) {
        await db.UserInteraction.findOneAndUpdate(
          { sessionId },
          {
            $push: {
              conversionEvents: {
                eventType: 'consultation_request',
                timestamp: new Date(),
                metadata: {
                  consultationRequestId: consultationRequest._id,
                  serviceId,
                  planType,
                },
              },
            },
          },
          { upsert: true }
        );
      }

      const response = sendSuccessApiResponse("Consultation request created successfully", { 
        consultationRequest 
      });
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get consultation requests
export const getConsultationRequests = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit = 50, status, serviceId, assignedTo } = req.query;
      
      const filter: any = {};
      
      if (status) filter.status = status;
      if (serviceId) filter.serviceId = serviceId;
      if (assignedTo) filter.assignedTo = assignedTo;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 50;
      const skip = (pageNum - 1) * limitNum;

      const consultationRequests = await db.ConsultationRequest.find(filter)
        .populate('userId', 'fullName email phoneNumber')
        .populate('assignedTo', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await db.ConsultationRequest.countDocuments(filter);

      const response = sendSuccessApiResponse("Consultation requests retrieved successfully", {
        consultationRequests,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Update consultation request status
export const updateConsultationRequestStatus = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status, assignedTo, notes, followUpDate } = req.body;

      if (!status) {
        return next(createCustomError("Status is required", StatusCode.BAD_REQ));
      }

      const updateData: any = { status };
      if (assignedTo) updateData.assignedTo = assignedTo;
      if (notes) updateData.notes = notes;
      if (followUpDate) updateData.followUpDate = new Date(followUpDate);

      const consultationRequest = await db.ConsultationRequest.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('userId', 'fullName email phoneNumber')
       .populate('assignedTo', 'fullName email');

      if (!consultationRequest) {
        return next(createCustomError("Consultation request not found", StatusCode.NOT_FOUND));
      }

      const response = sendSuccessApiResponse("Consultation request updated successfully", { 
        consultationRequest 
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get consultation request analytics
export const getConsultationRequestAnalytics = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;
      
      const matchStage: any = {};
      
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
      }

      const analytics = await db.ConsultationRequest.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              serviceId: '$serviceId',
              serviceName: '$serviceName',
              planType: '$planType',
              status: '$status',
            },
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            uniqueSessions: { $addToSet: '$sessionId' },
          },
        },
        {
          $group: {
            _id: '$_id.serviceId',
            serviceName: { $first: '$_id.serviceName' },
            planStats: {
              $push: {
                planType: '$_id.planType',
                status: '$_id.status',
                count: '$count',
                uniqueUsers: { $size: '$uniqueUsers' },
                uniqueSessions: { $size: '$uniqueSessions' },
              },
            },
            totalRequests: { $sum: '$count' },
            totalUniqueUsers: { $sum: { $size: '$uniqueUsers' } },
            totalUniqueSessions: { $sum: { $size: '$uniqueSessions' } },
          },
        },
        { $sort: { totalRequests: -1 } },
      ]);

      const response = sendSuccessApiResponse("Consultation request analytics retrieved successfully", {
        analytics,
        dateRange: { startDate, endDate },
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
