"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import FileUpload from "@/components/Fileupload" // ✅ use your FileUpload component

interface Category {
  _id: string
  name: string
  slug: string
  images?: string[]
  parentCategory?: { _id: string; name: string } | null
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState("")


  const [parent, setParent] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([]) // ✅ URLs from FileUpload
  const [loading, setLoading] = useState(false)

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
  }, [])

  // Create category
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
          images: !parent ? images : [], // ✅ only allow images if parent === null
        }),
      })

      const data = await res.json()
      if (data.success) {
        setCategories((prev) => [data.category, ...prev])
        setName("")
        
        setParent(null)
        setImages([])
      } else {
        alert(data.error || "Failed to create category")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Category / Subcategory</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
        

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

            {/* ✅ FileUpload only for main category */}
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
              {loading ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

   
    </div>
  )
}
