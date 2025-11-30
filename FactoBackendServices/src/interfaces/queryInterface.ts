import mongoose, { Document } from 'mongoose';

interface IQuery extends Document {
  name: string;
  email: string;
  phoneNo: number;
  query: string;
<<<<<<< HEAD
  comment?: string;
  category?: string; // service, course, updated, general, etc.
  isResponded?: boolean;
  respondedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
=======
  comment: string;
  category?: string; // service, course, updated, general, etc.
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
}

interface QueryModel extends mongoose.Model<IQuery> {}

export { QueryModel, IQuery };