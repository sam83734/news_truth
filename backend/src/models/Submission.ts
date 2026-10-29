import mongoose, { Schema, Document } from 'mongoose';
import { SubmissionStatus } from '../types';

export interface ISubmission extends Document {
  id?: string;
  customId?: string;
  title: string;
  status: SubmissionStatus;
  submittedTimeAgo: string;
  note: string;
  location?: string;
  category?: string;
  description?: string;
  attachments?: string;   // JSON array of { id, uri, type } objects
  audioUri?: string;      // voice recording URI
  userId?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    customId: { type: String, unique: true, sparse: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'REVISE', 'APPROVED'],
      default: 'PENDING',
    },
    submittedTimeAgo: { type: String, default: 'Just now' },
    note: { type: String, default: 'Verification desk reviewing report materials.' },
    location: { type: String, default: 'Downtown Metro' },
    category: { type: String, default: 'Ground Report' },
    description: { type: String, default: '' },
    attachments: { type: String, default: '' },
    audioUri: { type: String, default: '' },
    userId: { type: String, default: '' },
    authorName: { type: String, default: '' },
    authorAvatarUrl: { type: String, default: '' },
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

export const SubmissionModel = mongoose.model<ISubmission>('Submission', SubmissionSchema);
