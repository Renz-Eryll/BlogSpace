// src/types/index.ts

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  _count?: {
    posts: number;
  };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  coverImage: string | null;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  categoryId: string | null;
  category: Category | null;
  _count?: {
    comments: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  approved: boolean;
  createdAt: Date;
  postId: string;
  post?: Post;
  userId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  guestName: string | null;
  guestEmail: string | null;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationData;
}

// Form data types
export interface PostFormData {
  title: string;
  content: string;
  excerpt?: string;
  published: boolean;
  coverImage?: string;
  categoryId?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  color?: string;
}

export interface CommentFormData {
  content: string;
  postId: string;
  guestName?: string;
  guestEmail?: string;
}
