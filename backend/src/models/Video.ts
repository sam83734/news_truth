import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  id?: string;
  customId?: string;
  title: string;
  videoThumbnailUrl: string;
  videoUrl?: string;
  isLive: boolean;
  isReplay: boolean;
  reporterName: string;
  location: string;
  viewersCount: string;
  likesCount: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    customId: { type: String, unique: true, sparse: true },
    title: { type: String, required: true },
    videoThumbnailUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    isLive: { type: Boolean, default: false },
    isReplay: { type: Boolean, default: false },
    reporterName: { type: String, default: 'Staff Reporter' },
    location: { type: String, default: 'Metro Plaza' },
    viewersCount: { type: String, default: '1.2k' },
    likesCount: { type: Number, default: 0 },
    description: { type: String, default: '' },
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

export const VideoModel = mongoose.model<IVideo>('Video', VideoSchema);
