import mongoose from "mongoose";
import { NewsletterSubscriptionModel, INewsletterSubscription } from "@/interfaces";

const NewsletterSubscriptionSchema = new mongoose.Schema<INewsletterSubscription, NewsletterSubscriptionModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NewsletterSubscriptionSchema.index({ email: 1 });
NewsletterSubscriptionSchema.index({ isActive: 1 });
NewsletterSubscriptionSchema.index({ subscribedAt: -1 });

const NewsletterSubscription = mongoose.model<INewsletterSubscription, NewsletterSubscriptionModel>(
  "NewsletterSubscription",
  NewsletterSubscriptionSchema,
  "NewsletterSubscription"
);

export default NewsletterSubscription;

