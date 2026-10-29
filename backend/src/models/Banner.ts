import mongoose, { Schema, Document } from 'mongoose';
import { TargetAudience } from '../types';

export interface IBanner extends Document {
  id?: string;
  title: string;
  sponsorName: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  actionUrl: string;
  targetAudience: TargetAudience;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    sponsorName: { type: String, required: true },
    subtitle: { type: String, default: '' },
    badge: { type: String, default: 'COMMUNITY SPONSOR' },
    ctaText: { type: String, default: 'LEARN MORE' },
    actionUrl: { type: String, default: 'https://susalabs.com' },
    targetAudience: {
      type: String,
      enum: ['ALL', 'PREMIUM_ONLY', 'COMMUNITY_ONLY', 'INVESTIGATIVE'],
      default: 'ALL',
    },
  },
  {
    timestamps: true,
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

export const BannerModel = mongoose.model<IBanner>('Banner', BannerSchema);
