import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { postSchema } from "@/lib/validations";

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET - Fetch all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    const categoryId = searchParams.get("categoryId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (published !== null) {
      whereClause.published = published === "true";
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const posts = await db.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        category: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalPosts = await db.post.count({ where: whereClause });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = postSchema.parse(body);

    let slug = generateSlug(validatedData.title);
    let slugCounter = 1;

    while (await db.post.findUnique({ where: { slug } })) {
      slug = `${generateSlug(validatedData.title)}-${slugCounter}`;
      slugCounter++;
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

    const post = await db.post.create({
      data: {
        title: validatedData.title,
        slug,
        content: validatedData.content,
        excerpt,
        published: validatedData.published,
        coverImage: validatedData.coverImage,
        categoryId: validatedData.categoryId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        category: true,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
