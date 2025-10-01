// src/app/admin/products/edit/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
// Assuming these are correctly set up in your project
import FileUpload from "@/components/Fileupload"; 
import RichTextEditor from "@/components/RichTextEditor"; 

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, PlusCircle } from "lucide-react";

// --- Type Definitions (Refined) ---

interface IProductImage {
  url: string;
  fileId?: string;
  altText?: string;
}

interface IVariantOption {
  value: string;
  price: number;
  stock: number;
  sku: string;
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

interface IComboProduct {
    product: string; // Product ID (ObjectId as string)
    quantity: number;
}

// Full Product Form Data Structure
interface IFormData {
    name: string;
    slug: string;
    shortName: string;
    description: string;
    price: string;
    originalPrice: string;
    stock: string;
    categoryId: string;
    brand: string;
    warranty: string;
    video: string;
    isFeatured: boolean;
    isActive: boolean;
    tags: string;
    rating: string; // Changed to string for input
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    isCombo: boolean;
    isFreeDelivery: boolean; // NEW
    sold: string; // NEW
    popularityScore: string; // NEW
    status: "DRAFT" | "ACTIVE" | "ARCHIVED"; // NEW
    lastUpdatedIndex: string; // NEW
    advanced: string; // NEW
    duplicateOf: string; // NEW
}

const EditProduct = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [images, setImages] = useState<IProductImage[]>([]);
  const [reviews, setReviews] = useState<IProductImage[]>([]);
  const [specifications, setSpecifications] = useState<ISpecification[]>([]);
  const [variants, setVariants] = useState<IVariant[]>([]);
  const [comboProducts, setComboProducts] = useState<IComboProduct[]>([]); // NEW state

  const [formData, setFormData] = useState<IFormData>({
    name: "",
    slug: "",
    shortName: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "0",
    categoryId: "",
    brand: "",
    warranty: "",
    video: "",
    isFeatured: false,
    isActive: true,
    tags: "",
    rating: "0",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    isCombo: false,
    isFreeDelivery: false, // NEW
    sold: "0", // NEW
    popularityScore: "0", // NEW
    status: "ACTIVE", // NEW
    lastUpdatedIndex: "1", // NEW
    advanced: "100", // NEW
    duplicateOf: "", // NEW
  });

