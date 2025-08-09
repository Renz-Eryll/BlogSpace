// src/app/page.tsx
import Hero from "@/components/Hero";
import LoadingSpinner from "@/components/LoadingSpinner";
import PostList from "@/components/PostList";
import { Suspense } from "react";

// This is your homepage component
export default async function HomePage() {
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
              <PostList />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

// SEO metadata
export const metadata = {
  title: "BlogSpace - Web Development Articles",
  description:
    "Discover insightful articles about web development, technology, and design.",
};
