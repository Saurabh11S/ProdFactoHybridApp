import mongoose from "mongoose";
import { IConsultationRequest, ConsultationRequestModel } from "@/interfaces/consultationRequestInterface";

const ConsultationRequestSchema = new mongoose.Schema<IConsultationRequest, ConsultationRequestModel>(
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
    serviceId: {
      type: String,
      required: [true, "Service ID is required"],
      trim: true,
    },
    serviceName: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    planType: {
      type: String,
      required: [true, "Plan type is required"],
      enum: {
        values: ["free_consultation", "paid_consultation"],
        message: "{VALUE} is not a valid plan type",
      },
    },
    userDetails: {
      name: {
        type: String,
        required: false,
        trim: true,
      },
      email: {
        type: String,
        required: false,
        lowercase: true,
        trim: true,
        validate: {
          validator: function (v: string) {
            if (!v) return true; // Allow empty email
            return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
          },
          message: "Please enter a valid email address",
        },
      },
      phoneNumber: {
        type: String,
        required: false,
        trim: true,
        validate: {
          validator: function (v: string) {
            if (!v) return true; // Allow empty phone
            return /^[6-9]\d{9}$/.test(v);
          },
          message: "Please enter a valid 10-digit Indian mobile number",
        },
      },
    },
    requestData: {
      additionalInfo: {
        type: String,
        required: false,
        trim: true,
      },
      preferredContactTime: {
        type: String,
        required: false,
        trim: true,
      },
      urgency: {
        type: String,
        required: false,
        enum: {
          values: ["low", "medium", "high"],
          message: "{VALUE} is not a valid urgency level",
        },
        default: "medium",
      },
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["pending", "contacted", "completed", "cancelled"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    notes: {
      type: String,
      required: false,
      trim: true,
    },
    followUpDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "consultation_requests",
  }
);

// Index for better query performance
ConsultationRequestSchema.index({ userId: 1, createdAt: -1 });
ConsultationRequestSchema.index({ sessionId: 1, createdAt: -1 });
ConsultationRequestSchema.index({ serviceId: 1, status: 1 });
ConsultationRequestSchema.index({ status: 1, createdAt: -1 });
ConsultationRequestSchema.index({ assignedTo: 1, status: 1 });

const ConsultationRequest = mongoose.model<IConsultationRequest, ConsultationRequestModel>(
  "ConsultationRequest",
  ConsultationRequestSchema,
  "consultation_requests"
);

export default ConsultationRequest;
