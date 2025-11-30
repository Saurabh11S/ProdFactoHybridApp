import mongoose, { Document } from 'mongoose';

export interface IUserInteraction extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  pageViews: Array<{
    page: string;
    timestamp: Date;
    duration?: number; // Time spent on page in seconds
  }>;
  buttonClicks: Array<{
    buttonType: string;
    buttonText: string;
    timestamp: Date;
    serviceId?: string;
  }>;
  conversionEvents: Array<{
    eventType: 'quotation_request' | 'consultation_request' | 'signup' | 'login';
    timestamp: Date;
    metadata?: any;
  }>;
  sessionStart: Date;
  sessionEnd?: Date;
  deviceInfo: {
    userAgent: string;
    platform: string;
    browser: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInteractionModel extends mongoose.Model<IUserInteraction> {}
