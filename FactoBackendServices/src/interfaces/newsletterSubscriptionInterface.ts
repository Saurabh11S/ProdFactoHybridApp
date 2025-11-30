import { Document, Model } from "mongoose";

export interface INewsletterSubscription extends Document {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsletterSubscriptionModel extends Model<INewsletterSubscription> {
  // Add any static methods here if needed
}

