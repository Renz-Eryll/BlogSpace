// src/app/api/post/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updatePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  published: z.boolean().default(false),
  coverImage: z.string().optional(),
  categoryId: z.string().optional(),
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET - Fetch single post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await db.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        category: true,
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PUT - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if post exists and user owns it
    const existingPost = await db.post.findUnique({
      where: { id: params.id },
      select: { authorId: true, slug: true, title: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updatePostSchema.parse(body);

    // Generate new slug if title changed
    let slug = existingPost.slug;
    if (validatedData.title !== existingPost.title) {
      slug = generateSlug(validatedData.title);
      let slugCounter = 1;

      // Check for slug conflicts (exclude current post)
      while (
        await db.post.findFirst({
          where: {
            slug,
            NOT: { id: params.id },
          },
        })
      ) {
        slug = `${generateSlug(validatedData.title)}-${slugCounter}`;
        slugCounter++;
      }
    }

    // Generate excerpt if not provided
    let excerpt = validatedData.excerpt;
    if (!excerpt && validatedData.content) {
      excerpt =
        validatedData.content
          .replace(/<[^>]*>/g, "")
          .substring(0, 160)
          .trim() + "...";
    }

    const updatedPost = await db.post.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        slug,
        content: validatedData.content,
        excerpt,
        published: validatedData.published,
        coverImage: validatedData.coverImage,
        categoryId: validatedData.categoryId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        category: true,
      },
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if post exists and user owns it
    const existingPost = await db.post.findUnique({
      where: { id: params.id },
      select: { authorId: true, title: true, coverImage: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the post (comments will be cascade deleted based on your schema)
    await db.post.delete({
      where: { id: params.id },
    });

    // Optional: Delete associated cover image file
    if (existingPost.coverImage) {
      try {
        const { unlink } = await import("fs/promises");
        const { join } = await import("path");
        const imagePath = join(
          process.cwd(),
          "public",
          existingPost.coverImage
        );
        await unlink(imagePath);
      } catch (imageDeleteError) {
        console.warn("Failed to delete cover image:", imageDeleteError);
        // Don't fail the entire operation if image deletion fails
      }
    }

    return NextResponse.json({
      message: "Post deleted successfully",
      deletedPost: {
        id: params.id,
        title: existingPost.title,
      },
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
