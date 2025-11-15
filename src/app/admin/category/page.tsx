"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { UploadCloud, X } from "lucide-react";

// --- Placeholder FileUpload Component ---
// This is added to resolve potential import errors. Replace with your actual component.
const FileUpload = ({
  initialImages,
  onChange,
}: {
  initialImages: string[];
  onChange: (urls: string[]) => void;
}) => {
  const [previews, setPreviews] = useState(initialImages);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      const allPreviews = [...previews, ...newPreviews];
      setPreviews(allPreviews);
      onChange(allPreviews);
      toast.info("Placeholder: Files are not actually uploaded.");
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);
    setPreviews(updatedPreviews);
    onChange(updatedPreviews);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {previews.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-md overflow-hidden">
            <img src={url} alt={`preview ${index}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <Label
          htmlFor="file-upload-dialog"
          className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
        >
          <UploadCloud className="w-8 h-8 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">Upload</span>
        </Label>
        <Input id="file-upload-dialog" type="file" className="hidden" multiple onChange={handleFileChange} />
      </div>
    </div>
  );
};
// --- End of Placeholder ---

interface IImage {
  url: string;
  alt?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  lastIndex?: number;
  images?: IImage[];
  parentCategory?: { _id: string; name: string } | null;
}

export default function EditCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [images, setImages] = useState<IImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
          lastIndex: editing.lastIndex ? Number(editing.lastIndex) : undefined,
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

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
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Manage Categories</CardTitle>
          <a href="/admin/category/create">
            <Button>Create New</Button>
          </a>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Card key={cat._id} className="flex flex-col justify-between shadow-md hover:shadow-xl transition rounded-lg">
                <div className="flex items-center gap-4 p-4">
                  {cat.images?.[0] ? (
                    <img
                      src={cat.images[0].url}
                      alt={cat.name}
                      className="h-16 w-16 rounded-md border object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-md border bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{cat.name}</p>
                    <p className="text-sm text-gray-500">{cat.slug}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {cat.parentCategory ? `Sub of: ${cat.parentCategory.name}` : "Main Category"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 border-t bg-gray-50 rounded-b-lg">
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
                          <DialogTitle>Edit: {editing?.name}</DialogTitle>
                        </DialogHeader>
                        {editing && (
                          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="grid gap-2">
                                <Label>Parent Category</Label>
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
                                    <SelectValue placeholder="None" />
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

                              {/* ✅ Corrected lastIndex input */}
                              <div className="grid gap-2">
                                <Label>Display Order</Label>
                                <Input
                                  type="number"
                                  value={editing.lastIndex || ""}
                                  onChange={(e) =>
                                    setEditing((prev) => (prev ? { ...prev, lastIndex: Number(e.target.value) } : null))
                                  }
                                  placeholder="e.g., 100"
                                />
                              </div>
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

