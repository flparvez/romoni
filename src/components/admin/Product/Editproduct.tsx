// src/app/admin/products/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import {  useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import FileUpload from "@/components/Fileupload";
import RichTextEditor from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, PlusCircle } from "lucide-react";

// --- Type Definitions ---
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
  product: string;
  quantity: number;
}
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
  rating: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  isCombo: boolean;
  isFreeDelivery: boolean;
  sold: string;
  popularityScore: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  lastUpdatedIndex: string;
  advanced: string;
  duplicateOf: string;
}

// ===== Component Start =====
const EditProduct = ({id}: { id: string }) => {
  const router = useRouter();
 
  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [images, setImages] = useState<IProductImage[]>([]);
  const [reviews, setReviews] = useState<IProductImage[]>([]);
  const [specifications, setSpecifications] = useState<ISpecification[]>([]);
  const [variants, setVariants] = useState<IVariant[]>([]);
  const [comboProducts, setComboProducts] = useState<IComboProduct[]>([]);

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
    isFreeDelivery: false,
    sold: "0",
    popularityScore: "0",
    status: "ACTIVE",
    lastUpdatedIndex: "0",
    advanced: "100",
    duplicateOf: "",
  });

  // ===== Data Fetching =====
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [categoryRes, productRes] = await Promise.all([
          fetch("/api/categories", { next: { revalidate: 60 }, cache: "force-cache" }),
          fetch(`/api/products/${id}`, { next: { revalidate: 60 }, cache: "force-cache" }),
        ]);

        const categoryData = await categoryRes.json();
        if (categoryRes.ok) setCategories(categoryData.categories || []);

        const productData = await productRes.json();
        if (!productRes.ok) throw new Error(productData.error || "Failed to fetch product");
        const product = productData.product;

        // --- Map fetched data to form state ---
        setFormData({
          name: product.name || "",
          slug: product.slug || "",
          shortName: product.shortName || "",
          description: product.description || "",
          price: String(product.price || ""),
          originalPrice: String(product.originalPrice || ""),
          stock: String(product.stock ?? "0"),
          categoryId: product.category?._id || "",
          brand: product.brand || "",
          warranty: product.warranty || "",
          video: product.video || "",
          isFeatured: product.isFeatured ?? false,
          isActive: product.isActive ?? true,
          tags: (product.tags || []).join(", "),
          rating: String(product.rating || "0"),
          seoTitle: product.seoTitle || "",
          seoDescription: product.seoDescription || "",
          seoKeywords: (product.seoKeywords || []).join(", "),
          isCombo: product.isCombo ?? false,
          isFreeDelivery: product.isFreeDelivery ?? false,
          sold: String(product.sold ?? "0"),
          popularityScore: String(product.popularityScore ?? "0"),
          status: product.status || "ACTIVE",
          lastUpdatedIndex: String(product.lastUpdatedIndex ?? ""),
          advanced: String(product.advanced ?? "100"),
          duplicateOf: product.duplicateOf || "",
        });
        
        setImages(product.images || []);
        setReviews(product.reviews || []);
        setSpecifications(product.specifications || []);
        setComboProducts(product.comboProducts || []);
        setVariants(product.variants?.map((v: any) => ({
            name: v.name,
            options: v.options?.map((o: IVariantOption) => ({
                value: o.value || "",
                price: o.price ?? 0,
                stock: o.stock ?? 0,
                sku: o.sku || "",
            })) || [],
        })) || []);

      } catch (err) {
        console.error(err);
        toast.error("প্রোডাক্টের ডেটা লোড করতে ব্যর্থ হয়েছে।");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

    // ===== Handlers =====
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
    const handleImagePick = async () => prompt("Please enter the image URL:");

  // --- Specifications Logic ---
    const handleSpecChange = (i: number, key: keyof ISpecification, value: string) => {
        setSpecifications(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], [key]: value };
            return updated;
        });
    };
    const addSpecification = () => setSpecifications([...specifications, { key: "", value: "" }]);
    const removeSpecification = (i: number) => setSpecifications(prev => prev.filter((_, index) => index !== i));

  // --- Variants Logic ---
    const handleVariantChange = (i: number, key: keyof IVariant, value: string) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], [key]: value };
            return updated;
        });
    };
    const handleVariantOptionChange = (vi: number, oi: number, key: keyof IVariantOption, value: string | number) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[vi].options[oi] = { ...updated[vi].options[oi], [key]: value };
            return updated;
        });
    };
    const addVariant = () => setVariants([...variants, { name: "", options: [] }]);
    const removeVariant = (index: number) => setVariants(prev => prev.filter((_, i) => i !== index));
    const addVariantOption = (vi: number) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[vi].options.push({ value: "", price: Number(formData.price || 0), stock: Number(formData.stock || 0), sku: "" });
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

  // --- Combo Products Logic ---
    const handleComboChange = (i: number, field: keyof IComboProduct, value: string | number) => {
        setComboProducts(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], [field]: field === 'quantity' ? Number(value) : value };
            return updated;
        });
    };
    const addComboProduct = () => setComboProducts([...comboProducts, { product: "", quantity: 1 }]);
    const removeComboProduct = (i: number) => setComboProducts(prev => prev.filter((_, index) => index !== i));

  // ===== Submit Handler =====
  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("অনুগ্রহ করে প্রয়োজনীয় ঘরগুলো পূরণ করুন (নাম, মূল্য, ক্যাটাগরি)।");
      return;
    }
    setLoading(true);
    try {
      const body = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice || formData.price + 250),
        stock: Number(formData.stock || 0),
        rating: Number(formData.rating || 0),
        sold: Number(formData.sold || 0),
        popularityScore: Number(formData.popularityScore || 0),
        lastUpdatedIndex: Number(formData.lastUpdatedIndex || 0),
        advanced: Number(formData.advanced || 100),
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        seoKeywords: formData.seoKeywords.split(",").map(k => k.trim()).filter(Boolean),
        images,
        reviews,
        specifications: specifications.filter(s => s.key && s.value),
        category: categories.find(c => c._id === formData.categoryId),
        comboProducts: formData.isCombo ? comboProducts.filter(cp => cp.product && cp.quantity > 0) : [],
        variants: variants.filter(v => v.name).map(v => ({
            name: v.name,
            options: v.options.filter(o => o.value)
        })),
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
 
      setLoading(false);
      if (!res.ok) throw new Error(data.error || "প্রোডাক্ট আপডেট করতে ব্যর্থ হয়েছে!");
      
      toast.success("✅ প্রোডাক্ট সফলভাবে আপডেট হয়েছে!");
      router.push("/admin/products");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "কিছু ভুল হয়েছে!");
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return <div className="p-8 text-center">প্রোডাক্টের বিবরণ লোড হচ্ছে...</div>
  }
    
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">📝 প্রোডাক্ট এডিট করুন: {formData.name}</h1>

      {/* ✅ মৌলিক তথ্য */}
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">মৌলিক তথ্য</h2></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>প্রোডাক্ট নাম*</Label><Input name="name" value={formData.name} onChange={handleChange} /></div>
          <div><Label>স্লাগ</Label><Input name="slug" value={formData.slug} onChange={handleChange} /></div>
          <div><Label>ছোট নাম</Label><Input name="shortName" value={formData.shortName} onChange={handleChange} /></div>
          <div><Label>মূল্য*</Label><Input name="price" type="number" value={formData.price} onChange={handleChange} /></div>
          <div><Label>আসল মূল্য</Label><Input name="originalPrice" type="number" value={formData.originalPrice} onChange={handleChange} /></div>
          <div><Label>স্টক</Label><Input name="stock" type="number" value={formData.stock} onChange={handleChange} /></div>
     
          <div><Label>ওয়ারেন্টি</Label><Input name="warranty" value={formData.warranty} onChange={handleChange} /></div>
          <div><Label>ভিডিও লিংক</Label><Input name="video" value={formData.video} onChange={handleChange} /></div>
        </CardContent>
      </Card>

      {/* ✅ ক্যাটাগরি ও স্ট্যাটাস */}
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">ক্যাটাগরি ও স্ট্যাটাস</h2></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                 <Label>ক্যাটাগরি*</Label>
                 <Select onValueChange={(val) => handleSelectChange("categoryId", val)} value={formData.categoryId}>
                     <SelectTrigger><SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন*" /></SelectTrigger>
                     <SelectContent>
                         {categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                     </SelectContent>
                 </Select>
            </div>
            <div>
                 <Label>প্রোডাক্ট স্ট্যাটাস</Label>
                 <Select onValueChange={(val) => handleSelectChange("status", val as IFormData["status"])} value={formData.status}>
                     <SelectTrigger><SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" /></SelectTrigger>
                     <SelectContent>
                         <SelectItem value="ACTIVE">সক্রিয়</SelectItem>
                         <SelectItem value="DRAFT">ড্রাফট</SelectItem>
                         <SelectItem value="ARCHIVED">আর্কাইভ</SelectItem>
                     </SelectContent>
                 </Select>
            </div>
        </CardContent>
      </Card>

      {/* ✅ বিবরণ */}
       <Card>
           <CardHeader><h2 className="text-xl font-semibold">বিবরণ</h2></CardHeader>
           <CardContent>
               <RichTextEditor value={formData.description} onChange={handleDescriptionChange} onPickImage={handleImagePick} />
           </CardContent>
       </Card>

      {/* ✅ ছবি ও মিডিয়া */}
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">ছবি ও মিডিয়া</h2></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-2 block font-medium">প্রোডাক্ট ছবি (প্রধান)</Label>
            <FileUpload initialImages={images.map((img) => img.url)} onChange={(urls: string[]) => setImages(urls.map((url) => ({ url })))} />
          </div>
          <div>
            <Label className="mb-2 block font-medium">রিভিউ ছবি (ঐচ্ছিক)</Label>
            <FileUpload initialImages={reviews.map((img) => img.url)} onChange={(urls: string[]) => setReviews(urls.map((url) => ({ url })))} />
          </div>
        </CardContent>
      </Card>

      {/* ✅ ভ্যারিয়েন্টস */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold">ভ্যারিয়েন্টস</h2>
          <Button type="button" onClick={addVariant} size="sm" className="flex items-center gap-1"><PlusCircle className="w-4 h-4" /> নতুন ভ্যারিয়েন্ট</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.map((variant, vi) => (
            <div key={vi} className="space-y-3 border p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <Input value={variant.name} onChange={(e) => handleVariantChange(vi, "name", e.target.value)} placeholder="ভ্যারিয়েন্টের নাম (যেমন: সাইজ, রঙ)" />
                <Button variant="outline" size="sm" onClick={() => addVariantOption(vi)}><PlusCircle className="w-4 h-4 mr-1" /> অপশন যোগ করুন</Button>
                <Button variant="ghost" size="icon" onClick={() => removeVariant(vi)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
              </div>
              {variant.options.map((opt, oi) => (
                <div key={oi} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-center">
                  <Input value={opt.value} onChange={(e) => handleVariantOptionChange(vi, oi, "value", e.target.value)} placeholder="মান" />
                  <Input type="number" value={opt.price} onChange={(e) => handleVariantOptionChange(vi, oi, "price", e.target.value)} placeholder="মূল্য" />
                  <Input type="number" value={opt.stock} onChange={(e) => handleVariantOptionChange(vi, oi, "stock", e.target.value)} placeholder="স্টক" />
                  <Input value={opt.sku} onChange={(e) => handleVariantOptionChange(vi, oi, "sku", e.target.value)} placeholder="SKU" />
                  <Button variant="ghost" size="icon" onClick={() => removeVariantOption(vi, oi)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* ✅ স্পেসিফিকেশন */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold">স্পেসিফিকেশন</h2>
          <Button type="button" onClick={addSpecification} size="sm" className="flex items-center gap-1"><PlusCircle className="w-4 h-4" /> আইটেম যোগ করুন</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {specifications.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input value={s.key} onChange={(e) => handleSpecChange(i, "key", e.target.value)} placeholder="Key (e.g. Dimensions)" />
              <Input value={s.value} onChange={(e) => handleSpecChange(i, "value", e.target.value)} placeholder="Value (e.g. 10x20x5 cm)" />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeSpecification(i)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ✅ ফ্ল্যাগ ও টগল */}
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">ফ্ল্যাগ ও টগল</h2></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[ { field: "isActive", label: "সক্রিয়" }, { field: "isFeatured", label: "ফিচার্ড" }, { field: "isCombo", label: "কম্বো" }, { field: "isFreeDelivery", label: "ফ্রি ডেলিভারি" },].map(({ field, label }) => (
              <div key={field} className="flex items-center space-x-2">
                <Switch id={field} checked={formData[field as keyof IFormData] as boolean} onCheckedChange={(val) => handleSwitchChange(field as keyof IFormData, val)} />
                <Label htmlFor={field}>{label}</Label>
              </div>
            ))}
          </div>
          {formData.isCombo && (
            <div className="pt-4">
                 <h3 className="text-lg font-semibold mb-2">কম্বো প্রোডাক্ট</h3>
                 {comboProducts.map((cp, i) => (
                     <div key={i} className="grid grid-cols-[3fr_1fr_auto] gap-2 items-center mb-2">
                         <Input value={cp.product} onChange={(e) => handleComboChange(i, "product", e.target.value)} placeholder="প্রোডাক্ট আইডি (যেমন: 60f7a...)" />
                         <Input type="number" value={cp.quantity} onChange={(e) => handleComboChange(i, "quantity", e.target.value)} placeholder="পরিমাণ" />
                         <Button type="button" variant="ghost" size="icon" onClick={() => removeComboProduct(i)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                     </div>
                 ))}
                 <Button type="button" onClick={addComboProduct} size="sm" variant="outline"><PlusCircle className="w-4 h-4 mr-1" /> কম্বো প্রোডাক্ট যোগ করুন</Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* ✅ এসইও */}
       <Card>
           <CardHeader><h2 className="text-xl font-semibold">এসইও</h2></CardHeader>
           <CardContent className="space-y-4">
              <div><Label>এসইও টাইটেল</Label><Input name="seoTitle" value={formData.seoTitle} onChange={handleChange} /></div>
              <div><Label>এসইও বিবরণ</Label><Input name="seoDescription" value={formData.seoDescription} onChange={handleChange} /></div>
              <div><Label>এসইও কীওয়ার্ডস (কমা দিয়ে)</Label><Input name="seoKeywords" value={formData.seoKeywords} onChange={handleChange} /></div>
           </CardContent>
       </Card>

      {/* ✅ অ্যাডভান্সড */}
      <Card>
          <CardHeader><h2 className="text-xl font-semibold">অ্যাডভান্সড ট্র্যাকিং ও স্কোরিং</h2></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>বিক্রিত ইউনিট</Label><Input name="sold" type="number" value={formData.sold} onChange={handleChange} /></div>
              <div><Label>রেটিং (০-৫)</Label><Input name="rating" type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={handleChange} /></div>
              <div><Label>Last Updated স্কোর</Label><Input name="lastUpdatedIndex" type="number" value={formData.lastUpdatedIndex} onChange={handleChange} /></div>

              <div><Label>পপুলারিটি স্কোর</Label><Input name="popularityScore" type="number" value={formData.popularityScore} onChange={handleChange} /></div>
              <div><Label>অ্যাডভান্সড পেমেন্ট</Label><Input name="advanced" type="number" value={formData.advanced} onChange={handleChange} /></div>
   
          </CardContent>
      </Card>
      
      <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 text-lg sticky bottom-9 mb-9">
        {loading ? "আপডেট হচ্ছে..." : "পরিবর্তন সেভ করুন"}
      </Button>
    </motion.div>
  );
};

export default EditProduct;