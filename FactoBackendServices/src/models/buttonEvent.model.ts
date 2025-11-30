import mongoose from "mongoose";
import { IButtonEvent, ButtonEventModel } from "@/interfaces/buttonEventInterface";

const ButtonEventSchema = new mongoose.Schema<IButtonEvent, ButtonEventModel>(
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
    },
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      enum: {
        values: ["click", "hover", "view", "submit"],
        message: "{VALUE} is not a valid event type",
      },
    },
    buttonType: {
      type: String,
      required: [true, "Button type is required"],
      enum: {
        values: ["get_quotation", "contact_us", "free_consultation", "documents", "login", "signup", "other"],
        message: "{VALUE} is not a valid button type",
      },
    },
    serviceId: {
      type: String,
      required: false,
      trim: true,
    },
    page: {
      type: String,
      required: [true, "Page is required"],
      trim: true,
    },
    buttonText: {
      type: String,
      required: [true, "Button text is required"],
      trim: true,
    },
    metadata: {
      userAgent: {
        type: String,
        required: [true, "User agent is required"],
      },
      ipAddress: {
        type: String,
        required: [true, "IP address is required"],
      },
      referrer: {
        type: String,
        required: false,
      },
      timestamp: {
        type: Date,
        required: [true, "Timestamp is required"],
        default: Date.now,
      },
      additionalData: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
      },
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["pending", "processed", "failed"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: "button_events",
  }
);

// Index for better query performance
ButtonEventSchema.index({ userId: 1, createdAt: -1 });
ButtonEventSchema.index({ sessionId: 1, createdAt: -1 });
ButtonEventSchema.index({ eventType: 1, buttonType: 1 });
ButtonEventSchema.index({ serviceId: 1, createdAt: -1 });

const ButtonEvent = mongoose.model<IButtonEvent, ButtonEventModel>(
  "ButtonEvent",
  ButtonEventSchema,
  "button_events"
);

export default ButtonEvent;
