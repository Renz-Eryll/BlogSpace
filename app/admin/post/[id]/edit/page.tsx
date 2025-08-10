// src/app/admin/posts/[id]/edit/page.tsx
import { PostForm } from "@/components/PostForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditPostPageProps {
  params: {
    id: string;
  };
}

async function getPost(id: string, userId: string) {
  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  // Check if post exists
  if (!post) {
    notFound();
  }

  // Check if user owns the post
  if (post.authorId !== userId) {
    redirect("/admin");
  }

  return post;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const post = await getPost(params.id, session.user.id);

  // Transform post data for the form
  const initialData = {
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt || "",
    published: post.published,
    coverImage: post.coverImage || "",
    categoryId: post.categoryId || "",
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
          <p className="text-gray-600 mt-1">
            Editing: <span className="font-medium">{post.title}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {post.published && (
            <Link href={`/post/${post.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                View Live Post
              </Button>
            </Link>
          )}

          <div className="text-sm text-gray-500">
            Last updated: {new Date(post.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Post Form */}
      <PostForm initialData={initialData} isEditing={true} />
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: EditPostPageProps) {
  try {
    const post = await db.post.findUnique({
      where: { id: params.id },
      select: { title: true },
    });

    return {
      title: post ? `Edit: ${post.title}` : "Edit Post",
      description: "Edit blog post",
    };
  } catch {
    return {
      title: "Edit Post",
      description: "Edit blog post",
    };
  }
}
