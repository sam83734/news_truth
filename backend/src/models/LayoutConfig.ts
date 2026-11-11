import mongoose, { Schema, Document } from 'mongoose';

export interface ILayoutConfig extends Document {
  heroBannerCategory: string;
  secondaryBannerCategory: string;
  secondaryBannerTitle?: string;
  videoSectionCategory: string;
  updatedAt: Date;
}

const LayoutConfigSchema = new Schema<ILayoutConfig>(
  {
    heroBannerCategory: { type: String, default: 'Urgent Breaking' },
    secondaryBannerCategory: { type: String, default: 'Tech & Media' },
    secondaryBannerTitle: { type: String, default: 'Tech & Media News' },
    videoSectionCategory: { type: String, default: 'All' },
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

export const LayoutConfigModel = mongoose.model<ILayoutConfig>('LayoutConfig', LayoutConfigSchema);

