import mongoose, { Document } from 'mongoose';

interface IQuery extends Document {
  name: string;
  email: string;
  phoneNo: number;
  query: string;
  comment: string;
  category?: string; // service, course, updated, general, etc.
}

interface QueryModel extends mongoose.Model<IQuery> {}

export { QueryModel, IQuery };