import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const password = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create sample categories
  const techCategory = await prisma.category.upsert({
    where: { slug: "technology" },
    update: {},
    create: {
      name: "Technology",
      slug: "technology",
      description: "Latest tech trends and insights",
      color: "#3B82F6",
    },
  });

  const webDevCategory = await prisma.category.upsert({
    where: { slug: "web-development" },
    update: {},
    create: {
      name: "Web Development",
      slug: "web-development",
      description: "Web development tutorials and tips",
      color: "#10B981",
    },
  });

  console.log("✅ Categories created");

  // Create sample blog posts
  const post1 = await prisma.post.upsert({
    where: { slug: "welcome-to-miniblog" },
    update: {},
    create: {
      title: "Welcome to MiniBlog",
      slug: "welcome-to-miniblog",
      content: `# Welcome to MiniBlog

This is your first blog post! MiniBlog is a modern, clean blogging platform built with:

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Prisma** for database management
- **NextAuth.js** for authentication

## Getting Started

You can now start creating amazing content for your blog. Visit the admin dashboard to:

1. Create new blog posts
2. Manage categories
3. Moderate comments
4. View analytics

Happy blogging! 🚀`,
      excerpt:
        "Welcome to your new MiniBlog! Learn about the features and how to get started with creating amazing content.",
      published: true,
      authorId: admin.id,
      categoryId: techCategory.id,
      views: 0,
    },
  });

  const post2 = await prisma.post.upsert({
    where: { slug: "getting-started-with-nextjs" },
    update: {},
    create: {
      title: "Getting Started with Next.js 14",
      slug: "getting-started-with-nextjs",
      content: `# Getting Started with Next.js 14

Next.js 14 brings incredible improvements to React development. Here's what you need to know:

## App Router

The new App Router provides:
- File-based routing
- Server Components by default
- Improved performance
- Better SEO

## Key Features

- **Server Components**: Run on the server for better performance
- **Client Components**: Interactive components that run in the browser
- **Streaming**: Progressive loading of page content
- **Built-in SEO**: Meta tags and structured data support

Start building amazing web applications today!`,
      excerpt:
        "Learn the fundamentals of Next.js 14 and its powerful App Router system.",
      published: true,
      authorId: admin.id,
      categoryId: webDevCategory.id,
      views: 0,
    },
  });

  const post3 = await prisma.post.upsert({
    where: { slug: "draft-post-example" },
    update: {},
    create: {
      title: "This is a Draft Post",
      slug: "draft-post-example",
      content: `# Draft Post

This is an example of a draft post. It won't appear on the public blog until you publish it.

Use drafts to:
- Work on posts over time
- Review content before publishing
- Plan your content calendar

When you're ready, just toggle the "Published" status in the admin dashboard.`,
      excerpt: "An example draft post to show how unpublished content works.",
      published: false, // This is a draft
      authorId: admin.id,
      categoryId: webDevCategory.id,
      views: 0,
    },
  });

  console.log("✅ Sample blog posts created");

  console.log("🎉 Database seed completed successfully!");
  console.log("\n📝 Admin Login Credentials:");
  console.log("Email: admin@example.com");
  console.log("Password: admin123");
  console.log("\n🌐 Visit http://localhost:3000/admin to get started!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
