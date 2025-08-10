import Link from "next/link";
import { Post } from "@prisma/client";

interface PostCardProps {
  post: Post & { author?: { name?: string | null } };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="border rounded-lg p-5 shadow-sm hover:shadow-md transition">
      <h2 className="text-xl font-semibold mb-2">
        <Link href={`/posts/${post.id}`}>{post.title}</Link>
      </h2>

      <p className="text-gray-700 text-sm mb-3">
        {post.content.length > 120
          ? post.content.substring(0, 120) + "..."
          : post.content}
      </p>

      <div className="text-xs text-gray-500 flex justify-between">
        <span>
          {post.author?.name ? `By ${post.author.name}` : "Unknown Author"}
        </span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
