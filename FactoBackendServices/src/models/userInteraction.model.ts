import mongoose from "mongoose";
import { IUserInteraction, UserInteractionModel } from "@/interfaces/userInteractionInterface";

const UserInteractionSchema = new mongoose.Schema<IUserInteraction, UserInteractionModel>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for guest users
    },
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      trim: true,
      unique: true, // Each session should be unique
    },
    pageViews: [{
      page: {
        type: String,
        required: [true, "Page is required"],
        trim: true,
      },
      timestamp: {
        type: Date,
        required: [true, "Timestamp is required"],
        default: Date.now,
      },
      duration: {
        type: Number,
        required: false,
        min: 0,
      },
    }],
    buttonClicks: [{
      buttonType: {
        type: String,
        required: [true, "Button type is required"],
        trim: true,
      },
      buttonText: {
        type: String,
        required: [true, "Button text is required"],
        trim: true,
      },
      timestamp: {
        type: Date,
        required: [true, "Timestamp is required"],
        default: Date.now,
      },
      serviceId: {
        type: String,
        required: false,
        trim: true,
      },
    }],
    conversionEvents: [{
      eventType: {
        type: String,
        required: [true, "Event type is required"],
        enum: {
          values: ["quotation_request", "consultation_request", "signup", "login"],
          message: "{VALUE} is not a valid conversion event type",
        },
      },
      timestamp: {
        type: Date,
        required: [true, "Timestamp is required"],
        default: Date.now,
      },
      metadata: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
      },
    }],
    sessionStart: {
      type: Date,
      required: [true, "Session start is required"],
      default: Date.now,
    },
    sessionEnd: {
      type: Date,
      required: false,
    },
    deviceInfo: {
      userAgent: {
        type: String,
        required: [true, "User agent is required"],
      },
      platform: {
        type: String,
        required: [true, "Platform is required"],
        trim: true,
      },
      browser: {
        type: String,
        required: [true, "Browser is required"],
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    collection: "user_interactions",
  }
);

// Index for better query performance
UserInteractionSchema.index({ userId: 1, sessionStart: -1 });
UserInteractionSchema.index({ sessionId: 1 });
UserInteractionSchema.index({ "conversionEvents.eventType": 1, sessionStart: -1 });
UserInteractionSchema.index({ sessionStart: -1, sessionEnd: 1 });

const UserInteraction = mongoose.model<IUserInteraction, UserInteractionModel>(
  "UserInteraction",
  UserInteractionSchema,
  "user_interactions"
);

export default UserInteraction;
