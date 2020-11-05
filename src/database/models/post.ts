import { model, Schema, Document } from 'mongoose';

export type CategoriesType = 'react' | 'node' | 'javascript' | 'etc';

export interface PostSchema extends Document {
  userId: number;
  isTemp: boolean;
  category: CategoriesType;
  title: string;
  content: string;
  thumbnail: string;
  tags: string[];
}

const Post = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isTemp: { type: Boolean, required: true },
    category: { type: String, required: true },
    title: { type: String, maxlength: 30, required: true },
    content: String,
    thumbnail: { type: String, required: true },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

export default model<PostSchema>('Post', Post);
