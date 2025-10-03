"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { UploadCloud, X } from "lucide-react"

// --- Placeholder FileUpload Component ---
// To resolve the import error, I've created a placeholder.
// You should replace this with the actual code from your FileUpload component.
const FileUpload = ({
  initialImages,
  onChange,
}: {
  initialImages: string[]
  onChange: (urls: string[]) => void
}) => {
  const [previews, setPreviews] = useState(initialImages)

  // This is a mock upload handler. Replace with your actual upload logic.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      const allPreviews = [...previews, ...newPreviews]
      setPreviews(allPreviews)
      // In a real app, you would upload the files and then call onChange with the returned URLs.
      // For this placeholder, we'll just use the object URLs.
      onChange(allPreviews)
      toast.info("This is a placeholder. No files were actually uploaded.")
    }
  }

  const removeImage = (indexToRemove: number) => {
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove)
    setPreviews(updatedPreviews)
    onChange(updatedPreviews)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
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
          htmlFor="file-upload"
          className="aspect-square rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <UploadCloud className="w-8 h-8 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">Upload</span>
        </Label>
        <Input id="file-upload" type="file" className="hidden" multiple onChange={handleFileChange} />
      </div>
    </div>
  )
}
// --- End of Placeholder ---

interface Category {
  _id: string
  name: string
  slug: string
  lastIndex?: number
  images?: string[]
  parentCategory?: { _id: string; name: string } | null
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState("")

  const [parent, setParent] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [lastIndex, setLastIndex] = useState<number | string>("")

  useEffect(() => {
    setLoading(true)
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories || [])
        } else {
          toast.error("Failed to fetch categories.")
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
       
          parentCategory: parent || null,
          images: !parent ? images : [],
          lastIndex: lastIndex ? Number(lastIndex) : undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Category created successfully!")
        setCategories((prev) => [data.category, ...prev])
        setName("")
   
        setParent(null)
        setImages([])
        setLastIndex("")
      } else {
        toast.error(data.error || "Failed to create category")
      }
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Category / Subcategory</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
        
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Parent Category (optional)</Label>
                <Select
                  onValueChange={(val) => setParent(val === "none" ? null : val)}
                  value={parent ?? "none"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (Main Category)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Main Category)</SelectItem>
                    {categories
                      .filter((c) => !c.parentCategory)
                      .map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastIndex">Last Index</Label>
                <Input
                  id="lastIndex"
                  type="number"
                  value={lastIndex}
                  onChange={(e) => setLastIndex(e.target.value)}
                  placeholder="e.g., 1,2"
                />
              </div>
            </div>

            {!parent && (
              <div className="grid gap-2">
                <Label>Category Images</Label>
                <FileUpload
                  initialImages={images}
                  onChange={(urls: string[]) => setImages(urls)}
                />
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Category"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

