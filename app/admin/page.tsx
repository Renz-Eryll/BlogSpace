import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

async function getDashboardData() {
  const [postsCount, commentsCount, publishedPosts] = await Promise.all([
    db.post.count(),
    db.comment.count(),
    db.post.count({ where: { published: true } }),
  ]);

  return { postsCount, commentsCount, publishedPosts };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const { postsCount, commentsCount, publishedPosts } =
    await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session?.user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{postsCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Published</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{publishedPosts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{commentsCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
