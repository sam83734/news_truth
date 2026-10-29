import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  id?: string;
  name: string;
  slug: string;
  description?: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
  },
  {
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);
