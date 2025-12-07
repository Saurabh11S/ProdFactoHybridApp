import mongoose, { Document, Model } from 'mongoose';

export interface IPaymentOrderItem {
  itemType: 'course' | 'service';
  itemId: string;
  price: number;
  billingPeriod?: string;
  selectedFeatures?: string[];
}

export interface IPaymentOrder extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'free_consultation' | 'free_service';
  paymentMethod: string;
  transactionId?: string;
  items: IPaymentOrderItem[];
  // Fields for admin-activated payment (for free consultation services)
  isConsultationPayment?: boolean;
  consultationPrice?: number;
  paymentActivatedByAdmin?: boolean;
  activatedAt?: Date;
  activatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  totalAmount: number;
}

export interface  PaymentOrderModel extends Model<IPaymentOrder> {}

