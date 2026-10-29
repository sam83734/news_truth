import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  id?: string;
  customId?: string;
  title: string;
  message: string;
  timeAgo: string;
  isUrgent: boolean;
  isRead: boolean;
  type: string;
  targetArticleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    customId: { type: String, unique: true, sparse: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    timeAgo: { type: String, default: 'Just now' },
    isUrgent: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    type: { type: String, default: 'SYSTEM' },
    targetArticleId: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.customId || (ret._id ? ret._id.toString() : ret.id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
