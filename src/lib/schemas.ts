import { z } from 'zod';

export const createPostSchema = z.object({
  desc: z.string().min(1, 'Post content is required').max(280, 'Post is too long'),
  img: z.string().optional(),
  video: z.string().optional(),
  isSensitive: z.boolean().default(false),
});

export const commentSchema = z.object({
  desc: z.string().min(1, 'Comment is required').max(280, 'Comment is too long'),
  postId: z.number(),
});

export const followSchema = z.object({
  userId: z.string(),
});

export type CreatePostData = z.infer<typeof createPostSchema>;
export type CommentData = z.infer<typeof commentSchema>;
export type FollowData = z.infer<typeof followSchema>;
