import mongoose, { Document } from 'mongoose';

export interface IButtonEvent extends Document {
  userId?: mongoose.Types.ObjectId; // Reference to User (optional for guest users)
  sessionId: string; // Track anonymous users
  eventType: 'click' | 'hover' | 'view' | 'submit';
  buttonType: 'get_quotation' | 'contact_us' | 'free_consultation' | 'documents' | 'login' | 'signup' | 'other';
  serviceId?: string; // Which service was involved
  page: string; // Which page the event occurred on
  buttonText: string; // The actual button text clicked
  metadata: {
    userAgent: string;
    ipAddress: string;
    referrer?: string;
    timestamp: Date;
    additionalData?: any; // Flexible field for extra data
  };
  status: 'pending' | 'processed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ButtonEventModel extends mongoose.Model<IButtonEvent> {}
