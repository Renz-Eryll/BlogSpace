"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-bold">
              MiniBlog Admin
            </Link>
            <div className="flex space-x-4">
              <Link href="/admin" className="text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
              <Link
                href="/admin/post"
                className="text-gray-700 hover:text-gray-900"
              >
                Posts
              </Link>
              <Link
                href="/admin/comments"
                className="text-gray-700 hover:text-gray-900"
              >
                Comments
              </Link>
              <Link
                href="/admin/categories"
                className="text-gray-700 hover:text-gray-900"
              >
                Categories
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              View Blog
            </Link>
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
