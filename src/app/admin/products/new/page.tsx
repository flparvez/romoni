"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import FileUpload from "@/components/Fileupload";
import RichTextEditor from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";

interface IProductImage {
  url: string;
  fileId?: string;
  altText?: string;
}

interface IVariantOption {
  value: string;
  price: number;
  stock: number;
  sku?: string;
}

interface IVariant {
  name: string;
  options: IVariantOption[];
}

interface ISpecification {
  key: string;
  value: string;
}

interface ICategory {
  _id: string;
  name: string;
  slug: string;
}

const CreateProduct = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [images, setImages] = useState<IProductImage[]>([]);
  const [reviews, setReviews] = useState<IProductImage[]>([]);
  const [specifications, setSpecifications] = useState<ISpecification[]>([]);
  const [variants, setVariants] = useState<IVariant[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortName: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    categoryId: "",
    brand: "",
    warranty: "",
    video: "",
    isFeatured: false,
    isActive: true,
    tags: "",
    rating: 0,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    isCombo: false,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prev) => ({ ...prev, [target.name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [target.name]: target.value }));
    }
  };

  const handleSwitchChange = (field: keyof typeof formData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSpecChange = (i: number, key: keyof ISpecification, value: string) => {
    setSpecifications((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [key]: value };
      return updated;
    });
  };

  const addSpecification = () => setSpecifications([...specifications, { key: "", value: "" }]);

  const handleVariantChange = (i: number, key: keyof IVariant, value: string) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [key]: value };
      return updated;
    });
  };

  const handleVariantOptionChange = (vi: number, oi: number, key: keyof IVariantOption, value: string | number) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[vi].options[oi] = {
        ...updated[vi].options[oi],
        [key]: key === "price" || key === "stock" ? Number(value) : value,
      };
      return updated;
    });
  };

  const addVariant = () => {
    const defaultPrice = Number(formData.price || 0);
    const defaultStock = Number(formData.stock || 0);

    setVariants([
      ...variants,
      {
        name: "",
        options: [{ value: "", price: defaultPrice, stock: defaultStock, sku: "" }],
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const addVariantOption = (vi: number) => {
    const defaultPrice = Number(formData.price || 0);
    const defaultStock = Number(formData.stock || 0);

    setVariants((prev) => {
      const updated = [...prev];
      updated[vi].options.push({ value: "", price: defaultPrice, stock: defaultStock, sku: "" });
      return updated;
    });
  };
  
  const removeVariantOption = (vi: number, oi: number) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[vi].options = updated[vi].options.filter((_, i) => i !== oi);
      return updated;
    });
  };

  const handleDescriptionChange = (html: string) => {
    setFormData(prev => ({ ...prev, description: html }));
  };

  const handleImagePick = async () => {
    const url = prompt("Please enter the image URL:");
    return url;
  };

  const handleSubmit = async () => {
    const validSpecs = specifications.filter((s) => s.key && s.value);
    const selectedCategory = categories.find((c) => c._id === formData.categoryId);

    if (!formData.name || !formData.price || !selectedCategory || images.length === 0) {
      toast.error("Please fill all required fields and upload at least one image.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          originalPrice: Number(formData.originalPrice || 0),
          stock: Number(formData.stock || 0),
          rating: Number(formData.rating || 0),
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          seoKeywords: formData.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          images,
          reviews,
          specifications: validSpecs,
          // ✅ FIX: Correctly format category data for Mongoose model
          category: {
            _id: selectedCategory._id,
            name: selectedCategory.name,
            slug: selectedCategory.slug,
          },
          variants: variants.map((v) => ({ name: v.name, options: v.options.filter((o) => o.value) })),
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error(data.error || "Failed to create product!");
        return;
      }
      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create Product</h1>
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">Basic Info</h2></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name*" />
          <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug" />
          <Input name="shortName" value={formData.shortName} onChange={handleChange} placeholder="Short Name" />
          <Input name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand" />
          <Input name="warranty" value={formData.warranty} onChange={handleChange} placeholder="warranty" />
          <Input name="video" value={formData.video} onChange={handleChange} placeholder="Video URL" />
          <Input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price*" />
          <Input name="originalPrice" type="number" value={formData.originalPrice} onChange={handleChange} placeholder="Original Price" />
          <Input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="Stock" />
          <Input name="rating" type="number" value={formData.rating} onChange={handleChange} placeholder="Rating" />
          <Input name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags (comma separated)" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">Category & Status</h2></CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-center">
          <Select onValueChange={(val) => setFormData((prev) => ({ ...prev, categoryId: val }))} value={formData.categoryId}>
            <SelectTrigger className="w-full md:w-1/2"><SelectValue placeholder="Select Category*" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-6">
            {["isFeatured", "isActive", "isCombo"].map((field) => (
              <div key={field} className="flex items-center gap-2">
                <Switch checked={formData[field as keyof typeof formData] as boolean} onCheckedChange={(val) => handleSwitchChange(field as keyof typeof formData, val)} />
                <Label>{field}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">Description</h2></CardHeader>
        <CardContent>
          <RichTextEditor
            value={formData.description}
            onChange={handleDescriptionChange}
            onPickImage={handleImagePick}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">Specifications</h2></CardHeader>
        <CardContent className="space-y-3">
          {specifications.map((s, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <Input value={s.key} onChange={(e) => handleSpecChange(i, "key", e.target.value)} placeholder="Key" />
              <Input value={s.value} onChange={(e) => handleSpecChange(i, "value", e.target.value)} placeholder="Value" />
            </div>
          ))}
          <Button type="button" onClick={addSpecification} size="sm">+ Add Specification</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">Variants</h2></CardHeader>
        <CardContent className="space-y-4">
          {variants.map((variant, vi) => (
            <div key={vi} className="space-y-2 border p-3 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Input value={variant.name} onChange={(e) => handleVariantChange(vi, "name", e.target.value)} placeholder="Variant Name (e.g. Size, Color)" />
                <Button variant="ghost" size="icon" onClick={() => removeVariant(vi)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {variant.options.map((opt, oi) => (
                <div key={oi} className="grid grid-cols-4 gap-2">
                  <Input value={opt.value} onChange={(e) => handleVariantOptionChange(vi, oi, "value", e.target.value)} placeholder="Value" />
                  <Input type="number" value={opt.price} onChange={(e) => handleVariantOptionChange(vi, oi, "price", e.target.value)} placeholder="Price" />
                  <Input type="number" value={opt.stock} onChange={(e) => handleVariantOptionChange(vi, oi, "stock", e.target.value)} placeholder="Stock" />
                  <div className="flex items-center gap-2">
                    <Input value={opt.sku} onChange={(e) => handleVariantOptionChange(vi, oi, "sku", e.target.value)} placeholder="SKU" />
                    <Button variant="ghost" size="icon" onClick={() => removeVariantOption(vi, oi)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" onClick={() => addVariantOption(vi)} size="sm">+ Add Option</Button>
            </div>
          ))}
          <Button type="button" onClick={addVariant} size="sm">+ Add Variant</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">Product Images</h2></CardHeader>
        <CardContent>
          <FileUpload
            initialImages={images.map((img) => img.url)}
            onChange={(urls: string[]) => setImages(urls.map((url) => ({ url })))}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">Review Images</h2></CardHeader>
        <CardContent>
          <FileUpload
            initialImages={reviews.map((img) => img.url)}
            onChange={(urls: string[]) => setReviews(urls.map((url) => ({ url })))}
          />
        </CardContent>
      </Card>
      
      <Button onClick={handleSubmit} disabled={loading} className="w-full mt-6">
        {loading ? "Saving..." : "Create Product"}
      </Button>
    </div>
  );
};

export default CreateProduct;