  // Fetch product and categories
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);

      try {
        const categoryRes = await fetch("/api/categories");
        const categoryData = await categoryRes.json();
        if (categoryRes.ok) setCategories(categoryData.categories || []);

        const productRes = await fetch(`/api/products/${id}`);
        const productData = await productRes.json();
        if (!productRes.ok) throw new Error(productData.error || "Failed to fetch product");

        const product = productData.product;
        
        // Map fetched data to form state
        setFormData({
          name: product.name || "",
          slug: product.slug || "",
          shortName: product.shortName || "",
          warranty: product.warranty || "",
          description: product.description || "",
          price: String(product.price || ""),
          originalPrice: String(product.originalPrice || ""),
          stock: String(product.stock ?? "0"),
          categoryId: product.category?._id || "",
          brand: product.brand || "",
          video: product.video || "",
          isFeatured: product.isFeatured ?? false,
          isActive: product.isActive ?? true,
          tags: (product.tags || []).join(", "),
          rating: String(product.rating || "0"),
          seoTitle: product.seoTitle || "",
          seoDescription: product.seoDescription || "",
          seoKeywords: (product.seoKeywords || []).join(", "),
          isCombo: product.isCombo ?? false,
          isFreeDelivery: product.isFreeDelivery ?? false, // NEW
          sold: String(product.sold ?? "0"), // NEW
          popularityScore: String(product.popularityScore ?? "0"), // NEW
          status: product.status || "ACTIVE", // NEW
          lastUpdatedIndex: String(product.lastUpdatedIndex ?? ""), // NEW
          advanced: String(product.advanced ?? "100"), // NEW
          duplicateOf: product.duplicateOf || "", // NEW
        });
        
        setImages(product.images || []);
        setReviews(product.reviews || []);
        setSpecifications(product.specifications || []);
        setComboProducts(product.comboProducts || []); // NEW
        
        // Ensure variant options have required fields
        setVariants(
          product.variants?.map((v: any) => ({
            name: v.name,
            options: v.options?.map((o: IVariantOption) => ({
                value: o.value || "", 
                price: o.price ?? 0, 
                stock: o.stock ?? 0, 
                sku: o.sku || "",
            })) || [{ value: "", price: 0, stock: 0, sku: "" }],
          })) || []
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (field: keyof IFormData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };
  
  const handleSelectChange = (field: keyof IFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleDescriptionChange = (html: string) => {
    setFormData(prev => ({ ...prev, description: html }));
  };

  // --- Specifications Logic ---
  const handleSpecChange = (i: number, key: keyof ISpecification, value: string) => {
    setSpecifications((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [key]: value };
      return updated;
    });
  };

  const addSpecification = () => setSpecifications([...specifications, { key: "", value: "" }]);
  const removeSpecification = (i: number) => setSpecifications(prev => prev.filter((_, index) => index !== i));


  // --- Variants Logic (Kept mostly as is - it's already complex and functional) ---
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
  
  const handleImagePick = async () => {
    const url = prompt("Please enter the image URL:");
    return url;
  };
  
  // --- Combo Products Logic (NEW) ---
  const handleComboChange = (i: number, field: keyof IComboProduct, value: string | number) => {
      setComboProducts(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], [field]: field === 'quantity' ? Number(value) : value };
          return updated;
      });
  };
  
  const addComboProduct = () => {
      setComboProducts([...comboProducts, { product: "", quantity: 1 }]);
  };
  
  const removeComboProduct = (i: number) => {
      setComboProducts(prev => prev.filter((_, index) => index !== i));
  };
  
  // --- Submission Logic ---
  const handleSubmit = async () => {
    const validSpecs = specifications.filter((s) => s.key && s.value);
    const selectedCategory = categories.find((c) => c._id === formData.categoryId);

    if (!formData.name || !formData.price || !selectedCategory ) {
      toast.error("Please fill all required fields and select a category.");
      return;
    }

    setLoading(true);
    try {
      // 1. Prepare the Body
      const body = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice || 0),
        stock: Number(formData.stock || 0),
        rating: Number(formData.rating || 0),
        sold: Number(formData.sold || 0), // NEW
        popularityScore: Number(formData.popularityScore || 0), // NEW
        lastUpdatedIndex: Number(formData.lastUpdatedIndex || 0), // NEW
        advanced: Number(formData.advanced || 100), // NEW
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        seoKeywords: formData.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        images,
        reviews,
        specifications: validSpecs,
        category: selectedCategory,
        comboProducts: formData.isCombo ? comboProducts.filter(cp => cp.product && cp.quantity > 0) : [], // NEW
        
        ...(variants.length > 0 && {
          variants: variants
            .filter(v => v.name) // Only include variants with a name
            .map((v) => ({ 
                name: v.name, 
                options: v.options.filter((o) => o.value) // Only include options with a value
            }))
        }),
      };

      // 2. API Call
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error(data.error || "Failed to update product!");
        return;
      }
      
      // 3. Success
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-7xl mx-auto p-1 md:p-8 space-y-8"
    >
      <h1 className="text-3xl font-bold border-b pb-2">Edit Product: {formData.name || id}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Details (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">

          <Card>
            <CardHeader><h2 className="text-xl font-semibold">Essential Details</h2></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name*" required />
              <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug" />
              <Input name="shortName" value={formData.shortName} onChange={handleChange} placeholder="Short Name" />
              
              <Input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price*" required />
              <Input name="originalPrice" type="number" value={formData.originalPrice} onChange={handleChange} placeholder="Original Price" />
              <Input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="Stock" />
              
              <Input name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand" />
              <Input name="warranty" value={formData.warranty} onChange={handleChange} placeholder="Warranty" />
              <Input name="video" value={formData.video} onChange={handleChange} placeholder="Video URL" />
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
            <CardHeader><h2 className="text-xl font-semibold">Images & Media</h2></CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="mb-2 block">Product Images (Primary)</Label>
                    <FileUpload
                        initialImages={images.map((img) => img.url)}
                        onChange={(urls: string[]) => setImages(urls.map((url) => ({ url })))}
                    />
                </div>
                <div>
                    <Label className="mb-2 block">Review Images (Optional)</Label>
                    <FileUpload
                        initialImages={reviews.map((img) => img.url)}
                        onChange={(urls: string[]) => setReviews(urls.map((url) => ({ url })))}
                    />
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><h2 className="text-xl font-semibold">SEO</h2></CardHeader>
            <CardContent className="space-y-4">
              <Input name="seoTitle" value={formData.seoTitle} onChange={handleChange} placeholder="SEO Title" />
              <Input name="seoDescription" value={formData.seoDescription} onChange={handleChange} placeholder="SEO Description" />
              <Input name="seoKeywords" value={formData.seoKeywords} onChange={handleChange} placeholder="SEO Keywords (comma separated)" />
            </CardContent>
          </Card>

          {/* New Advanced Info Card */}
          <Card>
              <CardHeader><h2 className="text-xl font-semibold">Advanced Tracking & Scoring</h2></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input name="sold" type="number" value={formData.sold} onChange={handleChange} placeholder="Units Sold" />
                  <Input name="popularityScore" type="number" value={formData.popularityScore} onChange={handleChange} placeholder="Popularity Score" />
                  <Input name="lastUpdatedIndex" type="number" value={formData.lastUpdatedIndex} onChange={handleChange} placeholder="Last Updated Index" />
                  <Input name="advanced" type="number" value={formData.advanced} onChange={handleChange} placeholder="Advanced Payment" />
                  <Input name="duplicateOf" value={formData.duplicateOf} onChange={handleChange} placeholder="Duplicate Of (Product ID)" className="md:col-span-2" />
              </CardContent>
          </Card>

        </div>
        
        {/* RIGHT COLUMN: Options and Meta (1/3 width on large screens) */}
        <div className="lg:col-span-1 space-y-6">
          
          <Card>
            <CardHeader><h2 className="text-xl font-semibold">Category & Status</h2></CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Category*</Label>
                    <Select onValueChange={(val) => handleSelectChange("categoryId", val)} value={formData.categoryId}>
                        <SelectTrigger><SelectValue placeholder="Select Category*" /></SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select onValueChange={(val) => handleSelectChange("status", val as IFormData["status"])} value={formData.status}>
                        <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                            <SelectItem value="DRAFT">DRAFT</SelectItem>
                            <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="text-xl font-semibold">Flags & Toggles</h2></CardHeader>
            <CardContent className="space-y-3">
              {[
                { field: "isActive", label: "Is Active (Visible)" },
                { field: "isFeatured", label: "Is Featured" },
                { field: "isCombo", label: "Is Combo Product" },
                { field: "isFreeDelivery", label: "Has Free Delivery" }, // NEW
              ].map(({ field, label }) => (
                <div key={field} className="flex items-center justify-between">
                  <Label htmlFor={field}>{label}</Label>
                  <Switch 
                    id={field}
                    checked={formData[field as keyof IFormData] as boolean} 
                    onCheckedChange={(val) => handleSwitchChange(field as keyof IFormData, val)}
                  />
                </div>
              ))}
                <div className="space-y-2 pt-4">
                    <Label>Rating (0-5)</Label>
                    <Input name="rating" type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={handleChange} placeholder="Rating" />
                </div>
            </CardContent>
          </Card>

        </div>
      </div>
      
      {/* FULL WIDTH SECTIONS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold">Specifications</h2>
          <Button type="button" onClick={addSpecification} size="sm" className="flex items-center gap-1">
            <PlusCircle className="w-4 h-4" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {specifications.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_40px] gap-2">
              <Input value={s.key} onChange={(e) => handleSpecChange(i, "key", e.target.value)} placeholder="Key (e.g. Dimensions)" />
              <Input value={s.value} onChange={(e) => handleSpecChange(i, "value", e.target.value)} placeholder="Value (e.g. 10x20x5 cm)" />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeSpecification(i)} className="text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Combo Products (NEW) */}
      {formData.isCombo && (
          <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="text-xl font-semibold">Combo Products</h2>
                  <Button type="button" onClick={addComboProduct} size="sm" className="flex items-center gap-1">
                      <PlusCircle className="w-4 h-4" /> Add Product
                  </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                  {comboProducts.map((cp, i) => (
                      <div key={i} className="grid grid-cols-[3fr_1fr_40px] gap-2 items-center">
                          <Input value={cp.product} onChange={(e) => handleComboChange(i, "product", e.target.value)} placeholder="Product ID (e.g. 60f7a...)" />
                          <Input type="number" value={cp.quantity} onChange={(e) => handleComboChange(i, "quantity", e.target.value)} placeholder="Quantity" />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeComboProduct(i)} className="text-red-500 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                          </Button>
                      </div>
                  ))}
              </CardContent>
          </Card>
      )}

      {/* Variants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold">Variants</h2>
            <Button type="button" onClick={addVariant} size="sm" className="flex items-center gap-1">
                <PlusCircle className="w-4 h-4" /> Add Variant
            </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {variants.map((variant, vi) => (
            <div key={vi} className="space-y-4 border p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <Input value={variant.name} onChange={(e) => handleVariantChange(vi, "name", e.target.value)} placeholder="Variant Name (e.g. Size, Color)" className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => addVariantOption(vi)} className="flex items-center gap-1">
                    <PlusCircle className="w-4 h-4" /> Add Option
                </Button>
                <Button variant="ghost" size="icon" onClick={() => removeVariant(vi)} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-5 text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-1">
                    <div className="col-span-1">Value</div>
                    <div className="col-span-1">Price</div>
                    <div className="col-span-1">Stock</div>
                    <div className="col-span-1">SKU</div>
                    <div className="col-span-1"></div>
                </div>
                
                {variant.options.map((opt, oi) => (
                  <div key={oi} className="grid grid-cols-5 gap-2 items-center">
                    <Input value={opt.value} onChange={(e) => handleVariantOptionChange(vi, oi, "value", e.target.value)} placeholder="Value" />
                    <Input type="number" value={opt.price} onChange={(e) => handleVariantOptionChange(vi, oi, "price", e.target.value)} placeholder="Price" />
                    <Input type="number" value={opt.stock} onChange={(e) => handleVariantOptionChange(vi, oi, "stock", e.target.value)} placeholder="Stock" />
                    <Input value={opt.sku} onChange={(e) => handleVariantOptionChange(vi, oi, "sku", e.target.value)} placeholder="SKU" />
                    <Button variant="ghost" size="icon" onClick={() => removeVariantOption(vi, oi)} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>


      <Button onClick={handleSubmit} disabled={loading} className="w-full mb-2 h-12 text-lg sticky bottom-0 bg-primary hover:bg-primary/90">
        {loading ? "Updating Product..." : "Save Changes"}
      </Button>
    </motion.div>
  );
};

export default EditProduct;