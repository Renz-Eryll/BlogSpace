// src/app/page.tsx
import Hero from "@/components/Hero";
import LoadingSpinner from "@/components/LoadingSpinner";

import { Suspense } from "react";

import PostList from "@/components/PostList";
import { db } from "@/lib/db";

export default async function HomePage() {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      author: true,
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <Hero />

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Blog posts */}
          <div className="lg:col-span-2">
            <Suspense fallback={<LoadingSpinner />}>
              <PostList posts={posts} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "BlogSpace - Web Development Articles",
  description:
    "Discover insightful articles about web development, technology, and design.",
};
