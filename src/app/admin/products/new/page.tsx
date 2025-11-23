"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Trash2, Plus, ArrowLeft, Save, LayoutGrid } from "lucide-react";

// Components
import FileUpload from "@/components/Fileupload";
import RichTextEditor from "@/components/RichTextEditor"; // Your provided component
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// ===== Interfaces =====
interface IProductImage { url: string; fileId?: string; altText?: string; }
interface IVariantOption { value: string; price: number; stock: number; sku?: string; }
interface IVariant { name: string; options: IVariantOption[]; }
interface ICategory { _id: string; name: string; slug: string; }

const CreateProduct = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  
  // States
  const [images, setImages] = useState<IProductImage[]>([]);
  const [variants, setVariants] = useState<IVariant[]>([
    { name: "Color", options: [] }, 
    { name: "Size", options: [] }
  ]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isShortNameModified, setIsShortNameModified] = useState(false); // Track if user manually edited short name

  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    description: "",
    price: "",
    originalPrice: "",
    costPrice: "", 
    stock: "0",
    sku: "",
    categoryId: "",
    warranty: "",
    video: "",
    isFeatured: false,
    isActive: true,
    isCombo: false,
    rating: 0,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  // Business Logic: Profit & Discount
  const priceNum = Number(formData.price) || 0;
  const originalPriceNum = Number(formData.originalPrice) || 0;
  const costPriceNum = Number(formData.costPrice) || 0;
  
  const discountPercent = originalPriceNum > priceNum 
    ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100) 
    : 0;
    
  const profit = priceNum - costPriceNum;
  const profitMargin = priceNum > 0 ? ((profit / priceNum) * 100).toFixed(1) : 0;

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories", { next: { revalidate: 60 } });
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err){
         console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // ===== Handlers =====

  // Smart Name Handler (Syncs with Short Name)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: value,
      // Only sync if user hasn't manually edited short name
      shortName: isShortNameModified ? prev.shortName : value 
    }));
  };

  const handleShortNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, shortName: e.target.value }));
    setIsShortNameModified(true); // Stop auto-sync
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Rich Text Image Picker (Promisified for your component)
  const handleImagePick = async (): Promise<string | null> => {
    const url = prompt("Please enter the image URL:");
    return url;
  };

  const handleDescriptionChange = (html: string) => {
    setFormData((prev) => ({ ...prev, description: html }));
  };

  // Tag Handler
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Variant Handlers
  const addVariantOption = (vi: number) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[vi].options.push({ value: "", price: priceNum, stock: Number(formData.stock), sku: formData.sku });
      return updated;
    });
  };

  const updateVariantOption = (vi: number, oi: number, field: string, val: any) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[vi].options[oi] = { ...updated[vi].options[oi], [field]: val };
      return updated;
    });
  };

  const removeVariantOption = (vi: number, oi: number) => {
    setVariants((prev) => {
        const updated = [...prev];
        updated[vi].options = updated[vi].options.filter((_, i) => i !== oi);
        return updated;
    })
  }

  // Submit Handler
  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.categoryId || images.length === 0) {
      toast.error("পণ্যের নাম, দাম, ক্যাটাগরি এবং ছবি আবশ্যক!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: priceNum,
        originalPrice: originalPriceNum,
        costPrice: costPriceNum,
        stock: Number(formData.stock),
        images,
        category: { _id: formData.categoryId },
        tags: tags,
        seoKeywords: tags,
        variants: variants.map(v => ({...v, options: v.options.filter(o => o.value)})),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("✅ প্রোডাক্ট সফলভাবে তৈরি হয়েছে!");
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.message || "এরর হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="w-full px-0 sm:px-4 md:px-6 pb-20" // Zero padding on mobile, slight padding on larger screens
    >
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b mb-6 px-4 py-3 -mx-4 sm:mx-0 sm:px-0 sm:rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-5 h-5"/></Button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 hidden sm:block">নতুন প্রোডাক্ট আপলোড</h1>
            <h1 className="text-lg font-bold text-gray-800 sm:hidden">Add Product</h1>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/admin/products')}>বাতিল</Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-primary min-w-[120px]">
                {loading ? (
                    "সেভ হচ্ছে..."
                ) : (
                    <span className="flex items-center gap-2"><Save className="w-4 h-4"/> পাবলিশ করুন</span>
                )}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (Main Info) - Takes 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Basic Info */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader><CardTitle className="flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-gray-500"/> মৌলিক তথ্য</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              
              <div className="space-y-2">
                <Label className="text-base">পণ্যের নাম <span className="text-red-500">*</span></Label>
                <Input 
                    name="name" 
                    placeholder="যেমন: Wireless Headphone..." 
                    value={formData.name} 
                    onChange={handleNameChange} 
                    className="text-lg h-12 font-medium" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>ছোট নাম (Short Name)</Label>
                    <Input 
                        name="shortName" 
                        value={formData.shortName} 
                        onChange={handleShortNameChange} 
                        placeholder="অটো জেনারেট হবে অথবা এডিট করুন"
                        className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground">ইনভয়েস এবং এসএসএম এর জন্য ব্যবহৃত হবে</p>
                </div>
                <div className="space-y-2">
                    <Label>ব্র্যান্ড / ওয়ারেন্টি</Label>
                    <Input name="warranty" value={formData.warranty} onChange={handleChange} placeholder="7 Days Warranty"/>
                </div>
              </div>

              <div className="space-y-2">
                <Label>বিবরণ (Description)</Label>
                <div className="prose-sm max-w-none">
                     <RichTextEditor 
                        value={formData.description} 
                        onChange={handleDescriptionChange} 
                        onPickImage={handleImagePick} 
                     />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Media */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader><CardTitle>ছবি এবং ভিডিও</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <Label>প্রোডাক্ট গ্যালারি (প্রথম ছবিটি কভার হবে)</Label>
               <FileUpload initialImages={images.map(i => i.url)} onChange={(urls) => setImages(urls.map(u => ({ url: u })))} />
               
               <div className="pt-2">
                 <Label>ইউটিউব ভিডিও লিংক (অপশনাল)</Label>
                 <Input name="video" placeholder="https://youtube.com/..." value={formData.video} onChange={handleChange} />
               </div>
            </CardContent>
          </Card>

          {/* 3. Variants */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>ভ্যারিয়েন্ট সেটআপ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {variants.map((variant, vi) => (
                <div key={vi} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">{variant.name}</h4>
                  <div className="space-y-3">
                    {variant.options.map((opt, oi) => (
                      <div key={oi} className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                        <Input placeholder="মান (Red/XL)" value={opt.value} onChange={(e) => updateVariantOption(vi, oi, 'value', e.target.value)} className="w-full md:w-auto md:flex-1" />
                        <Input type="number" placeholder="দাম" value={opt.price} onChange={(e) => updateVariantOption(vi, oi, 'price', e.target.value)} className="w-24 md:w-28" />
                        <Input type="number" placeholder="স্টক" value={opt.stock} onChange={(e) => updateVariantOption(vi, oi, 'stock', e.target.value)} className="w-20 md:w-24" />
                        <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => removeVariantOption(vi, oi)}><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addVariantOption(vi)} className="mt-2 text-xs border-dashed">
                        <Plus className="w-3 h-3 mr-1"/> অপশন যোগ করুন
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (Settings & Pricing) - Takes 1 col */}
        <div className="space-y-6">
          
          {/* Status Panel */}
          <Card className="shadow-sm border-gray-200">
             <CardHeader><CardTitle>পাবলিশিং স্ট্যাটাস</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                    <Label className="cursor-pointer" htmlFor="active-switch">Active Status</Label>
                    <Switch id="active-switch" checked={formData.isActive} onCheckedChange={(c) => setFormData(p => ({...p, isActive: c}))} />
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                    <Label className="cursor-pointer" htmlFor="feat-switch">Featured Product</Label>
                    <Switch id="feat-switch" checked={formData.isFeatured} onCheckedChange={(c) => setFormData(p => ({...p, isFeatured: c}))} />
                </div>
                <div className="pt-2">
                   <Label className="mb-2 block font-medium">ক্যাটাগরি <span className="text-red-500">*</span></Label>
                   <Select onValueChange={(v) => setFormData(p => ({...p, categoryId: v}))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="সিলেক্ট করুন..." /></SelectTrigger>
                      <SelectContent>
                          {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
             </CardContent>
          </Card>

          {/* Pricing & Profit (Business Core) */}
          <Card className="border-blue-100 bg-blue-50/20 shadow-none">
            <CardHeader><CardTitle className="text-blue-800">দাম এবং প্রফিট</CardTitle></CardHeader>
            <CardContent className="space-y-5">
               <div className="bg-white p-3 rounded-md border border-blue-100 shadow-sm">
                  <Label className="text-xs uppercase text-gray-500 font-bold">বিক্রয় মূল্য (Sale Price) *</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-bold">৳</span>
                    <Input name="price" type="number" className="pl-8 font-bold text-xl h-12 border-0 focus-visible:ring-0 p-0" placeholder="0" value={formData.price} onChange={handleChange} />
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">আসল দাম (MRP)</Label>
                    <Input name="originalPrice" type="number" value={formData.originalPrice} onChange={handleChange} className="mt-1" />
                    {discountPercent > 0 && <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700">{discountPercent}% OFF</Badge>}
                  </div>
                  <div>
                    <Label className="text-xs">কেনা দাম (Cost)</Label>
                    <Input name="costPrice" type="number" className="mt-1 border-orange-200 focus:border-orange-400" value={formData.costPrice} onChange={handleChange} placeholder="Optional" />
                  </div>
               </div>

               {/* Profit Analysis Visualizer */}
               {priceNum > 0 && costPriceNum > 0 && (
                   <div className={`p-4 rounded-lg border text-sm ${profit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                      <div className="flex justify-between font-bold text-base">
                          <span className={profit >= 0 ? "text-green-800" : "text-red-800"}>
                              {profit >= 0 ? "সম্ভাব্য লাভ" : "লোকসান"}
                          </span>
                          <span className={profit >= 0 ? "text-green-700" : "text-red-700"}>৳ {profit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className={`h-1.5 rounded-full ${profit >= 0 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${Math.min(Number(profitMargin), 100)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs mt-2 font-medium opacity-80">
                          <span>মার্জিন</span>
                          <span>{profitMargin}%</span>
                      </div>
                   </div>
               )}
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader><CardTitle>ইনভেন্টরি</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label>মোট স্টক</Label>
                        <Input name="stock" type="number" value={formData.stock} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>SKU / Barcode</Label>
                        <Input name="sku" value={formData.sku} onChange={handleChange} />
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* Tags / SEO */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader><CardTitle>ট্যাগস (SEO)</CardTitle></CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                    {tags.length === 0 && <span className="text-xs text-gray-400 italic">কোনো ট্যাগ যোগ করা হয়নি</span>}
                    {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1 hover:bg-gray-200">
                            {tag} <Trash2 className="w-3 h-3 cursor-pointer text-gray-500 hover:text-red-500" onClick={() => removeTag(tag)}/>
                        </Badge>
                    ))}
                </div>
                <Input 
                    placeholder="ট্যাগ লিখুন এবং Enter চাপুন..." 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="border-dashed"
                />
            </CardContent>
          </Card>

        </div>
      </div>
    </motion.div>
  );
};

export default CreateProduct;