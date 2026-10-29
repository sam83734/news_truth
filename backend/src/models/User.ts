import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types';

export interface IUser extends Document {
  id?: string;
  customId?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  roleBadge: string;
  bio: string;
  avatarUrl: string;
  isPremium: boolean;
  publishedCount: number;
  totalViews: string;
  bookmarkedArticleIds: string[];
  likedVideoIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    customId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['USER', 'JOURNALIST', 'EXPERT', 'ADMIN'],
      default: 'USER',
    },
    roleBadge: { type: String, default: 'CITIZEN REPORTER' },
    bio: { type: String, default: '' },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120',
    },
    isPremium: { type: Boolean, default: false },
    publishedCount: { type: Number, default: 0 },
    totalViews: { type: String, default: '0' },
    bookmarkedArticleIds: { type: [String], default: [] },
    likedVideoIds: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.customId || (ret._id ? ret._id.toString() : ret.id);
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
