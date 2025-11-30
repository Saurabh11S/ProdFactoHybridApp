import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  itemType: 'service' | 'course';
  itemId: string;
  selectedFeatures: string[];
  billingPeriod: string;
  paymentOrderId: mongoose.Types.ObjectId;
  status: 'active' | 'expired' | 'cancelled';
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserPurchaseSchema = new Schema<IUserPurchase>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  itemType: {
    type: String,
    enum: ['service', 'course'],
    required: true
  },
    itemId: {
      type: String,
      required: true
    },
  selectedFeatures: [{
    type: String
  }],
  billingPeriod: {
    type: String,
    required: true,
    default: 'one-time'
  },
  paymentOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'PaymentOrder'
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  expiryDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
UserPurchaseSchema.index({ userId: 1, status: 1 });
UserPurchaseSchema.index({ itemId: 1 });
UserPurchaseSchema.index({ paymentOrderId: 1 });

export const UserPurchase = mongoose.model<IUserPurchase>('UserPurchase', UserPurchaseSchema, 'userpurchases');