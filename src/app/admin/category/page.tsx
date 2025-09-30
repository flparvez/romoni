"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FileUpload from "@/components/Fileupload";
import { toast } from "sonner";
import Link from "next/link";

interface IImage {
  url: string;
  alt?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  images?: IImage[];
  parentCategory?: { _id: string; name: string } | null;
}

export default function EditCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [images, setImages] = useState<IImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/categories/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editing.name,
          slug: editing.slug,
          parentCategory: editing.parentCategory?._id || null,
          images,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) => (c._id === data.category._id ? data.category : c))
        );
        toast.success("Category updated successfully!");
        setIsDialogOpen(false);
        setEditing(null);
        setImages([]);
      } else {
        toast.error(data.error || "Failed to update category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete category
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
        toast.success("Category deleted successfully!");
      } else {
        toast.error(data.error || "Failed to delete category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Manage Categories</CardTitle>
          {/* Create category  Button*/}
          <Link href="/admin/category/create">
            <Button className="ml-auto">Create New Category</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Card key={cat._id} className="flex flex-col justify-between shadow hover:shadow-lg transition rounded-2xl">
                <div className="flex items-center gap-4 p-4">
                  {cat.images?.[0] ? (
                    <img
                      src={cat.images[0].url}
                      alt={cat.name}
                      className="h-16 w-16 rounded-lg border object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg border bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                      No Img
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{cat.name}</p>
                    <p className="text-sm text-gray-500">{cat.slug}</p>
                    <p className="text-xs text-gray-400">
                      {cat.parentCategory ? `Sub of: ${cat.parentCategory.name}` : "Main Category"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 border-t">
                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen && editing?._id === cat._id} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(cat);
                            setImages(cat.images || []);
                            setIsDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Edit Category</DialogTitle>
                        </DialogHeader>
                        {editing && (
                          <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid gap-2">
                              <Label>Name</Label>
                              <Input
                                value={editing.name}
                                onChange={(e) =>
                                  setEditing((prev) => (prev ? { ...prev, name: e.target.value } : null))
                                }
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Slug</Label>
                              <Input
                                value={editing.slug}
                                onChange={(e) =>
                                  setEditing((prev) => (prev ? { ...prev, slug: e.target.value } : null))
                                }
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Parent Category (optional)</Label>
                              <Select
                                onValueChange={(val) =>
                                  setEditing((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          parentCategory:
                                            val === "none"
                                              ? null
                                              : { _id: val, name: categories.find((c) => c._id === val)?.name || "" },
                                        }
                                      : null
                                  )
                                }
                                value={editing.parentCategory?._id || "none"}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="None (Main Category)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None (Main Category)</SelectItem>
                                  {categories
                                    .filter((c) => !c.parentCategory && c._id !== editing._id)
                                    .map((cat) => (
                                      <SelectItem key={cat._id} value={cat._id}>
                                        {cat.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {!editing.parentCategory && (
                              <div className="grid gap-2">
                                <Label>Category Images</Label>
                                <FileUpload
                                  initialImages={images.map((img) => img.url)}
                                  onChange={(urls: string[]) => setImages(urls.map((url) => ({ url })))}
                                />
                              </div>
                            )}

                            <Button type="submit" disabled={loading} className="w-full">
                              {loading ? "Updating..." : "Update"}
                            </Button>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(cat._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
