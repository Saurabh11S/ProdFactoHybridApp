import mongoose, { Document } from 'mongoose';

export interface IConsultationRequest extends Document {
  userId?: mongoose.Types.ObjectId; // Reference to User
  sessionId: string;
  serviceId: string;
  serviceName: string;
  planType: 'free_consultation' | 'paid_consultation';
  userDetails: {
    name?: string;
    email?: string;
    phoneNumber?: string;
  };
  requestData: {
    additionalInfo?: string;
    preferredContactTime?: string;
    urgency?: 'low' | 'medium' | 'high';
  };
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  assignedTo?: mongoose.Types.ObjectId; // Admin/employee assigned
  notes?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultationRequestModel extends mongoose.Model<IConsultationRequest> {}
