import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { NextFunction, Response } from "express";
import { AuthRequest } from "@/middlewares/auth";

// Track button event
export const trackButtonEvent = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {
        sessionId,
        eventType,
        buttonType,
        serviceId,
        page,
        buttonText,
        metadata,
      } = req.body;

      // Validate required fields
      if (!sessionId || !eventType || !buttonType || !page || !buttonText) {
        return next(createCustomError("Missing required fields", StatusCode.BAD_REQ));
      }

      // Get user ID from auth middleware if available
      const userId = req.user?.userId;

      const buttonEvent = new db.ButtonEvent({
        userId,
        sessionId,
        eventType,
        buttonType,
        serviceId,
        page,
        buttonText,
        metadata: {
          userAgent: req.headers['user-agent'] || '',
          ipAddress: req.ip || req.connection.remoteAddress || '',
          referrer: req.headers.referer || '',
          timestamp: new Date(),
          additionalData: metadata || {},
        },
        status: 'pending',
      });

      await buttonEvent.save();

      const response = sendSuccessApiResponse("Button event tracked successfully", { buttonEvent });
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get button events (for analytics)
export const getButtonEvents = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit = 50, eventType, buttonType, serviceId, userId } = req.query;
      
      const filter: any = {};
      
      if (eventType) filter.eventType = eventType;
      if (buttonType) filter.buttonType = buttonType;
      if (serviceId) filter.serviceId = serviceId;
      if (userId) filter.userId = userId;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 50;
      const skip = (pageNum - 1) * limitNum;

      const buttonEvents = await db.ButtonEvent.find(filter)
        .populate('userId', 'fullName email phoneNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await db.ButtonEvent.countDocuments(filter);

      const response = sendSuccessApiResponse("Button events retrieved successfully", {
        buttonEvents,
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

// Get button event analytics
export const getButtonEventAnalytics = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;
      
      const matchStage: any = {};
      
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
      }

      // Group by different time periods
      let groupFormat = '%Y-%m-%d';
      if (groupBy === 'hour') groupFormat = '%Y-%m-%d %H:00:00';
      if (groupBy === 'month') groupFormat = '%Y-%m';

      const analytics = await db.ButtonEvent.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: groupFormat, date: '$createdAt' } },
              buttonType: '$buttonType',
              eventType: '$eventType',
            },
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            uniqueSessions: { $addToSet: '$sessionId' },
          },
        },
        {
          $group: {
            _id: '$_id.date',
            buttonStats: {
              $push: {
                buttonType: '$_id.buttonType',
                eventType: '$_id.eventType',
                count: '$count',
                uniqueUsers: { $size: '$uniqueUsers' },
                uniqueSessions: { $size: '$uniqueSessions' },
              },
            },
            totalEvents: { $sum: '$count' },
            totalUniqueUsers: { $sum: { $size: '$uniqueUsers' } },
            totalUniqueSessions: { $sum: { $size: '$uniqueSessions' } },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const response = sendSuccessApiResponse("Button event analytics retrieved successfully", {
        analytics,
        groupBy,
        dateRange: { startDate, endDate },
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
