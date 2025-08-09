import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().optional(),
  published: z.boolean().default(false),
  categoryId: z.string().optional(),
  coverImage: z.string().optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, "Comment is required"),
  postId: z.string(),
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});
