import mongoose, { Document } from 'mongoose';

interface IQuery extends Document {
  name: string;
  email: string;
  phoneNo: number;
  query: string;
  comment?: string;
  category?: string; // service, course, updated, general, etc.
  isResponded?: boolean;
  respondedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface QueryModel extends mongoose.Model<IQuery> {}

export { QueryModel, IQuery };