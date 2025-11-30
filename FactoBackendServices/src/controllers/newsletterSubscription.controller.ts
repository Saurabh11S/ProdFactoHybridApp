import { Request, Response, NextFunction } from "express";
import { createCustomError } from "@/errors/customAPIError";
import { StatusCode } from "@/constants/constants";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import bigPromise from "@/middlewares/bigPromise";
import { db } from "@/models";

/**
 * Subscribe to newsletter
 */
export const subscribeToNewsletter = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      // Validate email
      if (!email || !email.trim()) {
        return next(
          createCustomError("Email is required", StatusCode.BAD_REQ)
        );
      }

      // Validate email format
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return next(
          createCustomError("Please provide a valid email address", StatusCode.BAD_REQ)
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if email already exists
      const existingSubscription = await db.NewsletterSubscription.findOne({
        email: normalizedEmail,
      });

      if (existingSubscription) {
        if (existingSubscription.isActive) {
          return next(
            createCustomError(
              "This email is already subscribed to our newsletter",
              StatusCode.BAD_REQ
            )
          );
        } else {
          // Reactivate subscription
          existingSubscription.isActive = true;
          existingSubscription.subscribedAt = new Date();
          existingSubscription.unsubscribedAt = undefined;
          await existingSubscription.save();

          const response = sendSuccessApiResponse(
            "Successfully resubscribed to newsletter",
            { subscription: existingSubscription }
          );
          return res.status(StatusCode.OK).send(response);
        }
      }

      // Create new subscription
      const subscription = await db.NewsletterSubscription.create({
        email: normalizedEmail,
        isActive: true,
        subscribedAt: new Date(),
      });

      const response = sendSuccessApiResponse(
        "Successfully subscribed to newsletter",
        { subscription }
      );
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate key error
        return next(
          createCustomError(
            "This email is already subscribed to our newsletter",
            StatusCode.BAD_REQ
          )
        );
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

/**
 * Unsubscribe from newsletter
 */
export const unsubscribeFromNewsletter = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      // Validate email
      if (!email || !email.trim()) {
        return next(
          createCustomError("Email is required", StatusCode.BAD_REQ)
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Find subscription
      const subscription = await db.NewsletterSubscription.findOne({
        email: normalizedEmail,
      });

      if (!subscription) {
        return next(
          createCustomError(
            "Email not found in our subscription list",
            StatusCode.NOT_FOUND
          )
        );
      }

      if (!subscription.isActive) {
        return next(
          createCustomError(
            "This email is already unsubscribed",
            StatusCode.BAD_REQ
          )
        );
      }

      // Unsubscribe
      subscription.isActive = false;
      subscription.unsubscribedAt = new Date();
      await subscription.save();

      const response = sendSuccessApiResponse(
        "Successfully unsubscribed from newsletter",
        { subscription }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

/**
 * Get all active subscriptions (Admin only)
 */
export const getAllSubscriptions = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 50, isActive } = req.query;

      const filter: any = {};
      if (isActive !== undefined) {
        filter.isActive = isActive === "true";
      }

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 50;
      const skip = (pageNum - 1) * limitNum;

      const subscriptions = await db.NewsletterSubscription.find(filter)
        .select("email isActive subscribedAt unsubscribedAt createdAt")
        .sort({ subscribedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await db.NewsletterSubscription.countDocuments(filter);

      const result = {
        subscriptions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      };

      const response = sendSuccessApiResponse(
        "Subscriptions retrieved successfully",
        result
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

/**
 * Get subscription statistics (Admin only)
 */
export const getSubscriptionStats = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalSubscriptions = await db.NewsletterSubscription.countDocuments();
      const activeSubscriptions = await db.NewsletterSubscription.countDocuments({
        isActive: true,
      });
      const inactiveSubscriptions = totalSubscriptions - activeSubscriptions;

      const stats = {
        total: totalSubscriptions,
        active: activeSubscriptions,
        inactive: inactiveSubscriptions,
      };

      const response = sendSuccessApiResponse(
        "Subscription statistics retrieved successfully",
        { stats }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

