// src/components/PostForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "react-hot-toast"; // or your toast library

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface PostFormData {
  title: string;
  content: string;
  excerpt?: string;
  published: boolean;
  coverImage?: string;
  categoryId?: string;
}

interface PostFormProps {
  initialData?: PostFormData & { id?: string };
  isEditing?: boolean;
}

export function PostForm({ initialData, isEditing = false }: PostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    published: initialData?.published || false,
    coverImage: initialData?.coverImage || "",
    categoryId: initialData?.categoryId || "",
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (
    field: keyof PostFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      coverImage: imageUrl,
    }));
  };

  const generateExcerpt = (content: string): string => {
    return (
      content
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .substring(0, 160)
        .trim() + (content.length > 160 ? "..." : "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        excerpt: formData.excerpt || generateExcerpt(formData.content),
        categoryId: formData.categoryId || null,
      };

      const url = isEditing ? `/api/post/${initialData?.id}` : "/api/post";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          isEditing
            ? "Post updated successfully!"
            : "Post created successfully!"
        );
        router.push("/admin");
        router.refresh();
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to save post");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    // You can implement a preview modal here
    toast("Preview functionality coming soon!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Post" : "Create New Post"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter post title..."
                className="text-lg"
                required
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <ImageUpload
                currentImage={formData.coverImage}
                onImageUpload={handleImageUpload}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <div className="space-y-2">
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) =>
                    handleInputChange("categoryId", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={
                        formData.categoryId === category.id
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() =>
                        handleInputChange(
                          "categoryId",
                          formData.categoryId === category.id ? "" : category.id
                        )
                      }
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Write your post content here..."
                className="min-h-[400px] resize-y"
                required
              />
              <p className="text-sm text-gray-500">
                Tip: You can use Markdown formatting
              </p>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">
                Excerpt{" "}
                <span className="text-sm text-gray-500">(optional)</span>
              </Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                placeholder="Short description of the post (auto-generated if left empty)"
                className="h-20"
              />
            </div>

            {/* Published Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) =>
                  handleInputChange("published", checked)
                }
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="button" variant="outline" onClick={handlePreview}>
                  Preview
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Update Post"
                  : "Create Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
