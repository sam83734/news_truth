import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document {
  id?: string;
  customId?: string;
  title: string;
  excerpt: string;
  fullContent: string;
  authorName: string;
  authorTitle: string;
  authorAvatarUrl: string;
  dateOrTimeAgo: string;
  category: string;
  imageUrl: string;
  isVerifiedGround?: boolean;
  isUrgent?: boolean;
  isPremium?: boolean;
  isHero?: boolean;
  isOpinion?: boolean;
  isAuthorColumn?: boolean;
  isBentoPublished?: boolean;
  readTime?: string;
  views?: string;
  viewCount?: number;
  categoryTag?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    customId: { type: String, unique: true, sparse: true },
    title: { type: String, required: true },
    excerpt: { type: String, default: '' },
    fullContent: { type: String, default: '' },
    authorName: { type: String, required: true },
    authorTitle: { type: String, default: '' },
    authorAvatarUrl: { type: String, default: '' },
    dateOrTimeAgo: { type: String, default: 'Just now' },
    category: { type: String, default: 'Ground Report' },
    imageUrl: { type: String, default: '' },
    isVerifiedGround: { type: Boolean, default: false },
    isUrgent: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    isHero: { type: Boolean, default: false },
    isOpinion: { type: Boolean, default: false },
    isAuthorColumn: { type: Boolean, default: false },
    isBentoPublished: { type: Boolean, default: false },
    readTime: { type: String, default: '3 min' },
    views: { type: String, default: '1k' },
    viewCount: { type: Number, default: 1000 },
    categoryTag: { type: String, default: '' },
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

export const ArticleModel = mongoose.model<IArticle>('Article', ArticleSchema);
